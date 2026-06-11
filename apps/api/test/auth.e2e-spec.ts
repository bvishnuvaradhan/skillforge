import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';
import { RedisService } from '../src/auth/redis.service';

jest.setTimeout(30000);

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const testEmail = `student-${uniqueId}@example.com`;
  const adminEmail = `admin-${uniqueId}@example.com`;
  const testPassword = 'SecurePassword123!';
  
  let studentCookie: string[] = [];
  let studentToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // Clear all potential rate limit keys from Redis to prevent E2E failures
    const redisService = app.get(RedisService);
    await redisService.del('login_attempts:::ffff:127.0.0.1');
    await redisService.del('login_attempts:127.0.0.1');
    await redisService.del('login_attempts:::1');
    await redisService.del('login_attempts:unknown');
    await redisService.del('login_attempts:127.0.0.123');
  });

  afterAll(async () => {
    // Cleanup users from database
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testEmail, adminEmail],
        },
      },
    }).catch(() => {});
    
    await app.close();
    await prisma.$disconnect();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new student user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Student',
          email: testEmail,
          password: testPassword,
          role: 'student',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.role).toBe('student');
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 Conflict if registering same email again', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Student Duplicate',
          email: testEmail,
          password: testPassword,
          role: 'student',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should return 400 Validation Error for invalid input fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: '', // Empty name (min 2 required)
          email: 'invalid-email',
          password: 'short', // Short password (min 8 required)
          role: 'invalid-role',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.name).toBeDefined();
      expect(response.body.error.details.email).toBeDefined();
      expect(response.body.error.details.password).toBeDefined();
      expect(response.body.error.details.role).toBeDefined();
    });
  });

  describe('/auth/login (POST)', () => {
    it('should log in successfully with valid credentials and return tokens and cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();

      studentCookie = (response.headers['set-cookie'] as unknown as string[]) || [];
      studentToken = response.body.data.token;
    });

    it('should return 401 Unauthorized with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Guard Protection & Roles', () => {
    it('should allow accessing protected routes with valid cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/test-protected')
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.role).toBe('student');
    });

    it('should allow accessing protected routes with Bearer Authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/test-protected')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
    });

    it('should block protected routes with 401 if token is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/test-protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 Forbidden when student accesses admin route', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/test-admin')
        .set('Cookie', studentCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should rotate tokens and return new tokens and cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();

      // Update student cookie with the new rotated session cookies
      studentCookie = (response.headers['set-cookie'] as unknown as string[]) || [];
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should blacklist the access token and clear cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
      
      // Verification: Check that the cookies are cleared (Expires 1970 or Max-Age=0)
      const setCookieStr = JSON.stringify(response.headers['set-cookie']);
      expect(setCookieStr).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970|access_token=;/i);
    });

    it('should reject access to protected routes with the blacklisted token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/test-protected')
        .set('Cookie', studentCookie)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Login Rate Limiting', () => {
    beforeEach(async () => {
      const redisService = app.get(RedisService);
      await redisService.del('login_attempts:127.0.0.123');
    });

    it('should rate limit after 5 failed login attempts from same IP address', async () => {
      const testIp = '127.0.0.123'; // Unique test IP to verify rate-limiting
      
      // Perform 5 login requests
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', testIp) // Mock client IP
          .send({
            email: 'doesnotexist@example.com',
            password: 'WrongPassword!',
          })
          .expect(401);
      }

      // 6th attempt should return 429 Rate Limited
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Forwarded-For', testIp)
        .send({
          email: 'doesnotexist@example.com',
          password: 'WrongPassword!',
        })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RATE_LIMITED');
    });
  });
});
