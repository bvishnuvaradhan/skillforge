import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { DltWorkerService } from '../dlt/dlt-worker.service';
import { EventsGateway } from '../common/events.gateway';
import { RedisService } from '../auth/redis.service';

const BOSS_COOLDOWN_SECONDS = 24 * 60 * 60; // 24 hours cooldown between attempts

@Injectable()
export class BossService {
  constructor(
    private readonly dltWorker: DltWorkerService,
    private readonly eventsGateway: EventsGateway,
    private readonly redisService: RedisService,
  ) {}

  async getBoss(userId: string, bossId: string) {
    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
      include: {
        badge: true,
        world: { include: { progressEntries: { where: { userId } } } },
      },
    });

    if (!boss) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Boss battle not found', details: {} },
      });
    }

    // World access check
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

    // Check cooldown
    const cooldownKey = `boss_cooldown:${userId}:${bossId}`;
    const onCooldown = await this.redisService.exists(cooldownKey);
    const cooldownRemaining = onCooldown ? await this.redisService.ttl(cooldownKey) : 0;

    return {
      id: boss.id,
      name: boss.name,
      level: boss.level,
      pass_threshold: boss.passThreshold,
      xp_reward: boss.xpReward,
      requires_human_review: boss.requiresHumanReview,
      // Send full structured questions object (level1/level2/level3) — answers stripped in session service
      questions: boss.questions as Record<string, unknown>,
      badge: boss.badge ? {
        id: boss.badge.id,
        name: boss.badge.name,
        rarity: boss.badge.rarity,
        image_url: boss.badge.imageUrl,
      } : null,
      on_cooldown: onCooldown,
      cooldown_remaining_seconds: cooldownRemaining > 0 ? cooldownRemaining : 0,
    };
  }

  async submitBoss(
    userId: string,
    bossId: string,
    answers: Array<{ question_id: string; answer: string }>,
    timeSeconds: number,
  ) {
    // Cooldown check
    const cooldownKey = `boss_cooldown:${userId}:${bossId}`;
    const onCooldown = await this.redisService.exists(cooldownKey);
    if (onCooldown) {
      const remainingSeconds = await this.redisService.ttl(cooldownKey);
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'BOSS_ON_COOLDOWN',
          message: 'You must wait before attempting this boss again.',
          details: { retry_after_seconds: remainingSeconds > 0 ? remainingSeconds : BOSS_COOLDOWN_SECONDS },
        },
      });
    }

    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossId },
      include: {
        badge: true,
        world: { include: { progressEntries: { where: { userId } } } },
      },
    });

    if (!boss) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Boss battle not found', details: {} },
      });
    }

    // World access check
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

    // Grade MCQs
    const questions = boss.questions as Array<{ id: string; correctAnswer?: string; correct_answer?: string; topic?: string }>;
    let correct = 0;
    const gradedAnswers = answers.map((ans) => {
      const q = questions.find((q) => q.id === ans.question_id);
      const expected = q ? (q.correctAnswer ?? q.correct_answer) : undefined;
      const isCorrect = q ? ans.answer === expected : false;
      if (isCorrect) correct++;
      return { question_id: ans.question_id, answer: ans.answer, correct: isCorrect, topic: q?.topic };
    });

    const score = questions.length > 0 ? correct / questions.length : 0;
    const passed = score >= boss.passThreshold;

    // Get attempt number
    const prevAttempts = await prisma.bossAttempt.count({ where: { userId, bossId } });

    // Record attempt
    await prisma.bossAttempt.create({
      data: {
        userId,
        bossId,
        score,
        passed,
        answers: gradedAnswers,
        timeSeconds,
        attemptNumber: prevAttempts + 1,
      },
    });

    // Set progressive cooldown if failed, reset if passed
    if (!passed) {
      const failuresKey = `boss_failures:${userId}:${bossId}`;
      const failuresVal = await this.redisService.get(failuresKey);
      const count = (failuresVal ? parseInt(failuresVal, 10) : 0) + 1;

      // Store failures count in Redis for 30 days
      await this.redisService.set(failuresKey, count.toString(), 30 * 24 * 60 * 60);

      let cooldownSeconds = 12 * 60 * 60; // 12 hours for Failure 4+
      if (count === 1) cooldownSeconds = 2 * 60 * 60; // 2 hours
      else if (count === 2) cooldownSeconds = 4 * 60 * 60; // 4 hours
      else if (count === 3) cooldownSeconds = 8 * 60 * 60; // 8 hours

      await this.redisService.set(cooldownKey, '1', cooldownSeconds);
    } else {
      // Victory: reset failures count and cooldown
      const failuresKey = `boss_failures:${userId}:${bossId}`;
      await this.redisService.del(failuresKey);
      await this.redisService.del(cooldownKey);
    }

    let badgeEarned = null;

    if (passed) {
      // Award XP
      await prisma.userWorldProgress.upsert({
        where: { userId_worldId: { userId, worldId: boss.worldId } },
        update: {
          xpEarned: { increment: boss.xpReward },
          status: 'completed',
          completedAt: new Date(),
        },
        create: {
          userId,
          worldId: boss.worldId,
          status: 'completed',
          xpEarned: boss.xpReward,
          completedAt: new Date(),
        },
      });

      // Award badge if configured
      if (boss.badgeId) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: boss.badgeId } },
        });

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: { userId, badgeId: boss.badgeId },
          });

          if (boss.badge) {
            badgeEarned = { id: boss.badge.id, name: boss.badge.name, rarity: boss.badge.rarity };
            this.eventsGateway.emitBadgeEarned(userId, {
              badge: badgeEarned,
              message: `🏆 Badge earned: ${boss.badge.name}!`,
            });
          }
        }
      }

      // Trigger DLT update + world unlock evaluation via BullMQ
      const topicTags = [...new Set(gradedAnswers.map((a) => a.topic).filter(Boolean) as string[])];
      await this.dltWorker.enqueueDltUpdate({
        userId,
        eventType: 'boss_attempt',
        topicTags: topicTags.length > 0 ? topicTags : ['general'],
        score,
        xpEarned: boss.xpReward,
      });
    }

    return {
      score,
      passed,
      xp_earned: passed ? boss.xpReward : 0,
      attempt_number: prevAttempts + 1,
      correct_answers: correct,
      total_questions: questions.length,
      badge_earned: badgeEarned,
      feedback: passed
        ? `🎉 Boss defeated! Score: ${Math.round(score * 100)}%`
        : `Keep training! Score: ${Math.round(score * 100)}%. You need ${Math.round(boss.passThreshold * 100)}% to pass.`,
    };
  }
}
