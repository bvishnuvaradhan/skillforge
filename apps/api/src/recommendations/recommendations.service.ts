import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { RecommendationType, RecommendationImpact, RecommendationStatus, Recommendation } from '@prisma/client';
import { RedisService } from '../auth/redis.service';

interface RecommendationCandidate {
  type: RecommendationType;
  title: string;
  description: string;
  why: string;
  impact: RecommendationImpact;
  effortMinutes: number;
  confidence: number;
  topicId?: string;
  actionUrl?: string;
  priorityScore: number;
}

@Injectable()
export class RecommendationsService {

  constructor(private readonly redisService: RedisService) {}

  /**
   * Retrieves active recommendations for a user. Regenerates them if empty.
   */
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    // 1. Fetch from Redis cache
    const cacheKey = `recommendations:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Fetch from DB
    let activeRecs = await prisma.recommendation.findMany({
      where: { userId, status: RecommendationStatus.active },
      orderBy: { confidence: 'desc' }, // fallback ordering
    });

    // 3. If no active recommendations, run the generator
    if (activeRecs.length === 0) {
      await this.generateRecommendations(userId);
      activeRecs = await prisma.recommendation.findMany({
        where: { userId, status: RecommendationStatus.active },
      });
    }

    // 4. Cache and return
    await this.redisService.set(cacheKey, JSON.stringify(activeRecs), 3600); // 1 hour TTL
    return activeRecs;
  }

  /**
   * Generate candidates, arbitrate, and update the recommendations table
   */
  async generateRecommendations(userId: string): Promise<void> {
    const candidates: RecommendationCandidate[] = [];

    // --- SOURCE 1: REVIEW (Retention-based) ---
    const retentionScores = await prisma.retentionScore.findMany({
      where: { userId },
    });

    for (const r of retentionScores) {
      if (r.retention < 0.70) {
        const urgency = r.retention < 0.40 ? 2.0 * (1.0 - r.retention) : 1.0 - r.retention;
        const impactScore = 3; // high
        const confidence = 0.95;

        candidates.push({
          type: RecommendationType.review,
          title: `Review: ${r.topicId}`,
          description: `Your retention for "${r.topicId}" is currently ${Math.round(r.retention * 100)}%. Take a quick activity to reinforce it.`,
          why: `This is recommended because your retention of "${r.topicId}" dropped below the 70% threshold.`,
          impact: RecommendationImpact.high,
          effortMinutes: 10,
          confidence,
          topicId: r.topicId,
          actionUrl: `/worlds/game`,
          priorityScore: urgency * impactScore * confidence,
        });
      }
    }

    // --- SOURCE 2: LEARN (Roadmap-based) ---
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId },
    });

    if (roadmap && Array.isArray(roadmap.steps)) {
      const steps = roadmap.steps as Array<{ topic_id: string; title: string; status: string }>;
      const nextStep = steps.find((s) => s.status !== 'completed');
      
      if (nextStep) {
        // Double check mastery of next step
        const mastery = await prisma.masteryScore.findFirst({
          where: { userId, topicId: nextStep.topic_id },
        });

        const score = mastery?.score ?? 0;
        if (score < 0.10) {
          const urgency = 1.0;
          const impactScore = 2; // medium
          const confidence = 0.90;

          candidates.push({
            type: RecommendationType.learn,
            title: `Learn: ${nextStep.title}`,
            description: `Unlock your next topic "${nextStep.title}" on your learning path.`,
            why: `This is the next logical step on your roadmap for ${roadmap.goal.toUpperCase()}.`,
            impact: RecommendationImpact.medium,
            effortMinutes: 20,
            confidence,
            topicId: nextStep.topic_id,
            actionUrl: `/worlds`,
            priorityScore: urgency * impactScore * confidence,
          });
        }
      }
    }

    // --- SOURCE 3: PRACTICE (Mastery-based) ---
    const masteryScores = await prisma.masteryScore.findMany({
      where: { userId },
    });

    for (const m of masteryScores) {
      if (m.score >= 0.10 && m.score <= 0.60) {
        const urgency = 1.0 - m.score;
        const impactScore = 2; // medium
        const confidence = 0.85;

        candidates.push({
          type: RecommendationType.practice,
          title: `Practice: ${m.topicId}`,
          description: `Sharpen your skills on "${m.topicId}". Your current mastery is ${Math.round(m.score * 100)}%.`,
          why: `Your mastery is between 10% and 60%, making this topic ideal for practice sessions.`,
          impact: RecommendationImpact.medium,
          effortMinutes: 15,
          confidence,
          topicId: m.topicId,
          actionUrl: `/practice`,
          priorityScore: urgency * impactScore * confidence,
        });
      }
    }

    // --- SOURCE 4: CONSISTENCY (Inactivity-based) ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true },
    });

    if (user && user.lastActiveAt) {
      const hoursSinceActive = (Date.now() - user.lastActiveAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive > 48) {
        const urgency = 2.0;
        const impactScore = 3; // high
        const confidence = 1.0;

        candidates.push({
          type: RecommendationType.consistency,
          title: `Keep Your Momentum Going!`,
          description: `It's been over 48 hours since your last session. Jump back in today to build your streak!`,
          why: `No activity recorded on the platform in the last 48 hours.`,
          impact: RecommendationImpact.high,
          effortMinutes: 5,
          confidence,
          priorityScore: urgency * impactScore * confidence,
        });
      }
    }

    // --- ARBITRATION ---
    // 1. Remove duplicate types for the same topic
    const uniqueCandidates: RecommendationCandidate[] = [];
    const seen = new Set<string>();

    for (const cand of candidates) {
      const key = `${cand.type}:${cand.topicId ?? 'global'}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCandidates.push(cand);
      }
    }

    // 2. Fetch existing recommendations to check cooldowns/snoozes
    const existingRecs = await prisma.recommendation.findMany({
      where: { userId },
    });

    const now = new Date();

    // Filter out candidates on cooldown or snoozed
    const filteredCandidates = uniqueCandidates.filter((cand) => {
      const match = existingRecs.find(
        (er) => er.type === cand.type && er.topicId === cand.topicId
      );

      if (match) {
        // Cooldown check
        if (match.cooldownUntil && match.cooldownUntil > now) return false;
        // Snooze check
        if (match.status === RecommendationStatus.snoozed && match.snoozedUntil && match.snoozedUntil > now) return false;
      }
      return true;
    });

    // 3. Sort by priority score descending
    filteredCandidates.sort((a, b) => b.priorityScore - a.priorityScore);

    // 4. Take top 7 only
    const top7 = filteredCandidates.slice(0, 7);

    // 5. Save to database: clear current active recommendations first
    await prisma.recommendation.deleteMany({
      where: { userId, status: RecommendationStatus.active },
    });

    for (const rec of top7) {
      await prisma.recommendation.create({
        data: {
          userId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          why: rec.why,
          impact: rec.impact,
          effortMinutes: rec.effortMinutes,
          confidence: rec.confidence,
          topicId: rec.topicId,
          actionUrl: rec.actionUrl,
          status: RecommendationStatus.active,
        },
      });
    }

    // 6. Invalidate Redis cache
    await this.redisService.del(`recommendations:${userId}`);
  }

  /**
   * Action: snooze or dismiss a recommendation
   */
  async updateRecommendation(userId: string, id: string, action: 'dismiss' | 'snooze', snoozeDays = 1) {
    const rec = await prisma.recommendation.findFirst({
      where: { id, userId },
    });

    if (!rec) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recommendation not found or unauthorized', details: {} },
      });
    }

    const now = new Date();
    if (action === 'snooze') {
      const snoozedUntil = new Date(now.getTime() + snoozeDays * 24 * 60 * 60 * 1000);
      await prisma.recommendation.update({
        where: { id },
        data: {
          status: RecommendationStatus.snoozed,
          snoozedUntil,
        },
      });
    } else {
      // Dismiss sets status to dismissed and adds a 7-day cooldown
      const cooldownUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await prisma.recommendation.update({
        where: { id },
        data: {
          status: RecommendationStatus.dismissed,
          cooldownUntil,
        },
      });
    }

    // Invalidate Redis cache
    await this.redisService.del(`recommendations:${userId}`);
    return { success: true, message: 'Recommendation updated' };
  }
}
