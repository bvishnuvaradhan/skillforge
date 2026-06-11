import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma, PrivacySetting, CodingPlatform } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('UsersController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  
  // Test User 1 (Student)
  const studentEmail = `student-profile-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';

  // Test User 2 (Mentor - for role verification)
  const mentorEmail = `mentor-profile-${uniqueId}@example.com`;
  const mentorPassword = 'SecurePassword123!';
  let mentorCookie: string[] = [];

  // Test User 3 (Other Student - for public/private profile testing)
  const otherStudentEmail = `other-student-${uniqueId}@example.com`;
  const otherStudentPassword = 'SecurePassword123!';
  let otherStudentCookie: string[] = [];
  let otherStudentId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // Register and login student
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Profile Student',
        email: studentEmail,
        password: studentPassword,
        role: 'student',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: studentEmail,
        password: studentPassword,
      })
      .expect(200);

    studentCookie = (loginRes.headers['set-cookie'] as unknown as string[]) || [];
    studentId = loginRes.body.data.user.id;

    // Register and login mentor
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Profile Mentor',
        email: mentorEmail,
        password: mentorPassword,
        role: 'mentor',
      })
      .expect(201);

    const mentorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: mentorEmail,
        password: mentorPassword,
      })
      .expect(200);

    mentorCookie = (mentorLoginRes.headers['set-cookie'] as unknown as string[]) || [];

    // Register and login other student
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Other Student',
        email: otherStudentEmail,
        password: otherStudentPassword,
        role: 'student',
      })
      .expect(201);

    const otherLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: otherStudentEmail,
        password: otherStudentPassword,
      })
      .expect(200);

    otherStudentCookie = (otherLoginRes.headers['set-cookie'] as unknown as string[]) || [];
    otherStudentId = otherLoginRes.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup profiles
    await prisma.codingProfile.deleteMany({
      where: {
        userId: {
          in: [studentId, otherStudentId],
        },
      },
    }).catch(() => {});

    // Cleanup users from database
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [studentEmail, mentorEmail, otherStudentEmail],
        },
      },
    }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /users/me', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return current authenticated user details (without passwordHash)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(studentId);
      expect(response.body.data.user.email).toBe(studentEmail);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.user.password_hash).toBeUndefined();
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 400 validation error if body fields are invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Cookie', studentCookie)
        .send({
          name: '', // Empty name (min 2 required)
          privacySetting: 'invalid-privacy',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should update profile name and privacy setting successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Cookie', studentCookie)
        .send({
          name: 'Updated Student Name',
          privacySetting: 'public',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Student Name');
      expect(response.body.data.user.privacySetting).toBe('public');

      // Verify db changes
      const dbUser = await prisma.user.findUnique({ where: { id: studentId } });
      expect(dbUser?.name).toBe('Updated Student Name');
      expect(dbUser?.privacySetting).toBe(PrivacySetting.public);
    });
  });

  describe('GET /users/:id/profile', () => {
    it('should allow viewing a public profile of another user', async () => {
      // User 1 is currently public (from patch test)
      const response = await request(app.getHttpServer())
        .get(`/users/${studentId}/profile`)
        .set('Cookie', otherStudentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.name).toBe('Updated Student Name');
      expect(response.body.data.profile.badges).toBeInstanceOf(Array);
    });

    it('should return 403 Forbidden when viewing private profile of another user', async () => {
      // Make other student's profile private
      await prisma.user.update({
        where: { id: otherStudentId },
        data: { privacySetting: PrivacySetting.private },
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${otherStudentId}/profile`)
        .set('Cookie', studentCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow viewing own profile even if privacy is set to private', async () => {
      // User 3 is private, but should be able to view their own profile
      const response = await request(app.getHttpServer())
        .get(`/users/${otherStudentId}/profile`)
        .set('Cookie', otherStudentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.id).toBe(otherStudentId);
    });

    it('should return 404 if profile ID does not exist', async () => {
      const nonExistentId = '66666666-6666-6666-6666-666666666666'; // Valid UUID format but non-existent
      const response = await request(app.getHttpServer())
        .get(`/users/${nonExistentId}/profile`)
        .set('Cookie', studentCookie)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /users/me/coding-profiles', () => {
    it('should block non-student roles (e.g. mentor) from linking coding profiles', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/coding-profiles')
        .set('Cookie', mentorCookie)
        .send({
          platform: 'leetcode',
          username: 'mentor_leetcode',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should successfully link a student coding profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/coding-profiles')
        .set('Cookie', studentCookie)
        .send({
          platform: 'leetcode',
          username: 'student_leetcode_username',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.coding_profile.platform).toBe('leetcode');
      expect(response.body.data.coding_profile.username).toBe('student_leetcode_username');
      expect(response.body.data.coding_profile.solved_count).toBe(0);
    });

    it('should return 409 Conflict if same platform is linked again', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/coding-profiles')
        .set('Cookie', studentCookie)
        .send({
          platform: 'leetcode',
          username: 'another_username',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /users/me/coding-profiles/:platform', () => {
    it('should return 404 when unlinking a platform that is not linked', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/me/coding-profiles/codeforces')
        .set('Cookie', studentCookie)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should successfully unlink coding profile platform', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/me/coding-profiles/leetcode')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Profile unlinked');

      // Verify db is cleared
      const dbProfile = await prisma.codingProfile.findFirst({
        where: { userId: studentId, platform: CodingPlatform.leetcode },
      });
      expect(dbProfile).toBeNull();
    });
  });

  describe('DELETE /users/me', () => {
    it('should soft delete user by scheduling deletion in 30 days', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deletion in 30 days');

      // Verify db updated deletedAt
      const dbUser = await prisma.user.findUnique({ where: { id: studentId } });
      expect(dbUser?.deletedAt).not.toBeNull();
      
      const timeDiff = dbUser!.deletedAt!.getTime() - Date.now();
      // Difference should be roughly 30 days (about 2592000000 ms)
      expect(timeDiff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(timeDiff).toBeLessThan(31 * 24 * 60 * 60 * 1000);
    });

    it('should block subsequent requests with 401 once soft deleted', async () => {
      // The user is soft deleted, getMe will check deletedAt: null and throw 401
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', studentCookie)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
