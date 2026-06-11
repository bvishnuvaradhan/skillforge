import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('OnboardingController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();

  // Test User 1 (Student - complete flow)
  const studentEmail = `student-onboard-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';

  // Test User 2 (Mentor - role verification)
  const mentorEmail = `mentor-onboard-${uniqueId}@example.com`;
  const mentorPassword = 'SecurePassword123!';
  let mentorCookie: string[] = [];

  // Test User 3 (Student 2 - incomplete flow test)
  const student2Email = `student2-onboard-${uniqueId}@example.com`;
  const student2Password = 'SecurePassword123!';
  let student2Cookie: string[] = [];
  let student2Id = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // Register and login student 1
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Onboard Student 1',
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
        name: 'Onboard Mentor',
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

    // Register and login student 2
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Onboard Student 2',
        email: student2Email,
        password: student2Password,
        role: 'student',
      })
      .expect(201);

    const student2LoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: student2Email,
        password: student2Password,
      })
      .expect(200);

    student2Cookie = (student2LoginRes.headers['set-cookie'] as unknown as string[]) || [];
    student2Id = student2LoginRes.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup generated progress states
    await prisma.roadmap.deleteMany({
      where: {
        userId: {
          in: [studentId, student2Id],
        },
      },
    }).catch(() => {});

    await prisma.dltState.deleteMany({
      where: {
        userId: {
          in: [studentId, student2Id],
        },
      },
    }).catch(() => {});

    await prisma.masteryScore.deleteMany({
      where: {
        userId: {
          in: [studentId, student2Id],
        },
      },
    }).catch(() => {});

    // Cleanup users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [studentEmail, mentorEmail, student2Email],
        },
      },
    }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /onboarding/goal', () => {
    it('should block non-student roles from setting goal', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/goal')
        .set('Cookie', mentorCookie)
        .send({ goal: 'dsa' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 validation error for invalid goal values', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'webdev' }) // Invalid goal value
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should successfully save goal for student', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'dsa' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Goal saved');

      // Verify db
      const user = await prisma.user.findUnique({ where: { id: studentId } });
      expect(user?.primaryGoal).toBe('dsa');
    });
  });

  describe('POST /onboarding/assessment', () => {
    it('should return 400 validation error for invalid assessment parameters', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/assessment')
        .set('Cookie', studentCookie)
        .send({
          answers: [
            {
              question_id: '', // Empty question_id
              answer: 'A',
            },
          ],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should submit assessment answers successfully and save MasteryScore entries', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/assessment')
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'A' },
            { question_id: 'q2', answer: 'B' },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Assessment complete');
      expect(response.body.data.results.topic_scores.arrays).toBe(0.7);
      expect(response.body.data.results.topic_scores.trees).toBe(0.3);

      // Verify database entries
      const scores = await prisma.masteryScore.findMany({
        where: { userId: studentId },
      });
      expect(scores.length).toBe(2);
      
      const arraysScore = scores.find(s => s.topicId === 'arrays');
      expect(arraysScore?.score).toBe(0.7);
      expect(arraysScore?.assessmentScore).toBe(0.7);

      const treesScore = scores.find(s => s.topicId === 'trees');
      expect(treesScore?.score).toBe(0.3);
      expect(treesScore?.assessmentScore).toBe(0.3);
    });
  });

  describe('POST /onboarding/complete', () => {
    it('should fail with 400 if user tries to complete onboarding without choosing a goal', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/complete')
        .set('Cookie', student2Cookie) // Student 2 has not set a goal
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Goal must be set');
    });

    it('should successfully finalize onboarding, mark user complete, initialize DLT and Roadmap', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/complete')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dlt).toBeDefined();
      expect(response.body.data.dlt.overall_mastery).toBe(0.35);
      expect(response.body.data.dlt.worlds_unlocked).toContain('variables-kingdom');
      expect(response.body.data.roadmap.steps).toBeDefined();

      // Verify db deactivation checks are cleared
      const user = await prisma.user.findUnique({ where: { id: studentId } });
      expect(user?.onboardingComplete).toBe(true);

      // Verify DltState exists in DB
      const dlt = await prisma.dltState.findUnique({ where: { userId: studentId } });
      expect(dlt).not.toBeNull();
      expect(dlt?.overallMastery).toBe(0.35);
      expect(dlt?.learningStyle).toBe('game_based');

      // Verify Roadmap exists in DB
      const roadmap = await prisma.roadmap.findUnique({ where: { userId: studentId } });
      expect(roadmap).not.toBeNull();
      expect(roadmap?.goal).toBe('dsa');
      expect(roadmap?.steps).toBeInstanceOf(Array);
      
      const stepsArray = roadmap!.steps as unknown as { topic_id: string; status: string }[];
      expect(stepsArray[0]!.topic_id).toBe('arrays');
      expect(stepsArray[0]!.status).toBe('in_progress');
    });
  });
});
