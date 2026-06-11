import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'mock-google-client-secret',
      callbackURL: `${process.env.API_URL ?? 'http://localhost:3001'}/v1/auth/oauth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : '';
    const avatarUrl = photos && photos[0] ? photos[0].value : undefined;

    const user = {
      provider: 'google',
      providerId: id,
      email,
      name: displayName,
      avatarUrl,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
