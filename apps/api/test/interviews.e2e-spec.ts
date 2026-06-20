import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma, InterviewStatus, MentorVerificationStatus } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('InterviewsController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  
  const studentEmail = `student-int-${uniqueId}@example.com`;
  const mentorEmail = `mentor-int-${uniqueId}@example.com`;
  const testPassword = 'SecurePassword123!';

  let studentCookie: any = [];
  let mentorCookie: any = [];
  let studentId = '';
  let mentorId = '';
  
  let aiSessionId = '';
  let humanSessionId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // 1. Create Student User & Login to get cookie
    const studentRegRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Jane Student',
        email: studentEmail,
        password: testPassword,
        role: 'student',
      });
    studentCookie = studentRegRes.headers['set-cookie'];
    studentId = studentRegRes.body.data.user.id;

    // Set student onboardingComplete = true so they have DLT State initialized
    await prisma.user.update({
      where: { id: studentId },
      data: { onboardingComplete: true },
    });
    await prisma.dltState.create({
      data: {
        userId: studentId,
        overallMastery: 0.8,
        overallRetention: 0.75,
        xpTotal: 500,
        level: 1,
        careerReadiness: {
          codingReadiness: 80,
          interviewReadiness: 70,
          resumeScore: 75,
          overallReadiness: 75,
        },
      },
    });

    // 2. Create Mentor User & Login to get cookie
    const mentorRegRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Mentor',
        email: mentorEmail,
        password: testPassword,
        role: 'mentor',
      });
    mentorCookie = mentorRegRes.headers['set-cookie'];
    mentorId = mentorRegRes.body.data.user.id;

    // Approve mentor profile for marketplace listing
    await prisma.mentorProfile.create({
      data: {
        userId: mentorId,
        bio: 'Principal Architect at Netflix',
        headline: 'System Design Interview Expert',
        expertise: ['Graphs', 'Recursion', 'System Design'],
        experienceYears: 10,
        sessionPrice: 150.00,
        verificationStatus: MentorVerificationStatus.approved,
      },
    });
  });

  afterAll(async () => {
    // Cleanup Database records
    await prisma.mentorReview.deleteMany({ where: { studentId } });
    await prisma.interviewFeedback.deleteMany({ where: { evaluatorId: studentId } });
    await prisma.interviewSession.deleteMany({ where: { studentId } });
    await prisma.mentorProfile.deleteMany({ where: { userId: mentorId } });
    await prisma.dltState.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { email: { in: [studentEmail, mentorEmail] } } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('AI Mock Interview Loop', () => {
    it('should start an AI Mock Interview session successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/interviews/ai/start')
        .set('Cookie', studentCookie)
        .send({
          interviewType: 'coding',
          targetCompany: 'Google',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toBeDefined();
      expect(response.body.data.session.type).toBe('ai');
      expect(response.body.data.session.status).toBe(InterviewStatus.in_progress);
      expect(response.body.data.message).toBeDefined();
      aiSessionId = response.body.data.session.id;
    });

    it('should post messages and receive replies', async () => {
      const response = await request(app.getHttpServer())
        .post(`/interviews/${aiSessionId}/message`)
        .set('Cookie', studentCookie)
        .send({
          message: 'I would solve this by using a sliding window pointer starting at index 0.',
          code: 'function solve(arr) { return arr.length; }',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBeDefined();
    });

    it('should complete AI Interview and generate evaluation feedback', async () => {
      const response = await request(app.getHttpServer())
        .post(`/interviews/${aiSessionId}/complete`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.feedback).toBeDefined();
      expect(response.body.feedback.technicalScore).toBeGreaterThanOrEqual(0);
      expect(response.body.feedback.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should fetch the completed interview session feedback', async () => {
      const response = await request(app.getHttpServer())
        .get(`/interviews/${aiSessionId}/feedback`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedback).toBeDefined();
      expect(response.body.data.session.status).toBe(InterviewStatus.completed);
    });
  });

  describe('Mentor Marketplace & Booking', () => {
    it('should list all approved mentors', async () => {
      const response = await request(app.getHttpServer())
        .get('/interviews/mentors')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((m: any) => m.userId === mentorId)).toBe(true);
    });

    it('should book a mentor session successfully with test-mode bypass', async () => {
      const response = await request(app.getHttpServer())
        .post('/interviews/bookings/checkout-session')
        .set('Cookie', studentCookie)
        .send({
          mentorId,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          interviewType: 'system_design',
          targetCompany: 'Netflix',
          bypassPayment: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBeDefined();
      expect(response.body.data.bypass).toBe(true);
      humanSessionId = response.body.data.sessionId;
    });

    it('should block booking bypass in production', async () => {
      // Temporarily set NODE_ENV to production
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await request(app.getHttpServer())
          .post('/interviews/bookings/checkout-session')
          .set('Cookie', studentCookie)
          .send({
            mentorId,
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            interviewType: 'system_design',
            bypassPayment: true,
          })
          .expect(403);
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it('should submit reviews for completed sessions', async () => {
      // Manually set status to completed to allow review
      await prisma.interviewSession.update({
        where: { id: humanSessionId },
        data: { status: InterviewStatus.completed },
      });

      const response = await request(app.getHttpServer())
        .post(`/interviews/${humanSessionId}/review`)
        .set('Cookie', studentCookie)
        .send({
          rating: 5,
          comment: 'Outstanding session! Loved the mock architectural questions.',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);

      // Verify profile recalculation
      const profile = await prisma.mentorProfile.findUnique({
        where: { userId: mentorId },
      });
      expect(profile?.ratingCount).toBe(1);
      expect(profile?.ratingAverage).toBe(5);
    });

    it('should update mentor profile successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/interviews/mentor/profile')
        .set('Cookie', mentorCookie)
        .send({
          bio: 'Updated senior architect bio details',
          headline: 'Netflix Tech Lead',
          expertise: ['System Design', 'Trees'],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.headline).toBe('Netflix Tech Lead');
    });
  });
});
