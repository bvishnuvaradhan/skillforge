import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';
import { CodeRunnerService } from '../src/boss/code-runner.service';

jest.setTimeout(30000);

describe('BossSessionAndProblems (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();
  const studentEmail = `student-boss-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';
  let bossId = '';
  let badgeId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(CodeRunnerService)
    .useValue({
      runCode: jest.fn().mockImplementation(async (_lang, code) => {
        if (code.includes('compile_fail')) {
          return { success: false, compileError: 'Compilation failed', testResults: [] };
        }
        if (code.includes('test_fail')) {
          return { success: false, testResults: [{ input: '0', output: '0', expected: '32', passed: false, error: 'Wrong output' }] };
        }
        if (code.includes('fail')) {
          return { success: false, compileError: 'Compilation failed', testResults: [] };
        }
        return { success: true, testResults: [{ input: '2', output: '4', expected: '4', passed: true }] };
      }),
    })
    .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // 1. Register and login student
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Boss Test Student',
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

    // 2. Setup DLT state
    await prisma.dltState.create({
      data: {
        userId: studentId,
        overallMastery: 0.1,
        overallRetention: 0.8,
        learningStyle: 'game_based',
      },
    });

    // 3. Ensure variables-operators world exists and is unlocked
    let world = await prisma.world.findUnique({ where: { slug: 'variables-operators' } });
    if (!world) {
      world = await prisma.world.create({
        data: {
          name: 'Variables Operators',
          slug: 'variables-operators',
          description: 'Desc',
          orderIndex: 1,
          status: 'published',
          unlockCriteria: {},
        }
      });
    }

    await prisma.userWorldProgress.upsert({
      where: { userId_worldId: { userId: studentId, worldId: world.id } },
      update: {
        status: 'unlocked',
        lessonsCompleted: 10,
        gamesCompleted: 10,
        originalProblemsCompleted: ['circle_area'],
        externalProblemsCompleted: ['lc_2469'],
      },
      create: {
        userId: studentId,
        worldId: world.id,
        status: 'unlocked',
        lessonsCompleted: 10,
        gamesCompleted: 10,
        originalProblemsCompleted: ['circle_area'],
        externalProblemsCompleted: ['lc_2469'],
      },
    });

    // 4. Create badge
    const badge = await prisma.badge.create({
      data: {
        name: `Test Badge ${uniqueId}`,
        description: 'Test badge',
        imageUrl: 'http://test.com/img.png',
        rarity: 'common',
      }
    });
    badgeId = badge.id;

    // 5. Create Boss Battle
    const boss = await prisma.bossBattle.create({
      data: {
        worldId: world.id,
        name: 'Variables Overlord E2E',
        level: 'mini',
        passThreshold: 0.5,
        xpReward: 100,
        badgeId: badgeId,
        questions: {
          level1: {
            type: 'quiz',
            questions: [
              { id: 'q1', text: 'Q1', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q2', text: 'Q2', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q3', text: 'Q3', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q4', text: 'Q4', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q5', text: 'Q5', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' }
            ]
          },
          level2: {
            type: 'matching',
            prompt: 'Match pairs',
            pairs: [
              { left: 'int', right: 'integer' },
              { left: 'float', right: 'floating point' }
            ]
          },
          level3: {
            type: 'boss_fight',
            monster: { name: 'Variables Overlord', maxHp: 100 },
            challenges: {
              JAVASCRIPT: {
                prompt: 'Write doubleValue function',
                starterCode: 'function doubleValue(x) {}',
                testCases: [{ input: '2', output: '4' }]
              }
            }
          }
        } as any,
      }
    });
    bossId = boss.id;
  });

  afterAll(async () => {
    await prisma.userWorldProgress.deleteMany({ where: { user: { email: { contains: 'student-' } } } }).catch(() => {});
    await prisma.dltState.deleteMany({ where: { user: { email: { contains: 'student-' } } } }).catch(() => {});
    await prisma.bossBattle.deleteMany({ where: { id: bossId } }).catch(() => {});
    await prisma.badge.deleteMany({ where: { id: badgeId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { contains: 'student-' } } }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('Prerequisites Gating Check', () => {
    let freshStudentCookie: string[] = [];
    let freshStudentId = '';

    beforeAll(async () => {
      const freshEmail = `student-gate-${uniqueId}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Gate Student',
          email: freshEmail,
          password: studentPassword,
          role: 'student',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: freshEmail,
          password: studentPassword,
        });
      freshStudentCookie = (loginRes.headers['set-cookie'] as unknown as string[]) || [];
      freshStudentId = loginRes.body.data.user.id;

      let world = await prisma.world.findUnique({ where: { slug: 'variables-operators' } });
      await prisma.userWorldProgress.create({
        data: {
          userId: freshStudentId,
          worldId: world!.id,
          status: 'unlocked',
          lessonsCompleted: 0,
          gamesCompleted: 0,
        }
      });
    });

    it('should block completing a problem if lessons/games are not complete', async () => {
      const res = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/complete')
        .set('Cookie', freshStudentCookie)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREREQUISITES_NOT_MET');
    });

    it('should block starting a boss session if lessons/games/problems are not complete', async () => {
      const res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/start`)
        .set('Cookie', freshStudentCookie)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BOSS_LOCKED');
    });
  });

  describe('POST /worlds/:slug/problems/:type/:problemId/complete', () => {
    it('should complete an original problem successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/complete')
        .set('Cookie', studentCookie)
        .send({ code: 'function celsiusToFahrenheit(c) { return c * 9/5 + 32; }', language: 'javascript' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.xp_earned).toBe(15);

      // Check duplicates
      const dup = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/complete')
        .set('Cookie', studentCookie)
        .send({ code: 'function celsiusToFahrenheit(c) { return c * 9/5 + 32; }', language: 'javascript' })
        .expect(201);

      expect(dup.body.success).toBe(true);
      expect(dup.body.data.xp_earned).toBe(0);
    });

    it('should complete an external problem successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/external/lc_2235/complete')
        .set('Cookie', studentCookie)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.xp_earned).toBe(10);
    });
  });

  describe('Boss Session Endpoints', () => {
    it('should start a boss session', async () => {
      const res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/start`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.lives).toBe(3);
      expect(res.body.data.currentLevel).toBe(1);
    });

    it('should retrieve active boss session status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/boss/${bossId}/session/status`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.lives).toBe(3);
      expect(res.body.data.currentLevel).toBe(1);
    });

    it('should submit answers and transition level 1 -> level 2 -> level 3', async () => {
      // 1. Fail Level 1
      const failL1 = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [{ question_id: 'q1', answer: 'wrong' }]
        })
        .expect(201);

      expect(failL1.body.success).toBe(true);
      expect(failL1.body.data.success).toBe(false);
      expect(failL1.body.data.lives).toBe(2);

      // 2. Pass Level 1
      const passL1 = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'A' },
            { question_id: 'q2', answer: 'A' },
            { question_id: 'q3', answer: 'A' },
            { question_id: 'q4', answer: 'A' },
            { question_id: 'q5', answer: 'A' }
          ]
        })
        .expect(201);

      expect(passL1.body.success).toBe(true);
      expect(passL1.body.data.success).toBe(true);
      expect(passL1.body.data.currentLevel).toBe(2);

      // 3. Fail Level 2
      const failL2 = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          matchedPairs: [{ left: 'int', right: 'floating point' }]
        })
        .expect(201);

      expect(failL2.body.success).toBe(true);
      expect(failL2.body.data.success).toBe(false);
      expect(failL2.body.data.lives).toBe(1);

      // 4. Pass Level 2
      const passL2 = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          matchedPairs: [
            { left: 'int', right: 'integer' },
            { left: 'float', right: 'floating point' }
          ]
        })
        .expect(201);

      expect(passL2.body.success).toBe(true);
      expect(passL2.body.data.success).toBe(true);
      expect(passL2.body.data.currentLevel).toBe(3);

      // 5. Test Timeout on Level 3
      const timeoutRes = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/timeout`)
        .set('Cookie', studentCookie)
        .send({ partialCode: 'function doubleValue(x) { return' })
        .expect(201);

      expect(timeoutRes.body.data.lives).toBe(0); // lost the last life
      expect(timeoutRes.body.data.reset).toBe(true);
    });
  });

  describe('Original Problems Run and Save (Section 2)', () => {
    beforeAll(async () => {
      const world = await prisma.world.findUnique({ where: { slug: 'variables-operators' } });
      await prisma.userWorldProgress.update({
        where: { userId_worldId: { userId: studentId, worldId: world!.id } },
        data: {
          originalProblemsCompleted: [],
        },
      });
    });

    it('should save a problem draft successfully and return it, and block payload > 50KB', async () => {
      const draftCode = 'function celsiusToFahrenheit(c) { // draft }';
      const res = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/save')
        .set('Cookie', studentCookie)
        .send({ code: draftCode })
        .expect(201);

      expect(res.body.success).toBe(true);

      // Verify that getting the world returns the saved draft
      const worldRes = await request(app.getHttpServer())
        .get('/worlds/variables-operators')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(worldRes.body.success).toBe(true);
      expect(worldRes.body.data.progress.drafts.celsius_fahrenheit).toBe(draftCode);
      const prob = worldRes.body.data.original_problems.find((p: any) => p.id === 'celsius_fahrenheit');
      expect(prob.saved_code).toBe(draftCode);

      // Try payload > 50KB
      const hugeCode = 'a'.repeat(51 * 1024);
      const hugeRes = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/save')
        .set('Cookie', studentCookie)
        .send({ code: hugeCode })
        .expect(400);

      expect(hugeRes.body.success).toBe(false);
      expect(hugeRes.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('should run code on sample test cases with expected responses without completing the problem', async () => {
      // 1. Run with compilation error
      const badCode = 'function celsiusToFahrenheit(c) { // compile_fail\n return c * ; }';
      const runBad = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/run')
        .set('Cookie', studentCookie)
        .send({ code: badCode, language: 'javascript' })
        .expect(201);

      expect(runBad.body.success).toBe(true);
      expect(runBad.body.data.passed).toBe(false);
      expect(runBad.body.data.error.code).toBe('COMPILE_ERROR');

      // 2. Run with failing test cases
      const wrongCode = 'function celsiusToFahrenheit(c) { // test_fail\n return c + 1; }';
      const runWrong = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/run')
        .set('Cookie', studentCookie)
        .send({ code: wrongCode, language: 'javascript' })
        .expect(201);

      expect(runWrong.body.success).toBe(true);
      expect(runWrong.body.data.passed).toBe(false);
      expect(runWrong.body.data.error.code).toBe('TESTS_FAILED');
      expect(runWrong.body.data.testResults.length).toBeGreaterThan(0);

      // 3. Run with correct code (passes run, but does not complete problem)
      const correctCode = 'function celsiusToFahrenheit(c) { return c * 9/5 + 32; }';
      const runCorrect = await request(app.getHttpServer())
        .post('/worlds/variables-operators/problems/original/celsius_fahrenheit/run')
        .set('Cookie', studentCookie)
        .send({ code: correctCode, language: 'javascript' })
        .expect(201);

      expect(runCorrect.body.success).toBe(true);
      expect(runCorrect.body.data.passed).toBe(true);
      expect(runCorrect.body.data.error).toBeNull();

      // Verify that the problem is STILL NOT marked as completed
      const worldRes = await request(app.getHttpServer())
        .get('/worlds/variables-operators')
        .set('Cookie', studentCookie)
        .expect(200);

      const prob = worldRes.body.data.original_problems.find((p: any) => p.id === 'celsius_fahrenheit');
      expect(prob.completed).toBe(false);
    });
  });
});
