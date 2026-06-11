import { Injectable, UnauthorizedException, ConflictException, HttpStatus, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, Role, Plan, Provider } from '@skillforge/db';
import { RegisterDto, LoginDto } from './auth.dto';
import { RedisService } from './redis.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Helper to hash refresh tokens for storage in sessions collection
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate access and refresh JWT tokens for a user
   */
  private async generateTokens(user: { id: string; email: string; role: string; onboardingComplete: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role, onboardingComplete: user.onboardingComplete };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'super_secret_dev_key_at_least_32_characters_long',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET ?? 'super_secret_refresh_dev_key_at_least_32_characters_long',
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d') as '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Email is already registered',
          details: {},
        },
      });
    }

    // Hash the password with bcrypt (minimum cost factor 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as Role,
        plan: Plan.free,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        onboardingComplete: user.onboardingComplete,
      },
      ...tokens,
    };
  }

  /**
   * Authenticate user credentials with Redis rate limiting
   */
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const rateLimitKey = `login_attempts:${ipAddress}`;
    
    // Check rate limit: 5 attempts per IP per 15 minutes (900 seconds)
    const attempts = await this.redisService.incrAndExpire(rateLimitKey, 900);
    if (attempts > 5) {
      throw new HttpException({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many login attempts. Please try again after 15 minutes.',
          details: {},
        },
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          details: {},
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          details: {},
        },
      });
    }

    // Reset rate limiter on successful login
    await this.redisService.set(rateLimitKey, '0', 1);

    const tokens = await this.generateTokens(user);

    // Save refresh token session to database
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days matching JWT expiration
    
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        onboardingComplete: user.onboardingComplete,
      },
      ...tokens,
    };
  }

  /**
   * Refresh the access and refresh tokens (Refresh Token Rotation)
   */
  async refresh(refreshToken: string, ipAddress: string, userAgent: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET ?? 'super_secret_refresh_dev_key_at_least_32_characters_long',
      });

      const tokenHash = this.hashToken(refreshToken);
      const session = await prisma.session.findUnique({
        where: { tokenHash },
      });

      // If session does not exist in DB or has expired, reject
      if (!session || session.expiresAt < new Date()) {
        if (session) {
          await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
        }
        throw new UnauthorizedException();
      }

      // Delete the old refresh token session (consume it)
      await prisma.session.delete({ where: { tokenHash } }).catch(() => {});

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      // Issue new access and refresh tokens
      const tokens = await this.generateTokens(user);

      // Save new refresh token session to database (rotation)
      const newTokenHash = this.hashToken(tokens.refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt,
          ipAddress,
          userAgent,
        },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
          details: {},
        },
      });
    }
  }

  /**
   * Logout user, invalidating the session and blacklisting the access token
   */
  async logout(accessToken: string, refreshToken: string) {
    // 1. Blacklist access token in Redis
    try {
      const decoded = this.jwtService.decode(accessToken) as { exp?: number };
      if (decoded && decoded.exp) {
        const remainingTtlSeconds = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
        await this.redisService.set(`blacklist:${accessToken}`, '1', remainingTtlSeconds);
      }
    } catch {
      // Decode failed, token might be malformed, ignore blacklist
    }

    // 2. Delete refresh token session from database
    const tokenHash = this.hashToken(refreshToken);
    await prisma.session.delete({ where: { tokenHash } }).catch(() => {});

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access and refresh tokens for a user and save the session in the database
   */
  async generateTokensForUser(
    user: { id: string; email: string; role: string; onboardingComplete: boolean },
    ipAddress: string,
    userAgent: string,
  ) {
    const tokens = await this.generateTokens(user);
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return tokens;
  }

  /**
   * Set authentication cookies (access_token, refresh_token) on Express Response
   */
  setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
      priority: 'high',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      priority: 'high',
    });
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  /**
   * Validate or register user from OAuth provider callbacks (Google/GitHub)
   */
  async validateOAuthUser(
    provider: 'google' | 'github',
    providerId: string,
    email: string,
    name: string,
    avatarUrl?: string,
  ) {
    const dbProvider = provider === 'google' ? Provider.google : Provider.github;

    // 1. Check if OAuth account is already registered
    const oauthAccount = await prisma.oauthAccount.findFirst({
      where: {
        provider: dbProvider,
        providerId,
      },
    });

    let user;

    if (oauthAccount) {
      // Fetch associated user
      const foundUser = await prisma.user.findUnique({
        where: { id: oauthAccount.userId },
      });
      if (foundUser && !foundUser.deletedAt) {
        user = foundUser;
      }
    }

    if (!user && email) {
      // 2. Check if user already exists with this email
      const foundUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (foundUser && !foundUser.deletedAt) {
        user = foundUser;
      }

      if (user) {
        // Link the OAuth account to the existing user
        await prisma.oauthAccount.create({
          data: {
            userId: user.id,
            provider: dbProvider,
            providerId,
          },
        });
      }
    }

    if (!user) {
      // 3. Create a new user (default student role)
      user = await prisma.user.create({
        data: {
          name,
          email: email ? email.toLowerCase() : `oauth-${providerId}@skillforge.local`,
          role: Role.student,
          plan: Plan.free,
          avatarUrl,
        },
      });

      // Create linked OAuth account
      await prisma.oauthAccount.create({
        data: {
          userId: user.id,
          provider: dbProvider,
          providerId,
        },
      });
    }

    // 4. Generate tokens and sessions
    const tokens = await this.generateTokens(user);

    // Save refresh token session to database
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: 'oauth',
        userAgent: 'oauth',
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        onboardingComplete: user.onboardingComplete,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
