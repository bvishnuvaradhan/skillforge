import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma, ExamType } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('ExamsController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const testEmail = `student-ex-${uniqueId}@example.com`;
  const testPassword = 'SecurePassword123!';

  let studentCookie: any = [];
  let studentId = '';
  
  let attemptId = '';
  const examId = '550e8400-e29b-41d4-a716-446655440000';

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
        name: 'Jane Examinee',
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
        overallMastery: 0.65,
        overallRetention: 0.65,
        xpTotal: 100,
        level: 1,
        careerReadiness: {
          codingReadiness: 65,
          interviewReadiness: 50,
          resumeScore: 50,
          overallReadiness: 55,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.examAttempt.deleteMany({ where: { userId: studentId } });
    await prisma.dltState.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { id: studentId } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('Mock Exams & Adaptive Test Runner', () => {
    it('should list all available exams in the catalog', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((e: any) => e.category === 'adaptive')).toBe(true);
    });

    it('should start an exam attempt and receive the first question', async () => {
      const response = await request(app.getHttpServer())
        .post(`/exams/${examId}/start`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attemptId).toBeDefined();
      expect(response.body.data.examType).toBe(ExamType.adaptive);
      expect(response.body.data.firstQuestion).toBeDefined();
      expect(response.body.data.firstQuestion.id).toBeDefined();

      attemptId = response.body.data.attemptId;
    });

    it('should walk through the adaptive questions based on answer correctness', async () => {
      let currentQuestionId = 'e1'; // first easy question
      const selectAnswer = 'O(n)'; // Correct for e1

      // Q1: Answer Correctly -> should change difficulty from Easy to Medium
      const q1Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({
          questionId: currentQuestionId,
          selectedAnswer: selectAnswer,
        })
        .expect(201);

      expect(q1Res.body.success).toBe(true);
      expect(q1Res.body.data.correct).toBe(true);
      expect(q1Res.body.data.completed).toBe(false);
      expect(q1Res.body.data.nextQuestion).toBeDefined();
      
      const q2 = q1Res.body.data.nextQuestion;
      currentQuestionId = q2.id;
      
      // Q2: Answer Incorrectly -> should change difficulty back to Easy
      const q2Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({
          questionId: currentQuestionId,
          selectedAnswer: 'WrongAnswerPlaceholder',
        })
        .expect(201);

      expect(q2Res.body.success).toBe(true);
      expect(q2Res.body.data.correct).toBe(false);
      expect(q2Res.body.data.completed).toBe(false);
      expect(q2Res.body.data.nextQuestion).toBeDefined();

      // Answer Q3, Q4, Q5 to reach limit of 6 questions
      const q3 = q2Res.body.data.nextQuestion;
      const q3Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({ questionId: q3.id, selectedAnswer: 'WrongAnswer' });

      const q4 = q3Res.body.data.nextQuestion;
      const q4Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({ questionId: q4.id, selectedAnswer: 'WrongAnswer' });

      const q5 = q4Res.body.data.nextQuestion;
      const q5Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({ questionId: q5.id, selectedAnswer: 'WrongAnswer' });

      // Q6: Submission of 6th answer -> should grade, calculate linear XP, update DLT, and mark completed
      const q6 = q5Res.body.data.nextQuestion;
      const q6Res = await request(app.getHttpServer())
        .post(`/exams/attempts/${attemptId}/answer`)
        .set('Cookie', studentCookie)
        .send({
          questionId: q6.id,
          selectedAnswer: 'WrongAnswer',
        })
        .expect(201);

      expect(q6Res.body.success).toBe(true);
      expect(q6Res.body.data.completed).toBe(true);
      expect(q6Res.body.data.nextQuestion).toBeNull();
      expect(q6Res.body.data.score).toBeDefined();
      expect(q6Res.body.data.xpEarned).toBeDefined();
      expect(q6Res.body.data.attempt.score).toBeDefined();
    });

    it('should retrieve user exam history', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams/history')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].id).toBe(attemptId);
      expect(response.body.data[0].score).toBeDefined();
    });
  });
});
