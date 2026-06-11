import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RedisService } from './redis.service';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'super_secret_dev_key_at_least_32_characters_long',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService, JwtStrategy, GoogleStrategy, GithubStrategy],
  exports: [AuthService, RedisService, JwtStrategy, PassportModule, JwtModule, GoogleStrategy, GithubStrategy],
})
export class AuthModule {}
