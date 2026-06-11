import { Injectable } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { RedisService } from '../auth/redis.service';

@Injectable()
export class DltService {
  constructor(private readonly redisService: RedisService) {}

  async getMyDlt(userId: string) {
    // Try Redis cache first
    const cached = await this.redisService.get(`dlt:${userId}`);
    if (cached) {
      return JSON.parse(cached) as Record<string, unknown>;
    }

    const dlt = await prisma.dltState.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastActiveAt: true },
    });

    const result = {
      overall_mastery: dlt?.overallMastery ?? 0,
      overall_retention: dlt?.overallRetention ?? 0,
      xp_total: dlt?.xpTotal ?? 0,
      level: dlt?.level ?? 1,
      streak_count: user?.streakCount ?? 0,
      last_computed_at: dlt?.lastComputedAt ?? null,
    };

    // Cache for 5 minutes
    await this.redisService.set(`dlt:${userId}`, JSON.stringify(result), 300);

    return result;
  }

  async getMasteryScores(userId: string) {
    const scores = await prisma.masteryScore.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
    });

    return scores.map((s) => ({
      topic_id: s.topicId,
      score: s.score,
      game_score: s.gameScore,
      assessment_score: s.assessmentScore,
      retention_score: s.retentionScore,
      last_activity_at: s.lastActivityAt,
    }));
  }
}
