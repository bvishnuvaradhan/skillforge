import { Controller, Post, Get, Body, Req, Res, UseGuards, UsePipes, HttpStatus, HttpCode, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from './zod.pipe';
import { registerSchema, loginSchema, RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}



  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.authService.setAuthCookies(res, result);
    return {
      success: true,
      data: {
        user: result.user,
        token: result.accessToken,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await this.authService.login(dto, ipAddress, userAgent);
    this.authService.setAuthCookies(res, result);
    
    return {
      success: true,
      data: {
        user: result.user,
        token: result.accessToken,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    let accessToken = req.cookies?.access_token;
    if (!accessToken && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      const bearer = parts[0];
      if (parts.length === 2 && bearer && bearer.toLowerCase() === 'bearer') {
        accessToken = parts[1];
      }
    }

    const refreshToken = req.cookies?.refresh_token;

    if (accessToken && refreshToken) {
      await this.authService.logout(accessToken, refreshToken);
    }
    
    this.authService.clearAuthCookies(res);
    
    return {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token || req.body?.token;
    if (!refreshToken) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token is missing',
          details: {},
        },
      });
    }

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await this.authService.refresh(refreshToken, ipAddress, userAgent);
    this.authService.setAuthCookies(res, tokens);

    return {
      success: true,
      data: {
        token: tokens.accessToken,
      },
    };
  }

  // --- Testing Endpoints for Guards ---

  @Post('test-protected')
  @UseGuards(JwtAuthGuard)
  testProtected(@Req() req: AuthenticatedRequest) {
    return { success: true, data: req.user };
  }

  @Post('test-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  testAdmin(@Req() req: AuthenticatedRequest) {
    return { success: true, data: req.user };
  }

  // --- OAuth Endpoints ---

  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard handles redirect to Google
  }

  @Get('oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      avatarUrl?: string;
    };

    const result = await this.authService.validateOAuthUser(
      profile.provider as 'google' | 'github',
      profile.providerId,
      profile.email,
      profile.name,
      profile.avatarUrl,
    );

    this.authService.setAuthCookies(res, result);

    const redirectUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/callback`;

    res.redirect(redirectUrl);
  }

  @Get('oauth/github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Guard handles redirect to GitHub
  }

  @Get('oauth/github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      avatarUrl?: string;
    };

    const result = await this.authService.validateOAuthUser(
      profile.provider as 'google' | 'github',
      profile.providerId,
      profile.email,
      profile.name,
      profile.avatarUrl,
    );

    this.authService.setAuthCookies(res, result);

    const redirectUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/callback`;

    res.redirect(redirectUrl);
  }
}
