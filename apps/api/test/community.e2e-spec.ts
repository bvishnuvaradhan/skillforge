import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('CommunityController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const testEmail = `student-comm-${uniqueId}@example.com`;
  const testPassword = 'SecurePassword123!';

  let studentCookie: any = [];
  let studentId = '';
  let teamId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // Register & Login Student
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Jane Student',
        email: testEmail,
        password: testPassword,
        role: 'student',
      });
    studentCookie = regRes.headers['set-cookie'];
    studentId = regRes.body.data.user.id;

    // onboardingComplete = true, initialize DLT State
    await prisma.user.update({
      where: { id: studentId },
      data: { onboardingComplete: true },
    });
    await prisma.dltState.create({
      data: {
        userId: studentId,
        overallMastery: 0.5,
        overallRetention: 0.6,
        xpTotal: 100,
        level: 1,
      },
    });
  });

  afterAll(async () => {
    // Delete report first due to Cascade/SetNull constraints
    await prisma.report.deleteMany({ where: { reporterId: studentId } });
    await prisma.teamMember.deleteMany({ where: { userId: studentId } });
    if (teamId) {
      await prisma.team.deleteMany({ where: { id: teamId } });
    }
    await prisma.dltState.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { id: studentId } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('Teams Creation & Management', () => {
    it('should create a new study team', async () => {
      const response = await request(app.getHttpServer())
        .post('/community/teams')
        .set('Cookie', studentCookie)
        .send({
          name: `Alpha Squad ${uniqueId}`,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(`Alpha Squad ${uniqueId}`);
      expect(response.body.data.inviteCode).toBeDefined();
      teamId = response.body.data.id;
    });

    it('should prevent joining a team if already in one', async () => {
      await request(app.getHttpServer())
        .post('/community/teams/join')
        .set('Cookie', studentCookie)
        .send({
          inviteCode: 'some-random-invite-code',
        })
        .expect(400);
    });

    it('should retrieve active team dashboard details', async () => {
      const response = await request(app.getHttpServer())
        .get('/community/teams/me')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.hasTeam).toBe(true);
      expect(response.body.data.name).toBe(`Alpha Squad ${uniqueId}`);
      expect(response.body.data.members.length).toBe(1);
      expect(response.body.data.members[0].userId).toBe(studentId);
    });
  });

  describe('Leaderboards Standings', () => {
    it('should fetch global and cohort standings standings', async () => {
      const response = await request(app.getHttpServer())
        .get('/community/leaderboards')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.global).toBeDefined();
      expect(Array.isArray(response.body.global)).toBe(true);
      expect(response.body.cohort).toBeDefined();
      expect(Array.isArray(response.body.cohort)).toBe(true);
    });
  });

  describe('Moderation Flag Reporting', () => {
    it('should submit a violation report and verify target existence', async () => {
      const response = await request(app.getHttpServer())
        .post('/community/reports')
        .set('Cookie', studentCookie)
        .send({
          targetType: 'USER',
          targetId: studentId,
          reason: 'Test moderation flag validation',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.targetId).toBe(studentId);
    });

    it('should fail report submission on non-existent targets', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post('/community/reports')
        .set('Cookie', studentCookie)
        .send({
          targetType: 'USER',
          targetId: nonExistentUuid,
          reason: 'Should fail target verification check',
        })
        .expect(400);
    });
  });
});
