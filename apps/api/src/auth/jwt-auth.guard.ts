import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser,
    info: { message?: string } | null | undefined,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: info?.message || 'Invalid or expired token',
          details: {},
        },
      });
    }
    return user;
  }
}
