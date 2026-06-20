import { Test, TestingModule } from '@nestjs/testing';
import { BossSessionService, BossSession, BossQuestionsJson } from './boss.session.service';
import { DltWorkerService } from '../dlt/dlt-worker.service';
import { EventsGateway } from '../common/events.gateway';
import { RedisService } from '../auth/redis.service';
import { CodeRunnerService } from './code-runner.service';
import { prisma } from '@skillforge/db';
import { ForbiddenException } from '@nestjs/common';

jest.mock('@skillforge/db', () => ({
  prisma: {
    bossBattle: {
      findUnique: jest.fn(),
    },
    bossAttempt: {
      count: jest.fn(),
      create: jest.fn(),
    },
    userWorldProgress: {
      upsert: jest.fn(),
    },
    userBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    lesson: {
      findMany: jest.fn(),
    },
    game: {
      findMany: jest.fn(),
    },
  },
}));

describe('BossSessionService', () => {
  let service: BossSessionService;

  const mockRedisStore: Record<string, string> = {};

  const mockDltWorker = {
    enqueueDltUpdate: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventsGateway = {
    emitBadgeEarned: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn().mockImplementation(async (key) => mockRedisStore[key] || null),
    set: jest.fn().mockImplementation(async (key, val) => {
      mockRedisStore[key] = val;
    }),
    del: jest.fn().mockImplementation(async (key) => {
      delete mockRedisStore[key];
    }),
  };

  const mockCodeRunner = {
    runCode: jest.fn(),
  };

  const dummyQuestions: BossQuestionsJson = {
    level1: {
      type: 'quiz',
      questions: [
        { id: 'q1', text: 'Q1', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q2', text: 'Q2', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q3', text: 'Q3', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q4', text: 'Q4', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q5', text: 'Q5', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q6', text: 'Q6', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q7', text: 'Q7', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
        { id: 'q8', text: 'Q8', options: ['A', 'B'], correctAnswer: 'A', topic: 'vars' },
      ],
    },
    level2: {
      type: 'matching',
      prompt: 'Match',
      pairs: [
        { left: 'L1', right: 'R1' },
        { left: 'L2', right: 'R2' },
        { left: 'L3', right: 'R3' },
        { left: 'L4', right: 'R4' },
      ],
    },
    level3: {
      type: 'boss_fight',
      monster: { name: 'Sentinel', maxHp: 100 },
      challenges: {
        JAVASCRIPT: {
          prompt: 'Write square',
          starterCode: 'function square(n) {}',
          testCases: [{ input: '3', output: '9\n' }],
        },
      },
    },
  };

  const dummyBoss = {
    id: 'boss-id',
    name: 'Forest Sentinel',
    worldId: 'world-id',
    xpReward: 200,
    badgeId: 'badge-id',
    questions: dummyQuestions,
    world: {
      progressEntries: [{ status: 'unlocked' }],
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    for (const key in mockRedisStore) {
      delete mockRedisStore[key];
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BossSessionService,
        { provide: DltWorkerService, useValue: mockDltWorker },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CodeRunnerService, useValue: mockCodeRunner },
      ],
    }).compile();

    service = module.get<BossSessionService>(BossSessionService);
  });

  describe('startSession', () => {
    it('should initialize a session with 3 lives and level 1', async () => {
      (prisma.bossBattle.findUnique as jest.Mock).mockResolvedValue(dummyBoss);

      const result = await service.startSession('user-id', 'boss-id');

      expect(result.lives).toBe(3);
      expect(result.currentLevel).toBe(1);
      expect(result.level1.questions.length).toBe(5);
      expect(mockRedisStore['boss_session:user-id:boss-id']).toBeDefined();
    });

    it('should throw ForbiddenException if world is locked', async () => {
      const lockedBoss = {
        ...dummyBoss,
        world: {
          progressEntries: [{ status: 'locked' }],
        },
      };
      (prisma.bossBattle.findUnique as jest.Mock).mockResolvedValue(lockedBoss);

      await expect(service.startSession('user-id', 'boss-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Level 1 Quiz Grading', () => {
    it('should advance to Level 2 if >= 80% correct', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 1,
        level1Questions: dummyQuestions.level1!.questions.slice(0, 5),
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      const answers = initialSession.level1Questions.map((q) => ({
        question_id: q.id,
        answer: 'A', // All correct
      }));

      const res = await service.submitLevel1(initialSession, answers, dummyQuestions);

      expect(res.success).toBe(true);
      expect(res.currentLevel).toBe(2);
      expect(res.advanced).toBe(true);
    });

    it('should lose 1 life and reshuffle if failed', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 1,
        level1Questions: dummyQuestions.level1!.questions.slice(0, 5),
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      const answers = initialSession.level1Questions.map((q) => ({
        question_id: q.id,
        answer: 'B', // All wrong
      }));

      const res = await service.submitLevel1(initialSession, answers, dummyQuestions);

      expect(res.success).toBe(false);
      expect(res.lives).toBe(2);
      expect(res.currentLevel).toBe(1);
    });
  });

  describe('Level 2 Matching Grading', () => {
    it('should advance to Level 3 if 100% correct', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 2,
        level1Questions: [],
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      const matchedPairs = [
        { left: 'L1', right: 'R1' },
        { left: 'L2', right: 'R2' },
        { left: 'L3', right: 'R3' },
        { left: 'L4', right: 'R4' },
      ];

      const res = await service.submitLevel2(initialSession, matchedPairs, dummyQuestions);

      expect(res.success).toBe(true);
      expect(res.currentLevel).toBe(3);
    });

    it('should lock correct pairs and lose 1 life if failed', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 2,
        level1Questions: [],
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      const matchedPairs = [
        { left: 'L1', right: 'R1' }, // Correct
        { left: 'L2', right: 'R3' }, // Wrong
      ];

      const res = await service.submitLevel2(initialSession, matchedPairs, dummyQuestions);

      expect(res.success).toBe(false);
      expect(res.lives).toBe(2);
      expect(res.level2MatchedPairs).toEqual([{ left: 'L1', right: 'R1' }]);
    });
  });

  describe('Level 3 Coding & Timeout', () => {
    it('should successfully complete boss battle when code execution passes', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 3,
        level1Questions: [],
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      (prisma.bossBattle.findUnique as jest.Mock).mockResolvedValue(dummyBoss);
      (prisma.bossAttempt.count as jest.Mock).mockResolvedValue(0);
      (prisma.bossAttempt.create as jest.Mock).mockResolvedValue({});
      (prisma.userWorldProgress.upsert as jest.Mock).mockResolvedValue({});
      (prisma.userBadge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});

      mockCodeRunner.runCode.mockResolvedValue({ success: true, testResults: [{ passed: true }] });

      const res = await service.submitLevel3(initialSession, 'code', 'JAVASCRIPT', 120, dummyQuestions);

      expect(res.success).toBe(true);
      expect(res.passed).toBe(true);
      expect(mockRedisStore['boss_session:user-id:boss-id']).toBeUndefined(); // Deleted session
    });

    it('should lose 1 life and preserve code when code execution fails', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 3,
        level1Questions: [],
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);

      (prisma.bossBattle.findUnique as jest.Mock).mockResolvedValue(dummyBoss);
      mockCodeRunner.runCode.mockResolvedValue({ success: false, compileError: 'syntax error', testResults: [] });

      const res = await service.submitLevel3(initialSession, 'failed-code', 'JAVASCRIPT', 120, dummyQuestions);

      expect(res.success).toBe(false);
      expect(res.lives).toBe(2);
      expect(res.level3PartialCode).toBe('failed-code');
    });

    it('should handle timeout, lose 1 life and preserve code', async () => {
      const initialSession: BossSession = {
        userId: 'user-id',
        bossId: 'boss-id',
        lives: 3,
        currentLevel: 3,
        level1Questions: [],
        level2MatchedPairs: [],
        level3PartialCode: '',
      };
      mockRedisStore['boss_session:user-id:boss-id'] = JSON.stringify(initialSession);
      (prisma.bossBattle.findUnique as jest.Mock).mockResolvedValue(dummyBoss);

      const res = await service.handleTimeout('user-id', 'boss-id', 'partial-code');

      expect(res.success).toBe(false);
      expect(res.lives).toBe(2);
      expect(res.level3PartialCode).toBe('partial-code');
    });
  });
});
