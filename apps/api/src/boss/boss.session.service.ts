import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { DltWorkerService } from '../dlt/dlt-worker.service';
import { EventsGateway } from '../common/events.gateway';
import { RedisService } from '../auth/redis.service';
import { CodeRunnerService } from './code-runner.service';
import { PRACTICE_PROBLEMS } from '../worlds/worlds.service';
import { checkSimilarity } from '../common/ast-similarity';

const SESSION_TTL = 3600; // 1 hour session TTL in seconds

export interface BossQuestionsJson {
  level1?: {
    type: string;
    questions: Array<{
      id: string;
      text: string;
      options: string[];
      correctAnswer: string;
      topic?: string;
    }>;
  };
  level2?: {
    type: string;
    prompt: string;
    pairs: Array<{
      left: string;
      right: string;
    }>;
  };
  level3?: {
    type: string;
    monster: {
      name: string;
      maxHp: number;
    };
    challenges: Record<string, {
      prompt: string;
      starterCode: string;
      testCases: Array<{ input: string; output: string }>;
      validationRegex?: string;
    }>;
  };
}

export interface BossSession {
  userId: string;
  bossId: string;
  lives: number;
  currentLevel: number;
  level1Questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    topic?: string;
  }>;
  level2MatchedPairs: Array<{
    left: string;
    right: string;
  }>;
  level3PartialCode: string;
}

@Injectable()
export class BossSessionService {
  constructor(
    private readonly dltWorker: DltWorkerService,
    private readonly eventsGateway: EventsGateway,
    private readonly redisService: RedisService,
    private readonly codeRunner: CodeRunnerService,
  ) {}

  private getSessionKey(userId: string, bossId: string): string {
    return `boss_session:${userId}:${bossId}`;
  }

