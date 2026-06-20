import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RedisService } from './redis.service';

const extractJwtFromCookieOrHeader = (req: Request): string | null => {
  if (req && req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  if (req && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    const bearer = parts[0];
    if (parts.length === 2 && bearer && bearer.toLowerCase() === 'bearer') {
      return parts[1] ?? null;
    }
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'super_secret_dev_key_at_least_32_characters_long',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string; role: string }) {
    if (payload && payload.sub) {
      const isSuspended = await this.redisService.exists(`blacklist:user:${payload.sub}`);
      if (isSuspended) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'SUSPENDED',
            message: 'User account has been suspended',
            details: {},
          },
        });
      }
    }

    const token = extractJwtFromCookieOrHeader(req);
    
    // Check if the current token is blacklisted in Redis (user logged out)
    if (token) {
      const isBlacklisted = await this.redisService.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token has been blacklisted',
            details: {},
          },
        });
      }
    }

    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload',
          details: {},
        },
      });
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
