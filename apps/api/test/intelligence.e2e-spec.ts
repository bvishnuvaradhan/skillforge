import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';
import { RedisService } from '../src/auth/redis.service';
import { MemorySchedulerService } from '../src/memory/memory-scheduler.service';

jest.setTimeout(30000);

describe('Intelligence Layer Features (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();

  const studentEmail = `student-intel-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';

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
        name: 'Intelligence Student',
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
  });

  afterAll(async () => {
    // Cleanup
    await prisma.recommendation.deleteMany({ where: { userId: studentId } });
    await prisma.retentionScore.deleteMany({ where: { userId: studentId } });
    await prisma.roadmap.deleteMany({ where: { userId: studentId } });
    await prisma.user.delete({ where: { id: studentId } });

    await app.close();
  });

  describe('Memory Lab - GET /memory/lab', () => {
    it('should return 200 for Free tier users', async () => {
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free' },
      });

      const res = await request(app.getHttpServer())
        .get('/memory/lab')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.memory_health_score).toBeDefined();
      expect(res.body.data.risk_areas).toBeDefined();
    });

    it('should return 200 for Premium tier users', async () => {
      // Upgrade user to premium
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'premium' },
      });

      const res = await request(app.getHttpServer())
        .get('/memory/lab')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.memory_health_score).toBeDefined();
      expect(res.body.data.risk_areas).toBeDefined();
    });

    it('should decay retention scores and trigger critical alerts via MemorySchedulerService', async () => {
      const testTopic = 'loops';
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      // Clean up previous test runs
      await prisma.retentionScore.deleteMany({ where: { userId: studentId, topicId: testTopic } });
      await prisma.notification.deleteMany({ where: { userId: studentId, type: 'memory' } });

      await prisma.retentionScore.create({
        data: {
          userId: studentId,
          topicId: testTopic,
          retention: 1.0,
          stability: 5.0,
          lastReviewedAt: tenDaysAgo,
          nextReviewAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          riskLevel: 'low',
        },
      });

      // Execute nightly decay cron service method
      const scheduler = app.get(MemorySchedulerService);
      await scheduler.handleNightlyDecay();

      // Verify the score decayed correctly to e^(-10/5) = e^-2 ~ 0.135
      const decayedScore = await prisma.retentionScore.findFirst({
        where: { userId: studentId, topicId: testTopic },
      });

      expect(decayedScore).not.toBeNull();
      expect(decayedScore!.retention).toBeLessThan(0.20);
      expect(decayedScore!.riskLevel).toBe('critical');

      // Verify critical notification was created
      const notification = await prisma.notification.findFirst({
        where: { userId: studentId, type: 'memory', title: { contains: 'CRITICAL' } },
      });
      expect(notification).not.toBeNull();
      expect(notification!.body).toContain('decay');
    });
  });

  describe('Recommendations - GET /recommendations & PATCH /recommendations/:id', () => {
    it('should return active recommendations', async () => {
      const res = await request(app.getHttpServer())
        .get('/recommendations')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendations).toBeInstanceOf(Array);
    });

    it('should snooze/dismiss recommendations', async () => {
      // Get an active recommendation
      const recsRes = await request(app.getHttpServer())
        .get('/recommendations')
        .set('Cookie', studentCookie);

      const recId = recsRes.body.data.recommendations[0]?.id;

      if (recId) {
        await request(app.getHttpServer())
          .patch(`/recommendations/${recId}`)
          .set('Cookie', studentCookie)
          .send({ action: 'snooze', snooze_days: 2 })
          .expect(200);

        await request(app.getHttpServer())
          .patch(`/recommendations/${recId}`)
          .set('Cookie', studentCookie)
          .send({ action: 'dismiss' })
          .expect(200);
      }
    });
  });

  describe('Roadmap - GET /roadmap & PATCH /roadmap/goal', () => {
    it('should return user roadmap', async () => {
      const res = await request(app.getHttpServer())
        .get('/roadmap')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.steps).toBeDefined();
    });

    it('should update learning goal and regenerate roadmap', async () => {
      const res = await request(app.getHttpServer())
        .patch('/roadmap/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'competitive' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.goal).toBe('competitive');
      expect(res.body.data.steps).toBeDefined();
    });

    it('should allow unlimited goal swaps on any tier', async () => {
      // Downgrade to free tier
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free' },
      });

      // Multiple swaps on free tier — all should succeed
      await request(app.getHttpServer())
        .patch('/roadmap/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'dsa' })
        .expect(200);

      await request(app.getHttpServer())
        .patch('/roadmap/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'placements' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch('/roadmap/goal')
        .set('Cookie', studentCookie)
        .send({ goal: 'competitive' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.goal).toBe('competitive');

      // Restore premium
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'premium' },
      });
    });
  });

  describe('AI Mentor - POST /mentor-ai/chat', () => {
    it('should get chat replies and enforce 10-message limit for free tier', async () => {
      // Downgrade to free tier
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free' },
      });

      // Clear redis chat limit first
      const limitKey = `mentor_chat_limit:${studentId}`;
      const redisService = app.get(RedisService);
      await redisService.del(limitKey);

      // Send 10 messages successfully
      for (let i = 0; i < 10; i++) {
        const res = await request(app.getHttpServer())
          .post('/mentor-ai/chat')
          .set('Cookie', studentCookie)
          .send({ message: `Message number ${i}` })
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.reply).toBeDefined();
      }

      // 11th message should fail with 402 Payment Required
      await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: '11th message' })
        .expect(402);
    });

    it('should reject messages longer than 500 characters on the free tier', async () => {
      // Downgrade to free tier
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free' },
      });

      const longMessage = 'a'.repeat(501);

      const res = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: longMessage })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('500 character limit');
    });

    it('should store and inject conversation history for premium tier users', async () => {
      // Upgrade to premium
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'premium' },
      });

      const sessionId = 'test-session-123';
      const redisService = app.get(RedisService);
      const historyKey = `mentor_chat_history:${studentId}:${sessionId}`;
      await redisService.del(historyKey);

      // Send first message
      const res1 = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'I like algorithms', session_id: sessionId })
        .expect(201);

      expect(res1.body.success).toBe(true);

      // Send second message, which should receive the first message as history context
      const res2 = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'What was my favorite topic?', session_id: sessionId })
        .expect(201);

      expect(res2.body.success).toBe(true);
      expect(res2.body.data.reply).toContain('I like algorithms');
    });
  });

  describe('Skill DNA - GET /skill-dna', () => {
    it('should return insufficient_data if registered < 7 days', async () => {
      const res = await request(app.getHttpServer())
        .get('/skill-dna')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('insufficient_data');
      expect(res.body.data.available_in_days).toBe(7);
    });

    it('should compute DNA if registered >= 7 days', async () => {
      // Mock user registration date to 10 days ago
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: studentId },
        data: { createdAt: tenDaysAgo },
      });

      const res = await request(app.getHttpServer())
        .get('/skill-dna')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('computed');
    });
  });

  describe('Forecasting - GET /forecasts', () => {
    it('should return 402 for Free tier users', async () => {
      // Downgrade user to free tier
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free' },
      });

      const res = await request(app.getHttpServer())
        .get('/forecasts')
        .set('Cookie', studentCookie)
        .expect(402);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PAYMENT_REQUIRED');
      expect(res.body.error.message).toContain('premium-only');
    });

    it('should return 200 with forecasts for Premium tier users', async () => {
      // Upgrade user to premium
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'premium' },
      });

      // Seed a couple of mastery / retention scores to ensure forecasts are generated
      const existingMastery = await prisma.masteryScore.findFirst({
        where: { userId: studentId, topicId: 'recursion' },
      });
      if (existingMastery) {
        await prisma.masteryScore.update({
          where: { id: existingMastery.id },
          data: { score: 0.8 },
        });
      } else {
        await prisma.masteryScore.create({
          data: { userId: studentId, topicId: 'recursion', score: 0.8, retentionScore: 0.8 },
        });
      }

      const res = await request(app.getHttpServer())
        .get('/forecasts')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.forecasts).toBeDefined();
      expect(Array.isArray(res.body.data.forecasts)).toBe(true);
      expect(res.body.data.forecasts.length).toBeGreaterThan(0);
      expect(res.body.data.forecasts[0].type).toBeDefined();
    });
  });

  describe('User Settings & AI Model Fallbacks - PATCH /users/me/settings', () => {
    it('should update user selected model successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me/settings')
        .set('Cookie', studentCookie)
        .send({ selectedModel: 'qwen-3' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.selectedModel).toBe('qwen-3');

      // Verify DB persists it
      const dbUser = await prisma.user.findUnique({ where: { id: studentId } });
      expect(dbUser?.selectedModel).toBe('qwen-3');
    });

    it('should use selected model if valid for free tier, or fallback', async () => {
      // Downgrade to free tier, select a valid free model
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'free', selectedModel: 'qwen-3' },
      });

      // Clear redis chat limit
      const limitKey = `mentor_chat_limit:${studentId}`;
      const redisService = app.get(RedisService);
      await redisService.del(limitKey);

      // Sending message should use the free model (qwen-3)
      const res = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'Hello AI Mentor' })
        .expect(201);

      expect(res.body.success).toBe(true);
      // Our mock returns `[Mock AI Mentor response using ${model}]`
      expect(res.body.data.reply).toContain('qwen-3');

      // Now set selectedModel to a premium one, which is invalid for free tier
      await prisma.user.update({
        where: { id: studentId },
        data: { selectedModel: 'deepseek-r1-groq' },
      });

      await redisService.del(limitKey);

      // Sending message should fall back to gemini-2.5-flash
      const resFallback = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'Hello again' })
        .expect(201);

      expect(resFallback.body.success).toBe(true);
      expect(resFallback.body.data.reply).toContain('gemini-2.5-flash');
    });

    it('should use selected model if valid for premium tier, or fallback', async () => {
      // Upgrade to premium, select a valid premium model
      await prisma.user.update({
        where: { id: studentId },
        data: { plan: 'premium', selectedModel: 'deepseek-r1-groq' },
      });

      const res = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'Premium user chat' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('deepseek-r1-groq');

      // Now set selectedModel to something invalid (e.g. unknown-model)
      await prisma.user.update({
        where: { id: studentId },
        data: { selectedModel: 'nonexistent-model-123' },
      });

      // Sending message should fall back to deepseek-r1-groq
      const resFallback = await request(app.getHttpServer())
        .post('/mentor-ai/chat')
        .set('Cookie', studentCookie)
        .send({ message: 'Fallback to default premium' })
        .expect(201);

      expect(resFallback.body.success).toBe(true);
      expect(resFallback.body.data.reply).toContain('deepseek-r1-groq');
    });
  });
});

