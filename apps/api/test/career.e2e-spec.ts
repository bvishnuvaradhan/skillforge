import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('CareerController (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const testEmail = `student-car-${uniqueId}@example.com`;
  const testPassword = 'SecurePassword123!';

  let studentCookie: any = [];
  let studentId = '';
  let resumeId = '';

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
        name: 'Jane Careerist',
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
        overallMastery: 0.78,
        overallRetention: 0.70,
        xpTotal: 250,
        level: 1,
        careerReadiness: {
          codingReadiness: 78,
          interviewReadiness: 60,
          resumeScore: 0,
          overallReadiness: 46,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.resumeScore.deleteMany({ where: { resume: { userId: studentId } } });
    await prisma.resume.deleteMany({ where: { userId: studentId } });
    await prisma.dltState.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { id: studentId } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('Resume Builder & Scorer', () => {
    it('should create a pre-filled resume from student details', async () => {
      const response = await request(app.getHttpServer())
        .post('/resumes')
        .set('Cookie', studentCookie)
        .send({
          name: 'My Master Resume',
          template: 'ats',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('My Master Resume');
      expect(response.body.data.template).toBe('ats');
      expect(response.body.data.content).toBeDefined();
      expect(response.body.data.content.personalInfo.name).toBe('Jane Careerist');
      resumeId = response.body.data.id;
    });

    it('should modify the resume content dynamically', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/resumes/${resumeId}`)
        .set('Cookie', studentCookie)
        .send({
          name: 'My Modified ATS Resume',
          isPrimary: true,
          content: {
            personalInfo: {
              name: 'Jane Careerist',
              email: testEmail,
              phone: '+1 (555) 999-8888',
            },
            skills: ['Python', 'Django', 'Prisma', 'Algorithms'],
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('My Modified ATS Resume');
      expect(response.body.data.isPrimary).toBe(true);
    });

    it('should grade and score the resume across 6 dimensions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/resumes/${resumeId}/score`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overallScore).toBeDefined();
      expect(response.body.data.atsScore).toBeDefined();
      expect(response.body.data.suggestions).toBeDefined();
    });
  });

  describe('LinkedIn bio optimizer & Readiness tiers', () => {
    it('should analyze pasted LinkedIn bio text and suggest keyword optimized rewrites', async () => {
      const response = await request(app.getHttpServer())
        .post('/career/linkedin/analyze')
        .set('Cookie', studentCookie)
        .send({
          bioText: 'Student coder looking for internships in Python and databases.',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.visibilityScore).toBeDefined();
      expect(response.body.data.optimizedText).toBeDefined();
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('should calculate career readiness composite scores for company tiers', async () => {
      const response = await request(app.getHttpServer())
        .get('/career/readiness')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.codingReadiness).toBeDefined();
      expect(response.body.data.tiers.faang).toBeDefined();
      expect(response.body.data.tiers.product).toBeDefined();
      expect(response.body.data.tiers.startup).toBeDefined();
      expect(response.body.data.tiers.service).toBeDefined();
    });
  });
});
