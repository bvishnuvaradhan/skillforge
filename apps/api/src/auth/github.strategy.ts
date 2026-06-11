import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? 'mock-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'mock-github-client-secret',
      callbackURL: `${process.env.API_URL ?? 'http://localhost:3001'}/v1/auth/oauth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void,
  ): Promise<void> {
    const { id, displayName, username, emails, photos } = profile;
    
    // Fallback name to username if displayName is missing
    const name = displayName || username || 'GitHub User';
    
    const email = emails && emails[0] ? emails[0].value : '';
    const avatarUrl = photos && photos[0] ? photos[0].value : undefined;

    const user = {
      provider: 'github',
      providerId: id,
      email,
      name,
      avatarUrl,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
