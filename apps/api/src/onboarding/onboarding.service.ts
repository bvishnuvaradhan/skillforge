import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma, Goal, LearningStyle, LanguageTrack } from '@skillforge/db';
import { SetGoalDto, SubmitAssessmentDto } from './onboarding.dto';
import { ASSESSMENT_QUESTIONS } from '@skillforge/types';

@Injectable()
export class OnboardingService {
  /**
   * Set the user's primary learning goal
   */
  async setGoal(userId: string, dto: SetGoalDto) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        primaryGoal: dto.goal as Goal,
        languageTrack: (dto.language_track || 'JAVASCRIPT') as LanguageTrack,
      },
    });

    return {
      message: 'Goal saved',
    };
  }

  /**
   * Submit diagnostic answers and calculate initial topic mastery scores
   */
  async submitAssessment(userId: string, dto: SubmitAssessmentDto) {
    // 1. Grade the diagnostic questions and map to rich answer format
    const richAnswers = dto.answers.map((ans) => {
      const question = ASSESSMENT_QUESTIONS.find((q) => q.id === ans.question_id);
      const correct = question ? ans.answer === question.correctAnswer : false;
      const topic = question ? question.topic.toLowerCase() : 'unknown';

      return {
        questionId: ans.question_id,
        selectedAnswer: ans.answer,
        correct,
        topic,
      };
    });

    const correctCount = richAnswers.filter((a) => a.correct).length;
    const totalQuestionsCount = ASSESSMENT_QUESTIONS.length;

    // 2. Compute topic scores (ratio of correct answers per topic)
    const topicBreakdown: Record<string, number> = {};
    const topicQuestionCounts: Record<string, { correct: number; total: number }> = {};

    richAnswers.forEach((ans) => {
      let counts = topicQuestionCounts[ans.topic];
      if (!counts) {
        counts = { correct: 0, total: 0 };
        topicQuestionCounts[ans.topic] = counts;
      }
      counts.total += 1;
      if (ans.correct) {
        counts.correct += 1;
      }
    });

    Object.entries(topicQuestionCounts).forEach(([topic, stats]) => {
      topicBreakdown[topic] = stats.correct / stats.total;
    });

    // 3. Persist the attempt in the database
    await prisma.examAttempt.create({
      data: {
        userId,
        examType: 'ONBOARDING_ASSESSMENT',
        answers: richAnswers,
        score: correctCount,
        maxScore: totalQuestionsCount,
        topicScores: topicBreakdown,
      },
    });

    // 4. Persist real mastery scores computed from actual exam attempt data
    for (const [topicId, score] of Object.entries(topicBreakdown)) {
      const existing = await prisma.masteryScore.findFirst({
        where: { userId, topicId },
      });

      if (existing) {
        await prisma.masteryScore.update({
          where: { id: existing.id },
          data: {
            score,
            assessmentScore: score,
            lastActivityAt: new Date(),
          },
        });
      } else {
        await prisma.masteryScore.create({
          data: {
            userId,
            topicId,
            score,
            assessmentScore: score,
            lastActivityAt: new Date(),
          },
        });
      }
    }

    return {
      results: {
        score: correctCount,
        max_score: totalQuestionsCount,
        percentage: totalQuestionsCount > 0 ? correctCount / totalQuestionsCount : 0,
        topic_scores: topicBreakdown,
      },
      message: 'Assessment complete',
    };
  }

  /**
   * Finalize onboarding: generate DltState, generate Roadmap, and set onboardingComplete = true
   */
  async completeOnboarding(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'User not found',
          details: {},
        },
      });
    }

    if (!user.primaryGoal) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Goal must be set before completing onboarding',
          details: {},
        },
      });
    }

    // Set onboarding complete
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });

    // Initialize DltState based on actual diagnostic assessment scores
    const masteryScores = await prisma.masteryScore.findMany({
      where: { userId },
    });
    const computedMastery = masteryScores.length > 0
      ? parseFloat((masteryScores.reduce((sum, s) => sum + s.score, 0) / masteryScores.length).toFixed(3))
      : 0.35;

    const existingDlt = await prisma.dltState.findUnique({
      where: { userId },
    });

    let dltState;
    if (existingDlt) {
      dltState = await prisma.dltState.update({
        where: { userId },
        data: {
          overallMastery: computedMastery,
          overallRetention: 0.75,
          learningStyle: 'game_based' as LearningStyle,
        },
      });
    } else {
      dltState = await prisma.dltState.create({
        data: {
          userId,
          overallMastery: computedMastery,
          overallRetention: 0.75,
          learningStyle: 'game_based' as LearningStyle,
        },
      });
    }

    // Initialize Roadmap steps based on chosen primary goal
    let steps = [];
    if (user.primaryGoal === Goal.dsa) {
      steps = [
        { topic_id: 'arrays', title: 'Array Data Structure', status: 'in_progress', estimated_days: 5, mastery_required: 0.7 },
        { topic_id: 'linked_lists', title: 'Linked Lists', status: 'locked', estimated_days: 5, mastery_required: 0.7 },
        { topic_id: 'stacks_queues', title: 'Stacks & Queues', status: 'locked', estimated_days: 4, mastery_required: 0.7 },
        { topic_id: 'trees', title: 'Binary Trees', status: 'locked', estimated_days: 7, mastery_required: 0.7 },
      ];
    } else if (user.primaryGoal === Goal.competitive) {
      steps = [
        { topic_id: 'basic_math', title: 'Basic Number Theory & GCD', status: 'in_progress', estimated_days: 4, mastery_required: 0.8 },
        { topic_id: 'greedy', title: 'Greedy Algorithms', status: 'locked', estimated_days: 6, mastery_required: 0.8 },
      ];
    } else {
      // placements or interviews
      steps = [
        { topic_id: 'arrays', title: 'Array Basics', status: 'in_progress', estimated_days: 4, mastery_required: 0.7 },
        { topic_id: 'strings', title: 'String Manipulation', status: 'locked', estimated_days: 4, mastery_required: 0.7 },
        { topic_id: 'searching_sorting', title: 'Searching and Sorting', status: 'locked', estimated_days: 5, mastery_required: 0.7 },
        { topic_id: 'dynamic_programming', title: 'Introduction to DP', status: 'locked', estimated_days: 10, mastery_required: 0.6 },
      ];
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { userId },
    });

    let roadmap;
    if (existingRoadmap) {
      roadmap = await prisma.roadmap.update({
        where: { userId },
        data: {
          goal: user.primaryGoal,
          steps,
          currentStepIndex: 0,
        },
      });
    } else {
      roadmap = await prisma.roadmap.create({
        data: {
          userId,
          goal: user.primaryGoal,
          steps,
          currentStepIndex: 0,
        },
      });
    }

    const worldsUnlocked = await this.fastTrackUnlock(userId);

    return {
      dlt: {
        overall_mastery: dltState.overallMastery,
        worlds_unlocked: worldsUnlocked,
      },
      roadmap: {
        steps: roadmap.steps,
      },
    };
  }

  async fastTrackUnlock(userId: string): Promise<string[]> {
    const unlockedWorlds = ['variables-operators'];

    // 1. Check assessment score
    const assessment = await prisma.examAttempt.findFirst({
      where: { userId, examType: 'ONBOARDING_ASSESSMENT' },
      orderBy: { submittedAt: 'desc' },
    });

    const scoreRatio = assessment && assessment.maxScore && assessment.maxScore > 0
      ? (assessment.score ?? 0) / assessment.maxScore
      : 0;

    // 2. Check coding profiles
    const profiles = await prisma.codingProfile.findMany({
      where: { userId },
    });
    const totalSolved = profiles.reduce((sum, p) => sum + p.solvedCount, 0);
    const maxRating = profiles.length > 0 ? Math.max(...profiles.map(p => p.rating ?? 0)) : 0;

    let unlockUpToOrder = 1; // Default variables-kingdom
    if (scoreRatio >= 0.9 || totalSolved >= 180 || maxRating >= 1800) {
      unlockUpToOrder = 4; // Unlock up to array-arena
    } else if (scoreRatio >= 0.75 || totalSolved >= 80 || maxRating >= 1500) {
      unlockUpToOrder = 3; // Unlock up to loop-forest
    }

    // Fetch all worlds up to unlockUpToOrder
    const worldsToUnlock = await prisma.world.findMany({
      where: {
        status: 'published',
        orderIndex: { lte: unlockUpToOrder },
      },
      orderBy: { orderIndex: 'asc' },
    });

    for (const w of worldsToUnlock) {
      if (!unlockedWorlds.includes(w.slug)) {
        unlockedWorlds.push(w.slug);
      }
      
      // Upsert progress entry
      const existing = await prisma.userWorldProgress.findUnique({
        where: { userId_worldId: { userId, worldId: w.id } }
      });

      if (!existing || existing.status === 'locked') {
        await prisma.userWorldProgress.upsert({
          where: { userId_worldId: { userId, worldId: w.id } },
          update: { status: 'unlocked', unlockedAt: new Date() },
          create: { userId, worldId: w.id, status: 'unlocked', unlockedAt: new Date() },
        });
      }
    }

    return unlockedWorlds;
  }
}
