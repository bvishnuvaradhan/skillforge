import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('LearningLoop (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();

  const studentEmail = `student-loop-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';

  // Seeded IDs for verification
  let badgeId = '';
  let world1Id = '';
  let world2Id = '';
  let lessonId = '';
  let gameId = '';
  let bossId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // 1. Register and login student
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Learning Loop Student',
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

    // 2. Setup DLT state and initial default unlocked world progress for variables-kingdom
    await prisma.dltState.create({
      data: {
        userId: studentId,
        overallMastery: 0.1,
        overallRetention: 0.8,
        learningStyle: 'game_based',
      },
    });

    // 3. Seed Learning content for test
    const badge = await prisma.badge.create({
      data: {
        name: `Test Variables Badge ${uniqueId}`,
        description: 'Completed Variables Test Boss',
        imageUrl: 'http://test.com/badge.png',
        rarity: 'common',
      },
    });
    badgeId = badge.id;

    const w1 = await prisma.world.create({
      data: {
        name: `Variables Kingdom E2E ${uniqueId}`,
        slug: `variables-kingdom-e2e-${uniqueId}`,
        description: 'Variables world for testing',
        orderIndex: 1,
        status: 'published',
        unlockCriteria: {}, // Unlocked by default
      },
    });
    world1Id = w1.id;

    const w2 = await prisma.world.create({
      data: {
        name: `Conditions Valley E2E ${uniqueId}`,
        slug: `conditions-valley-e2e-${uniqueId}`,
        description: 'Conditions world for testing',
        orderIndex: 2,
        status: 'published',
        unlockCriteria: {
          required_topics: [
            { topic_id: 'variables', min_mastery: 0.5 }
          ]
        },
      },
    });
    world2Id = w2.id;

    // Set first world progress to unlocked
    await prisma.userWorldProgress.create({
      data: {
        userId: studentId,
        worldId: world1Id,
        status: 'unlocked',
      },
    });

    // Set second world progress to locked
    await prisma.userWorldProgress.create({
      data: {
        userId: studentId,
        worldId: world2Id,
        status: 'locked',
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        worldId: world1Id,
        title: 'Variables Basics',
        orderIndex: 1,
        estimatedMinutes: 5,
        topicTags: ['variables'],
        status: 'published',
        content: {
          blocks: [
            { type: 'paragraph', content: 'Variables store values.' }
          ]
        },
      },
    });
    lessonId = lesson.id;

    const game = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Logic Builder: Variable Assignment',
        gameType: 'logic_builder',
        orderIndex: 1,
        masteryContribution: 0.4,
        xpReward: 50,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          expected_output: '42'
        },
      },
    });
    gameId = game.id;

    const boss = await prisma.bossBattle.create({
      data: {
        worldId: world1Id,
        name: 'Variables Overlord',
        level: 'mini',
        passThreshold: 0.5,
        xpReward: 100,
        badgeId: badgeId,
        questions: [
          {
            id: 'q1',
            text: 'What keyword defines a constant?',
            options: ['const', 'let', 'var'],
            correctAnswer: 'const',
            topic: 'variables',
          }
        ],
      },
    });
    bossId = boss.id;
  });

  afterAll(async () => {
    // Cleanup everything
    await prisma.userBadge.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.bossAttempt.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.gameAttempt.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.userWorldProgress.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.dltState.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.masteryScore.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.lesson.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.game.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.bossBattle.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.world.deleteMany({ where: { id: { in: [world1Id, world2Id] } } }).catch(() => {});
    await prisma.badge.deleteMany({ where: { id: badgeId } }).catch(() => {});
    await prisma.user.delete({ where: { id: studentId } }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /worlds', () => {
    it('should retrieve list of published worlds with student progress states', async () => {
      const response = await request(app.getHttpServer())
        .get('/worlds')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      const w1Progress = response.body.data.find((w: any) => w.id === world1Id);
      expect(w1Progress).toBeDefined();
      expect(w1Progress.progress.status).toBe('unlocked');

      const w2Progress = response.body.data.find((w: any) => w.id === world2Id);
      expect(w2Progress).toBeDefined();
      expect(w2Progress.progress.status).toBe('locked');
    });
  });

  describe('GET /worlds/:slug', () => {
    it('should return 403 Forbidden for locked worlds', async () => {
      const slug2 = `conditions-valley-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug2}`)
        .set('Cookie', studentCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WORLD_LOCKED');
    });

    it('should return 200 and details for unlocked world', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug1}`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe(slug1);
      expect(response.body.data.lessons).toBeInstanceOf(Array);
      expect(response.body.data.games).toBeInstanceOf(Array);
      expect(response.body.data.boss_battles).toBeInstanceOf(Array);
    });
  });

  describe('GET /worlds/:slug/lessons/:lessonId', () => {
    it('should retrieve lesson content details', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug1}/lessons/${lessonId}`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(lessonId);
      expect(response.body.data.content).toBeDefined();
    });
  });

  describe('POST /worlds/:slug/lessons/:lessonId/complete', () => {
    it('should successfully complete the lesson and award initial XP', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .post(`/worlds/${slug1}/lessons/${lessonId}/complete`)
        .set('Cookie', studentCookie)
        .expect(201); // NestJS default for POST is 201

      expect(response.body.success).toBe(true);
      expect(response.body.data.xp_earned).toBe(25);
    });
  });

  describe('GET /dlt/me and GET /mastery', () => {
    it('should retrieve student DLT state and mastery scores', async () => {
      const dltResponse = await request(app.getHttpServer())
        .get('/dlt/me')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(dltResponse.body.success).toBe(true);
      expect(dltResponse.body.data.xp_total).toBeDefined();

      const masteryResponse = await request(app.getHttpServer())
        .get('/mastery')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(masteryResponse.body.success).toBe(true);
      expect(masteryResponse.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /games/:id/submit', () => {
    it('should reject submission with missing structural template keys', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          // missing 'blocks', 'connections', 'output_node'
          time_seconds: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_SUBMISSION');
    });

    it('should accept valid submission and record game attempt successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          blocks: ['let age', '=', '42'],
          connections: [],
          output_node: '42',
          time_seconds: 15,
          hints_used: 0
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.xp_earned).toBeDefined();
    });
  });

  describe('POST /boss/:id/submit', () => {
    it('should grade boss battle questions, award XP, and unlock badge', async () => {
      const response = await request(app.getHttpServer())
        .post(`/boss/${bossId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'const' }
          ],
          timeSeconds: 20
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.score).toBe(1.0);
      expect(response.body.data.badge_earned).toBeDefined();
      expect(response.body.data.badge_earned.id).toBe(badgeId);

      // Verify UserBadge is saved in DB
      const userBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: studentId, badgeId } }
      });
      expect(userBadge).not.toBeNull();
    });
  });
});
