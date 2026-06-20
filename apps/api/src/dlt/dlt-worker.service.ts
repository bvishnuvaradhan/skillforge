import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job, Queue, ConnectionOptions } from 'bullmq';
import { prisma } from '@skillforge/db';
import { EventsGateway } from '../common/events.gateway';
import { RedisService } from '../auth/redis.service';
import { RoadmapService } from '../roadmap/roadmap.service';

export interface DltJobPayload {
  userId: string;
  eventType: 'game_attempt' | 'boss_attempt' | 'lesson_complete' | 'interview_attempt' | 'exam_attempt';
  topicTags: string[];
  score: number; // 0.0–1.0
  xpEarned: number;
}

// Mastery weights per activity type (sum = 1.0)
const WEIGHTS = {
  game: 0.35,
  assessment: 0.15,
  coding: 0.15,
  interview: 0.15,
  retention: 0.20,
};

const STREAK_MILESTONES = [7, 30, 100];

@Injectable()
export class DltWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker!: Worker;
  private queue!: Queue;
  private connection!: ConnectionOptions;
  private readonly logger = new Logger(DltWorkerService.name);

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly redisService: RedisService,
    private readonly roadmapService: RoadmapService,
  ) {}

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    const url = new URL(redisUrl);

    this.connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
    };

    this.queue = new Queue('dlt-updates', { connection: this.connection });

    this.worker = new Worker<DltJobPayload>(
      'dlt-updates',
      async (job: Job<DltJobPayload>) => {
        await this.processDltUpdate(job.data);
      },
      { connection: this.connection, concurrency: 5 },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`DLT job ${job.id ?? 'unknown'} completed for user ${job.data.userId}`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`DLT job ${job?.id ?? 'unknown'} failed:`, err.message);
    });

    this.logger.log('DLT BullMQ worker started.');
  }

  async onModuleDestroy() {
    try {
      // Suppress ioredis 'Connection is closed' errors emitted during graceful shutdown
      this.worker?.on('error', () => {});
      this.queue?.on('error', () => {});
      await this.worker?.close();
      await this.queue?.close();
    } catch {
      // Ignore teardown errors (BullMQ ioredis socket close race)
    }
  }

  /**
   * Enqueue a DLT update job
   */
  async enqueueDltUpdate(payload: DltJobPayload): Promise<void> {
    await this.queue.add('dlt-update', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  private async processDltUpdate(data: DltJobPayload): Promise<void> {
    try {
      const { userId, topicTags, score, xpEarned, eventType } = data;

      // Check if user exists (handles rapid test cleanup cases)
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        this.logger.warn(`User ${userId} no longer exists. Skipping DLT update.`);
        return;
      }

      // 1. Update mastery scores for each topic
      for (const topicId of topicTags) {
        const existing = await prisma.masteryScore.findFirst({ where: { userId, topicId } });

        const gameScore = eventType === 'game_attempt'
          ? Math.max(score, existing?.gameScore ?? 0)
          : (existing?.gameScore ?? 0);
        const assessmentScore = eventType === 'exam_attempt'
          ? Math.max(score, existing?.assessmentScore ?? 0)
          : (existing?.assessmentScore ?? 0);
        const codingScore = existing?.codingScore ?? 0;
        const interviewScore = eventType === 'interview_attempt'
          ? Math.max(score, existing?.interviewScore ?? 0)
          : (existing?.interviewScore ?? 0);
        const retentionScore = existing?.retentionScore ?? 0;

        // Mastery formula from agents.md
        const newMastery = Math.min(
          1.0,
          WEIGHTS.game * gameScore +
            WEIGHTS.assessment * assessmentScore +
            WEIGHTS.coding * codingScore +
            WEIGHTS.interview * interviewScore +
            WEIGHTS.retention * retentionScore,
        );

        if (existing) {
          await prisma.masteryScore.update({
            where: { id: existing.id },
            data: {
              score: newMastery,
              gameScore,
              assessmentScore,
              interviewScore,
              lastActivityAt: new Date(),
            },
          });
        } else {
          await prisma.masteryScore.create({
            data: {
              userId,
              topicId,
              score: newMastery,
              gameScore: eventType === 'game_attempt' ? score : 0,
              assessmentScore: eventType === 'exam_attempt' ? score : 0,
              codingScore: 0,
              interviewScore: eventType === 'interview_attempt' ? score : 0,
              retentionScore: 0,
              lastActivityAt: new Date(),
            },
          });
        }
      }

      // 2. Update DLT state (XP, level, overall mastery)
      const allScores = await prisma.masteryScore.findMany({ where: { userId } });
      const overallMastery =
        allScores.length > 0
          ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
          : 0;

      const dlt = await prisma.dltState.findUnique({ where: { userId } });
      const newXp = (dlt?.xpTotal ?? 0) + xpEarned;
      const newLevel = Math.floor(newXp / 1000) + 1;

      const updatedDlt = await prisma.dltState.upsert({
        where: { userId },
        update: {
          overallMastery,
          xpTotal: newXp,
          level: newLevel,
          lastComputedAt: new Date(),
        },
        create: {
          userId,
          overallMastery,
          xpTotal: newXp,
          level: newLevel,
        },
      });

      // 3. Streak tracking
      await this.updateStreak(userId);

      // 4. World unlock evaluation
      await this.evaluateWorldUnlocks(userId, overallMastery);

      // 5. Invalidate Redis cache
      await this.redisService.del(`dlt:${userId}`);

      // 5.5 Regenerate roadmap based on updated DLT
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { primaryGoal: true },
        });
        if (user && user.primaryGoal) {
          await this.roadmapService.regenerateRoadmap(userId, user.primaryGoal);
        }
      } catch (err) {
        this.logger.error(`Failed to regenerate roadmap for user ${userId}:`, err);
      }

      // 6. Emit dlt_updated socket event
      this.eventsGateway.emitDltUpdated(userId, {
        overall_mastery: updatedDlt.overallMastery,
        xp_total: updatedDlt.xpTotal,
        level: updatedDlt.level,
        topic_tags: topicTags,
      });
    } catch (err: any) {
      if (
        err.code === 'P2003' ||
        err.message?.includes('Foreign key') ||
        err.message?.includes('not found') ||
        err.message?.includes('violates foreign key constraint')
      ) {
        this.logger.warn(`User was deleted during DLT update processing: ${err.message}`);
      } else {
        throw err;
      }
    }
  }

  private async updateStreak(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { lastActiveAt: true, streakCount: true } });
    if (!user) return;

    const now = new Date();
    const lastActive = user.lastActiveAt;
    let newStreak = user.streakCount;

    if (lastActive) {
      const diffMs = now.getTime() - lastActive.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day — no change
        return;
      } else if (diffDays === 1) {
        // Consecutive day — increment
        newStreak += 1;
      } else {
        // Gap of 2+ days — reset
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { streakCount: newStreak, lastActiveAt: now },
    });

    // Check milestones
    if (STREAK_MILESTONES.includes(newStreak)) {
      this.eventsGateway.emitStreakMilestone(userId, {
        streak: newStreak,
        message: `🔥 Amazing! You've maintained a ${newStreak}-day streak!`,
      });
    }
  }

  /**
   * 7-step World Unlock Logic per agents.md
   */
  private async evaluateWorldUnlocks(userId: string, overallRetention: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { lastActiveAt: true } });
    if (!user) return;

    // Step 4: active in last 14 days
    const lastActive = user.lastActiveAt;
    const isRecent = lastActive
      ? (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24) <= 14
      : false;

    // Step 3: overall retention check
    if (overallRetention < 0.65 || !isRecent) return;

    const worlds = await prisma.world.findMany({
      where: { status: 'published' },
      orderBy: { orderIndex: 'asc' },
    });

    const masteryScores = await prisma.masteryScore.findMany({ where: { userId } });
    const masteryMap = new Map(masteryScores.map((m) => [m.topicId, m.score]));

    for (const world of worlds) {
      // Check current progress
      const progress = await prisma.userWorldProgress.findUnique({
        where: { userId_worldId: { userId, worldId: world.id } },
      });

      if (progress && ['unlocked', 'in_progress', 'completed'].includes(progress.status)) continue;

      // Step 1–2: check unlock_criteria
      const criteria = world.unlockCriteria as Record<string, unknown>;
      const requiredTopics = (criteria.required_topics as Array<{ topic_id: string; min_mastery: number }>) ?? [];

      const allTopicsMeet = requiredTopics.every(
        (req) => (masteryMap.get(req.topic_id) ?? 0) >= req.min_mastery,
      );

      if (!allTopicsMeet) continue;

      // Steps 5–7: unlock, emit, create notification
      await prisma.userWorldProgress.upsert({
        where: { userId_worldId: { userId, worldId: world.id } },
        update: { status: 'unlocked', unlockedAt: new Date() },
        create: { userId, worldId: world.id, status: 'unlocked', unlockedAt: new Date() },
      });

      this.eventsGateway.emitWorldUnlocked(userId, {
        world_slug: world.slug,
        world_name: world.name,
        message: `🌍 ${world.name} has been unlocked!`,
      });

      this.logger.log(`World ${world.slug} unlocked for user ${userId}`);
    }
  }
}