  async startSession(userId: string, bossId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true }
    });
    const languageTrack = user?.languageTrack ?? 'JAVASCRIPT';

    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
      include: {
        world: {
          include: {
            progressEntries: { where: { userId } },
            lessons: { where: { status: 'published', languageTrack } },
            games: true,
          },
        },
      },
    });

    if (!boss) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Boss battle not found', details: {} },
      });
    }

    // Gating check
    const progress = boss.world.progressEntries[0];
    const isUnlockedByDefault = !boss.world.unlockCriteria ||
      Object.keys(boss.world.unlockCriteria as Record<string, any>).length === 0 ||
      boss.world.orderIndex === 1;
    const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');
    if (status === 'locked') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'WORLD_LOCKED', message: 'This world is locked.', details: {} },
      });
    }

    // Gating check: boss battle locked until lessons + games + both problem types are complete
    const totalLessons = boss.world.lessons.length;
    const lessonsCompletedCount = progress?.lessonsCompleted ?? 0;
    const gamesCount = boss.world.games.length;
    const gamesCompletedCount = progress?.gamesCompleted ?? 0;

    const allLessonsDone = lessonsCompletedCount >= totalLessons;
    const allGamesDone = gamesCompletedCount >= gamesCount;

    const originalProblems = PRACTICE_PROBLEMS[boss.world.slug]?.original || [];
    const externalProblems = PRACTICE_PROBLEMS[boss.world.slug]?.external || [];
    const originalCompleted = progress?.originalProblemsCompleted || [];
    const externalCompleted = progress?.externalProblemsCompleted || [];

    const allOriginalDone = originalProblems.every((p) => originalCompleted.includes(p.id));
    const allExternalDone = externalProblems.every((p) => externalCompleted.includes(p.id));

    const bossUnlocked = allLessonsDone && allGamesDone && allOriginalDone && allExternalDone;

    if (!bossUnlocked) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'BOSS_LOCKED',
          message: 'Boss battle is locked. Complete all lessons, games, and practice problems in this module first.',
          details: {},
        },
      });
    }

    const questionsJson = boss.questions as any as BossQuestionsJson;
    if (!questionsJson || !questionsJson.level1 || !questionsJson.level1.questions) {
      throw new BadRequestException('Boss battle data is not correctly structured.');
    }

    // Shuffle 5 questions from the pool of questions
    const pool = questionsJson.level1.questions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

    const session: BossSession = {
      userId,
      bossId,
      lives: 3,
      currentLevel: 1,
      level1Questions: selectedQuestions,
      level2MatchedPairs: [],
      level3PartialCode: '',
    };

    const key = this.getSessionKey(userId, bossId);
    await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);

    return this.sanitizeSession(session, questionsJson);
  }

  async getSessionStatus(userId: string, bossId: string) {
    const key = this.getSessionKey(userId, bossId);
    const data = await this.redisService.get(key);
    if (!data) {
      return null;
    }

    const session = JSON.parse(data) as BossSession;
    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
    });
    if (!boss) return null;

    const questionsJson = boss.questions as any as BossQuestionsJson;
    return this.sanitizeSession(session, questionsJson);
  }

  async submitLevel1(session: BossSession, answers: Array<{ question_id: string; answer: string }>, questionsJson: BossQuestionsJson) {
    const key = this.getSessionKey(session.userId, session.bossId);
    let correct = 0;
    const incorrectQuestionIds: string[] = [];

    session.level1Questions.forEach((q) => {
      const ans = answers.find((a) => a.question_id === q.id);
      if (ans && ans.answer === q.correctAnswer) {
        correct++;
      } else {
        incorrectQuestionIds.push(q.id);
      }
    });

    const passed = correct >= 4; // >= 80% (4/5)

    if (passed) {
      session.currentLevel = 2;
      await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
      return {
        success: true,
        lives: session.lives,
        currentLevel: 2,
        correctCount: correct,
        advanced: true,
        feedback: 'Level 1 passed! Moving to Level 2.',
        session: this.sanitizeSession(session, questionsJson),
      };
    } else {
      session.lives -= 1;
      if (session.lives <= 0) {
        await this.redisService.del(key);
        return {
          success: false,
          lives: 0,
          reset: true,
          correctCount: correct,
          feedback: 'You lost all your lives! The boss battle has been reset.',
        };
      } else {
        // Reshuffle 5 questions out of the pool
        const pool = questionsJson.level1?.questions || [];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        session.level1Questions = shuffled.slice(0, 5);
        await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
        return {
          success: false,
          lives: session.lives,
          currentLevel: 1,
          correctCount: correct,
          incorrectQuestionIds,
          feedback: 'Level 1 failed. You lost 1 life. Shuffled new questions.',
          session: this.sanitizeSession(session, questionsJson),
        };
      }
    }
  }

  async submitLevel2(session: BossSession, matchedPairs: Array<{ left: string; right: string }>, questionsJson: BossQuestionsJson) {
    const key = this.getSessionKey(session.userId, session.bossId);
    const correctPairs = questionsJson.level2?.pairs || [];
    const newMatchedPairs: Array<{ left: string; right: string }> = [];

    matchedPairs.forEach((pair) => {
      const isCorrect = correctPairs.some(
        (cp) => cp.left === pair.left && cp.right === pair.right,
      );
      if (isCorrect) {
        // Only keep track if not already in session.level2MatchedPairs
        if (!newMatchedPairs.some((np) => np.left === pair.left)) {
          newMatchedPairs.push(pair);
        }
      }
    });

    // Merge correct matched pairs
    session.level2MatchedPairs = [
      ...session.level2MatchedPairs,
      ...newMatchedPairs.filter(
        (np) => !session.level2MatchedPairs.some((lp) => lp.left === np.left),
      ),
    ];

    const passed = session.level2MatchedPairs.length === correctPairs.length;

    if (passed) {
      session.currentLevel = 3;
      await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
      return {
        success: true,
        lives: session.lives,
        currentLevel: 3,
        advanced: true,
        feedback: 'Level 2 passed! Time for the final Boss Fight!',
        session: this.sanitizeSession(session, questionsJson),
      };
    } else {
      session.lives -= 1;
      if (session.lives <= 0) {
        await this.redisService.del(key);
        return {
          success: false,
          lives: 0,
          reset: true,
          feedback: 'You lost all your lives! The boss battle has been reset.',
        };
      } else {
        await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
        return {
          success: false,
          lives: session.lives,
          currentLevel: 2,
          level2MatchedPairs: session.level2MatchedPairs,
          feedback: 'Level 2 failed. You lost 1 life. Correctly matched pairs are locked.',
          session: this.sanitizeSession(session, questionsJson),
        };
      }
    }
  }

  async submitLevel3(
    session: BossSession,
    code: string,
    language: string,
    timeSeconds: number,
    questionsJson: BossQuestionsJson,
  ) {
    const key = this.getSessionKey(session.userId, session.bossId);
    const boss = await prisma.bossBattle.findUnique({
      where: { id: session.bossId },
      include: { badge: true },
    });

    if (!boss) {
      throw new NotFoundException('Boss battle not found');
    }

    const langUpper = language.toUpperCase();
    const challenge = questionsJson.level3?.challenges?.[langUpper];
    if (!challenge) {
      throw new BadRequestException(`No coding challenge found for language track ${language}`);
    }

    // Robust extraction of function name from starter code
    let functionName = 'square';
    const starter = challenge.starterCode || '';
    
    // 1. Try JavaScript/TypeScript: function name(
    const jsMatch = starter.match(/function\s+(\w+)\s*\(/);
    // 2. Try Python: def name(
    const pyMatch = starter.match(/def\s+(\w+)\s*\(/);
    // 3. Try Java: static type name(
    const javaMatch = starter.match(/static\s+\w+\s+(\w+)\s*\(/);
    // 4. Try C/C++: type name(
    const cMatch = starter.match(/(?:int|bool|double|float|char|void)\s+(\w+)\s*\(/);

    if (jsMatch && jsMatch[1]) {
      functionName = jsMatch[1];
    } else if (pyMatch && pyMatch[1]) {
      functionName = pyMatch[1];
    } else if (javaMatch && javaMatch[1]) {
      functionName = javaMatch[1];
    } else if (cMatch && cMatch[1]) {
      functionName = cMatch[1];
    } else {
      // Fallback to prompt matching if starter code regex fails
      if (challenge.prompt.includes('doubleValue')) {
        functionName = 'doubleValue';
      } else if (challenge.prompt.includes('isEven')) {
        functionName = 'isEven';
      } else if (challenge.prompt.includes('sumToN')) {
        functionName = 'sumToN';
      } else if (challenge.prompt.includes('square')) {
        functionName = 'square';
      }
    }

    const runResult = await this.codeRunner.runCode(
      langUpper,
      code,
      functionName,
      challenge.testCases,
      challenge.validationRegex,
    );

    if (runResult.success) {
      // Defeated boss!
      const prevAttempts = await prisma.bossAttempt.count({
        where: { userId: session.userId, bossId: session.bossId },
      });

      // Save success attempt
      await prisma.bossAttempt.create({
        data: {
          userId: session.userId,
          bossId: session.bossId,
          score: 1.0,
          passed: true,
          answers: { code, runResult } as any,
          timeSeconds,
          attemptNumber: prevAttempts + 1,
        },
      });

      // Run AST plagiarism similarity check against other users' passed submissions
      try {
        const otherAttempts = await prisma.bossAttempt.findMany({
          where: {
            bossId: session.bossId,
            userId: { not: session.userId },
            passed: true,
          },
          select: {
            userId: true,
            answers: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        });

        for (const other of otherAttempts) {
          const otherAnswers = other.answers as any;
          const otherCode = otherAnswers?.code;
          if (typeof otherCode === 'string') {
            const simResult = checkSimilarity(code, otherCode, language);
            if (simResult.isSubstantial && simResult.similarity >= 0.85) {
              await prisma.report.create({
                data: {
                  reporterId: session.userId,
                  targetType: 'USER',
                  targetId: session.userId,
                  reason: `[SYSTEM: PLAGIARISM DETECTED] Code submission for Boss Battle '${boss.name}' (Level 3) has an AST similarity of ${(simResult.similarity * 100).toFixed(1)}% with user '${other.user.name}' (${other.userId}).`,
                  status: 'pending',
                },
              });
              break;
            }
          }
        }
      } catch (err) {
        // Log error internally but do not fail the submission flow
        console.error('Error during AST similarity check:', err);
      }

      // Award XP
      await prisma.userWorldProgress.upsert({
        where: { userId_worldId: { userId: session.userId, worldId: boss.worldId } },
        update: {
          xpEarned: { increment: boss.xpReward },
          status: 'completed',
          completedAt: new Date(),
        },
        create: {
          userId: session.userId,
          worldId: boss.worldId,
          status: 'completed',
          xpEarned: boss.xpReward,
          completedAt: new Date(),
        },
      });

      // Award badge if configured
      let badgeEarned = null;
      if (boss.badgeId) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId: session.userId, badgeId: boss.badgeId } },
        });

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: { userId: session.userId, badgeId: boss.badgeId },
          });

          if (boss.badge) {
            badgeEarned = { id: boss.badge.id, name: boss.badge.name, rarity: boss.badge.rarity };
            this.eventsGateway.emitBadgeEarned(session.userId, {
              badge: badgeEarned,
              message: `🏆 Badge earned: ${boss.badge.name}!`,
            });
          }
        }
      }

      // Trigger DLT update
      await this.dltWorker.enqueueDltUpdate({
        userId: session.userId,
        eventType: 'boss_attempt',
        topicTags: [functionName === 'isEven' ? 'conditionals' : functionName === 'sumToN' ? 'loops' : 'variables'],
        score: 1.0,
        xpEarned: boss.xpReward,
      });

      // Delete active session
      await this.redisService.del(key);

      return {
        success: true,
        lives: session.lives,
        passed: true,
        runResult,
        badge_earned: badgeEarned,
        xp_earned: boss.xpReward,
        feedback: `🎉 Boss defeated! Coding challenge passed successfully.`,
      };
    } else {
      // Failed coding submission
      session.lives -= 1;
      session.level3PartialCode = code;

      if (session.lives <= 0) {
        await this.redisService.del(key);
        return {
          success: false,
          lives: 0,
          reset: true,
          runResult,
          feedback: 'You lost all your lives! The boss battle has been reset.',
        };
      } else {
        await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
        return {
          success: false,
          lives: session.lives,
          currentLevel: 3,
          runResult,
          level3PartialCode: code,
          feedback: 'Coding challenge failed! You lost 1 life. Your partial code is preserved.',
          session: this.sanitizeSession(session, questionsJson),
        };
      }
    }
  }

  async submitActiveLevel(userId: string, bossId: string, payload: any) {
    const key = this.getSessionKey(userId, bossId);
    const data = await this.redisService.get(key);
    if (!data) {
      throw new BadRequestException('No active boss session found.');
    }

    const session = JSON.parse(data) as BossSession;
    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
    });
    if (!boss) throw new NotFoundException('Boss battle not found');

    const questionsJson = boss.questions as any as BossQuestionsJson;

    if (session.currentLevel === 1) {
      if (!payload.answers) {
        throw new BadRequestException('answers are required for Level 1 submission.');
      }
      return this.submitLevel1(session, payload.answers, questionsJson);
    } else if (session.currentLevel === 2) {
      if (!payload.matchedPairs) {
        throw new BadRequestException('matchedPairs is required for Level 2 submission.');
      }
      return this.submitLevel2(session, payload.matchedPairs, questionsJson);
    } else if (session.currentLevel === 3) {
      if (!payload.code || !payload.language) {
        throw new BadRequestException('code and language are required for Level 3 submission.');
      }
      return this.submitLevel3(session, payload.code, payload.language, payload.timeSeconds || 0, questionsJson);
    } else {
      throw new BadRequestException('Invalid session level.');
    }
  }

  async handleTimeout(userId: string, bossId: string, partialCode: string) {
    const key = this.getSessionKey(userId, bossId);
    const data = await this.redisService.get(key);
    if (!data) {
      throw new BadRequestException('No active boss session found.');
    }

    const session = JSON.parse(data) as BossSession;
    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
    });
    if (!boss) throw new NotFoundException('Boss battle not found');

    const questionsJson = boss.questions as any as BossQuestionsJson;

    session.lives -= 1;
    session.level3PartialCode = partialCode;

    if (session.lives <= 0) {
      await this.redisService.del(key);
      return {
        success: false,
        lives: 0,
        reset: true,
        feedback: 'Time out! You lost all your lives! The boss battle has been reset.',
      };
    } else {
      await this.redisService.set(key, JSON.stringify(session), SESSION_TTL);
      return {
        success: false,
        lives: session.lives,
        currentLevel: 3,
        level3PartialCode: partialCode,
        feedback: 'Time out! You lost 1 life. Your code has been preserved.',
        session: this.sanitizeSession(session, questionsJson),
      };
    }
  }

  private sanitizeSession(session: BossSession, questionsJson: BossQuestionsJson) {
    // Return session details without correctAnswers for Level 1
    return {
      userId: session.userId,
      bossId: session.bossId,
      lives: session.lives,
      currentLevel: session.currentLevel,
      level1: {
        type: 'quiz',
        questions: session.level1Questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          topic: q.topic,
        })),
      },
      level2: {
        type: 'matching',
        prompt: questionsJson.level2?.prompt || 'Match pairs',
        pairs: questionsJson.level2?.pairs.map((p) => p.left) || [], // Send left items, or options to match
        fullPairs: questionsJson.level2?.pairs || [], // The frontend can handle match layout
      },
      level2MatchedPairs: session.level2MatchedPairs,
      level3PartialCode: session.level3PartialCode,
    };
  }
}
