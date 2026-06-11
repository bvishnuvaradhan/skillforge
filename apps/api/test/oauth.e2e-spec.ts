import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma, Provider, Role } from '@skillforge/db';
import cookieParser from 'cookie-parser';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategyBase } from 'passport-google-oauth20';
import { Strategy as GithubStrategyBase } from 'passport-github2';
import { GoogleStrategy } from '../src/auth/google.strategy';
import { GithubStrategy } from '../src/auth/github.strategy';

jest.setTimeout(30000);

// --- Mock Google Strategy ---
@Injectable()
class MockGoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
  constructor() {
    super({
      clientID: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      callbackURL: 'mock-callback-url',
    });
  }

  override authenticate(_req: unknown, _options?: unknown) {
    const mockProfile = {
      provider: 'google',
      providerId: 'google-id-12345',
      email: 'google-test@example.com',
      name: 'Google Test User',
      avatarUrl: 'http://example.com/google-avatar.jpg',
    };
    // Call passport strategy success callback
    this.success(mockProfile);
  }

  async validate(_accessToken: string, _refreshToken: string, profile: unknown): Promise<unknown> {
    return profile;
  }
}

// --- Mock GitHub Strategy ---
@Injectable()
class MockGithubStrategy extends PassportStrategy(GithubStrategyBase, 'github') {
  constructor() {
    super({
      clientID: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      callbackURL: 'mock-callback-url',
    });
  }

  override authenticate(_req: unknown, _options?: unknown) {
    const mockProfile = {
      provider: 'github',
      providerId: 'github-id-12345',
      email: 'github-test@example.com',
      name: 'GitHub Test User',
      avatarUrl: 'http://example.com/github-avatar.jpg',
    };
    this.success(mockProfile);
  }

  async validate(_accessToken: string, _refreshToken: string, profile: unknown): Promise<unknown> {
    return profile;
  }
}

describe('OAuth Authentication (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const existingEmail = `existing-user-${uniqueId}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleStrategy)
      .useClass(MockGoogleStrategy)
      .overrideProvider(GithubStrategy)
      .useClass(MockGithubStrategy)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // Create an existing user to verify account linking
    await prisma.user.create({
      data: {
        name: 'Existing Local User',
        email: existingEmail,
        role: Role.student,
        onboardingComplete: false,
      },
    });
  });

  afterAll(async () => {
    // Cleanup users created during tests
    await prisma.oauthAccount.deleteMany({
      where: {
        providerId: {
          in: ['google-id-12345', 'github-id-12345', 'google-id-link'],
        },
      },
    }).catch(() => {});

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'google-test@example.com',
            'github-test@example.com',
            existingEmail,
            'google-link@example.com',
          ],
        },
      },
    }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /auth/oauth/google', () => {
    it('should trigger Google login flow and handle callback successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .expect(302);

      // Verify redirection to frontend callback route
      expect(response.headers.location).toContain('/auth/callback');
      expect(response.headers['set-cookie']).toBeDefined();

      const cookies = JSON.stringify(response.headers['set-cookie']);
      expect(cookies).toContain('access_token');
      expect(cookies).toContain('refresh_token');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'google-test@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe('Google Test User');
      expect(user?.role).toBe(Role.student);
      expect(user?.avatarUrl).toBe('http://example.com/google-avatar.jpg');

      // Verify oauth_accounts entry
      const oauthAccount = await prisma.oauthAccount.findFirst({
        where: { userId: user?.id, provider: Provider.google },
      });
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount?.providerId).toBe('google-id-12345');
    });
  });

  describe('GET /auth/oauth/github', () => {
    it('should trigger GitHub login flow and handle callback successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/oauth/github/callback')
        .expect(302);

      expect(response.headers.location).toContain('/auth/callback');
      expect(response.headers['set-cookie']).toBeDefined();

      const user = await prisma.user.findUnique({
        where: { email: 'github-test@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe('GitHub Test User');

      const oauthAccount = await prisma.oauthAccount.findFirst({
        where: { userId: user?.id, provider: Provider.github },
      });
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount?.providerId).toBe('github-id-12345');
    });
  });

  describe('OAuth Account Linking', () => {
    it('should link OAuth account to an existing user with the same email', async () => {
      // Define a custom strategy to return the existing user's email
      @Injectable()
      class LinkGoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
        constructor() {
          super({
            clientID: 'mock',
            clientSecret: 'mock',
            callbackURL: 'mock',
          });
        }

        override authenticate(_req: unknown, _options?: unknown) {
          const mockProfile = {
            provider: 'google',
            providerId: 'google-id-link',
            email: existingEmail,
            name: 'Google Link User',
            avatarUrl: 'http://example.com/linked.jpg',
          };
          this.success(mockProfile);
        }

        async validate(_accessToken: string, _refreshToken: string, profile: unknown): Promise<unknown> {
          return profile;
        }
      }

      // Recompile with the temporary strategy
      const testModule: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(GoogleStrategy)
        .useClass(LinkGoogleStrategy)
        .compile();

      const testApp = testModule.createNestApplication<NestExpressApplication>();
      testApp.use(cookieParser());
      await testApp.init();

      const response = await request(testApp.getHttpServer())
        .get('/auth/oauth/google/callback')
        .expect(302);

      expect(response.headers.location).toContain('/auth/callback');

      // Verify that NO new user was created
      const users = await prisma.user.findMany({
        where: { email: existingEmail },
      });
      expect(users.length).toBe(1);
      
      const user = users[0];
      expect(user).toBeDefined();
      if (user) {
        expect(user.name).toBe('Existing Local User'); // Kept original local name

        // Verify Google OAuth account is linked to the existing user
        const oauthAccount = await prisma.oauthAccount.findFirst({
          where: { userId: user.id, provider: Provider.google },
        });
        expect(oauthAccount).toBeDefined();
        expect(oauthAccount?.providerId).toBe('google-id-link');
      }

      await testApp.close();
    });
  });
});
