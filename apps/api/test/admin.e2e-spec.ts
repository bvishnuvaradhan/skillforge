import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('AdminController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  
  // Admin user details
  const adminEmail = `admin-test-${uniqueId}@example.com`;
  const adminPassword = 'SecureAdminPassword123!';
  let adminCookie: any = [];
  let adminId = '';

  // Student user details
  const studentEmail = `student-test-${uniqueId}@example.com`;
  const studentPassword = 'SecureStudentPassword123!';
  let studentCookie: any = [];
  let studentId = '';

  let reportId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // 1. Register & Login Admin
    const regAdminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
    adminCookie = regAdminRes.headers['set-cookie'];
    adminId = regAdminRes.body.data.user.id;

    // 2. Register & Login Student
    const regStudentRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cheating Student',
        email: studentEmail,
        password: studentPassword,
        role: 'student',
      });
    studentCookie = regStudentRes.headers['set-cookie'];
    studentId = regStudentRes.body.data.user.id;

    // Create a mock report for moderation testing
    const report = await prisma.report.create({
      data: {
        reporterId: adminId,
        targetType: 'USER',
        targetId: studentId,
        reason: 'Report test for E2E moderation',
      },
    });
    reportId = report.id;
  });

  afterAll(async () => {
    // Cleanup reports, feature flags, audit logs, sessions, and users
    await prisma.report.deleteMany({
      where: {
        OR: [
          { reporterId: adminId },
          { reporterId: studentId },
          { targetId: studentId },
        ],
      },
    });
    await prisma.featureFlag.deleteMany({ where: { key: { in: ['test-flag-e2e'] } } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: [adminId, studentId] } } });
    await prisma.session.deleteMany({ where: { userId: { in: [adminId, studentId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, studentId] } } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('Admin Dashboard Statistics', () => {
    it('should allow admin to retrieve dashboard statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/stats')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.users).toBeDefined();
      expect(response.body.stats.pendingReports).toBeDefined();
    });

    it('should reject non-admin access to dashboard stats', async () => {
      await request(app.getHttpServer())
        .get('/admin/dashboard/stats')
        .set('Cookie', studentCookie)
        .expect(403);
    });
  });

  describe('Feature Flags Management', () => {
    it('should allow admin to set feature flags', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/feature-flags')
        .set('Cookie', adminCookie)
        .send({
          key: 'test-flag-e2e',
          isEnabled: true,
          description: 'E2E test feature flag',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.key).toBe('test-flag-e2e');
      expect(response.body.data.isEnabled).toBe(true);
    });
  });

  describe('Reports Queue & Resolution', () => {
    it('should list reports in moderation queue', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/reports')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      const found = response.body.data.find((r: any) => r.id === reportId);
      expect(found).toBeDefined();
    });

    it('should resolve a pending report', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/reports/${reportId}/resolve`)
        .set('Cookie', adminCookie)
        .send({
          actionTaken: 'Resolved with caution warning',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.actionTaken).toBe('Resolved with caution warning');
    });
  });

  describe('Account Suspension & Request Blocking', () => {
    it('should allow admin to suspend student account', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${studentId}/suspend`)
        .set('Cookie', adminCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('suspended');

      // Verify DB status
      const u = await prisma.user.findUnique({ where: { id: studentId } });
      expect(u?.status).toBe('suspended');
    });

    it('should immediately block subsequent requests from suspended student', async () => {
      // Accessing endpoints with student cookie should instantly fail with 401 Unauthorized
      await request(app.getHttpServer())
        .get('/community/leaderboards')
        .set('Cookie', studentCookie)
        .expect(401);
    });
  });
});
