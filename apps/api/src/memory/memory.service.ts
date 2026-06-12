import { Injectable } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class MemoryService {

  // Weights used for mastery score updates (matching WEIGHTS in dlt-worker.service.ts)
  private readonly weights = {
    game: 0.35,
    assessment: 0.15,
    coding: 0.15,
    interview: 0.15,
    retention: 0.20,
  };

  /**
   * Calculates retention R = e^(-t / S)
   * @param stability Stability S in days
   * @param lastReviewedAt Last review date
   * @param now Current date (default to now)
   */
  calculateRetention(stability: number, lastReviewedAt: Date, now: Date = new Date()): number {
    const diffMs = now.getTime() - lastReviewedAt.getTime();
    const diffDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
    const S = stability || 1.0;
    return Math.exp(-diffDays / S);
  }

  /**
   * Determine risk level based on retention score
   */
  getRiskLevel(retention: number): RiskLevel {
    if (retention < 0.40) return RiskLevel.critical;
    if (retention < 0.70) return RiskLevel.high;
    if (retention < 0.80) return RiskLevel.medium;
    return RiskLevel.low;
  }

  /**
   * Retrieves overall Memory Lab dashboard data
   */
  async getMemoryLabData(userId: string) {
    // 1. Recalculate and update decayed scores to ensure up-to-date values
    await this.decayUserRetention(userId);

    // 2. Fetch all retention scores
    const retentionScores = await prisma.retentionScore.findMany({
      where: { userId },
      orderBy: { nextReviewAt: 'asc' },
    });

    // 3. Overall health score (average retention of all tracked topics)
    const overallHealth =
      retentionScores.length > 0
        ? retentionScores.reduce((sum, s) => sum + s.retention, 0) / retentionScores.length
        : 1.0;

    // 4. Identify risk areas (retention < 0.70)
    const riskAreas = retentionScores
      .filter((s) => s.retention < 0.70)
      .map((s) => ({
        topicId: s.topicId,
        retention: s.retention,
        riskLevel: s.riskLevel,
        nextReviewAt: s.nextReviewAt,
      }));

    // 5. Reinforcement calendar items (upcoming reviews scheduled in the next 14 days)
    const calendarItems = retentionScores.map((s) => ({
      topicId: s.topicId,
      scheduledAt: s.nextReviewAt,
      retention: s.retention,
      riskLevel: s.riskLevel,
    }));

    return {
      overall_health: overallHealth,
      retention_scores: retentionScores.map((s) => ({
        topic_id: s.topicId,
        retention: s.retention,
        stability: s.stability,
        last_reviewed_at: s.lastReviewedAt,
        next_review_at: s.nextReviewAt,
        risk_level: s.riskLevel,
      })),
      risk_areas: riskAreas,
      calendar_items: calendarItems,
    };
  }

  /**
   * Recalculates and updates the retention for all tracked topics of a specific user
   */
  async decayUserRetention(userId: string): Promise<void> {
    const scores = await prisma.retentionScore.findMany({
      where: { userId },
    });

    const now = new Date();
    let totalRetention = 0;

    for (const score of scores) {
      const R = this.calculateRetention(score.stability, score.lastReviewedAt, now);
      const risk = this.getRiskLevel(R);
      totalRetention += R;

      // Update retention score record
      await prisma.retentionScore.update({
        where: { id: score.id },
        data: {
          retention: R,
          riskLevel: risk,
        },
      });

      // Update matching MasteryScore record
      const mastery = await prisma.masteryScore.findFirst({
        where: { userId, topicId: score.topicId },
      });

      if (mastery) {
        const newScore = Math.min(
          1.0,
          this.weights.game * mastery.gameScore +
            this.weights.assessment * mastery.assessmentScore +
            this.weights.coding * mastery.codingScore +
            this.weights.interview * mastery.interviewScore +
            this.weights.retention * R,
        );

        await prisma.masteryScore.update({
          where: { id: mastery.id },
          data: {
            retentionScore: R,
            score: newScore,
          },
        });
      }

      // Check critical/review alert notifications
      if (R < 0.40) {
        // Critical trigger - create notification of type 'memory' if not already created in last 24h
        await this.triggerAlertNotification(userId, score.topicId, 'critical', R);
      } else if (R < 0.70) {
        // Review trigger - create notification of type 'memory'
        await this.triggerAlertNotification(userId, score.topicId, 'review', R);
      }
    }

    // Update DLT State
    if (scores.length > 0) {
      const avgRetention = totalRetention / scores.length;
      
      const allMasteries = await prisma.masteryScore.findMany({ where: { userId } });
      const avgMastery = allMasteries.length > 0
        ? allMasteries.reduce((sum, m) => sum + m.score, 0) / allMasteries.length
        : 0;

      await prisma.dltState.upsert({
        where: { userId },
        update: {
          overallRetention: avgRetention,
          overallMastery: avgMastery,
          lastComputedAt: now,
        },
        create: {
          userId,
          overallRetention: avgRetention,
          overallMastery: avgMastery,
        },
      });
    }
  }

  /**
   * Helper to trigger a memory notification / alert
   */
  private async triggerAlertNotification(
    userId: string,
    topicId: string,
    triggerType: 'critical' | 'review',
    retention: number,
  ): Promise<void> {
    const title = triggerType === 'critical'
      ? `🚨 CRITICAL: Memory retention critical for ${topicId}`
      : `⚠️ Memory Review needed for ${topicId}`;

    const body = triggerType === 'critical'
      ? `Your memory retention for "${topicId}" has dropped to ${Math.round(retention * 100)}%. Please review it immediately to stop memory decay.`
      : `Your memory retention for "${topicId}" is currently ${Math.round(retention * 100)}%. We recommend a quick review activity.`;

    const actionUrl = `/worlds/game`; // Generic redirect link or specific world/lesson

    // Throttle notifications: don't create duplicate unread notifications for the same topic
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'memory',
        title,
        isRead: false,
      },
    });

    if (!existingNotification) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'memory',
          title,
          body,
          actionUrl,
        },
      });
    }
  }

  /**
   * Record a successful review of a topic, resetting the decay curve
   */
  async recordReview(userId: string, topicId: string): Promise<void> {
    const now = new Date();
    const existing = await prisma.retentionScore.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });

    if (existing) {
      const nextStability = Math.min(existing.stability * 2.0, 365.0);
      const nextReviewAt = new Date(now.getTime() + nextStability * 24 * 60 * 60 * 1000);

      await prisma.retentionScore.update({
        where: { id: existing.id },
        data: {
          retention: 1.0,
          stability: nextStability,
          lastReviewedAt: now,
          nextReviewAt,
          reviewCount: existing.reviewCount + 1,
          riskLevel: RiskLevel.low,
        },
      });
    } else {
      const nextReviewAt = new Date(now.getTime() + 1.0 * 24 * 60 * 60 * 1000); // 1 day out
      await prisma.retentionScore.create({
        data: {
          userId,
          topicId,
          retention: 1.0,
          stability: 1.0,
          lastReviewedAt: now,
          nextReviewAt,
          reviewCount: 1,
          riskLevel: RiskLevel.low,
        },
      });
    }

    // Sync with mastery score and DLT state
    await this.syncTopicRetentionToMastery(userId, topicId, 1.0);
  }

  /**
   * Syncs the fresh retention score (1.0) back to the MasteryScore table
   */
  private async syncTopicRetentionToMastery(
    userId: string,
    topicId: string,
    retention: number,
  ): Promise<void> {
    const mastery = await prisma.masteryScore.findFirst({
      where: { userId, topicId },
    });

    if (mastery) {
      const newScore = Math.min(
        1.0,
        this.weights.game * mastery.gameScore +
          this.weights.assessment * mastery.assessmentScore +
          this.weights.coding * mastery.codingScore +
          this.weights.interview * mastery.interviewScore +
          this.weights.retention * retention,
      );

      await prisma.masteryScore.update({
        where: { id: mastery.id },
        data: {
          retentionScore: retention,
          score: newScore,
        },
      });
    } else {
      const newScore = this.weights.retention * retention;
      await prisma.masteryScore.create({
        data: {
          userId,
          topicId,
          retentionScore: retention,
          score: newScore,
        },
      });
    }

    // Recompute DLT averages
    const allRetentionScores = await prisma.retentionScore.findMany({ where: { userId } });
    const avgRetention = allRetentionScores.length > 0 ? allRetentionScores.reduce((sum, s) => sum + s.retention, 0) / allRetentionScores.length : 1.0;

    const allMasteries = await prisma.masteryScore.findMany({ where: { userId } });
    const avgMastery = allMasteries.length > 0 ? allMasteries.reduce((sum, m) => sum + m.score, 0) / allMasteries.length : 0.0;

    await prisma.dltState.upsert({
      where: { userId },
      update: {
        overallRetention: avgRetention,
        overallMastery: avgMastery,
      },
      create: {
        userId,
        overallRetention: avgRetention,
        overallMastery: avgMastery,
      },
    });
  }
}
