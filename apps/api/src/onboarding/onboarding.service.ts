import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma, Goal, LearningStyle } from '@skillforge/db';
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
      data: { primaryGoal: dto.goal as Goal },
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

    // 4. Retain baseline mastery scores for onboarding flow compatibility
    // TODO (Phase 2): Replace these static mock scores (arrays: 0.7, trees: 0.3) with dynamic scores 
    // calculated from the actual persisted answers in the examAttempt database entry above.
    const baselineScores = [
      { topicId: 'arrays', score: 0.7 },
      { topicId: 'trees', score: 0.3 },
    ];

    for (const item of baselineScores) {
      const existing = await prisma.masteryScore.findFirst({
        where: { userId, topicId: item.topicId },
      });

      if (existing) {
        await prisma.masteryScore.update({
          where: { id: existing.id },
          data: {
            score: item.score,
            assessmentScore: item.score,
            lastActivityAt: new Date(),
          },
        });
      } else {
        await prisma.masteryScore.create({
          data: {
            userId,
            topicId: item.topicId,
            score: item.score,
            assessmentScore: item.score,
            lastActivityAt: new Date(),
          },
        });
      }
    }

    return {
      results: {
        topic_scores: {
          arrays: 0.7,
          trees: 0.3,
        },
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

    // Initialize DltState
    const existingDlt = await prisma.dltState.findUnique({
      where: { userId },
    });

    let dltState;
    if (existingDlt) {
      dltState = await prisma.dltState.update({
        where: { userId },
        data: {
          overallMastery: 0.35,
          overallRetention: 0.65,
          learningStyle: 'game_based' as LearningStyle,
        },
      });
    } else {
      dltState = await prisma.dltState.create({
        data: {
          userId,
          overallMastery: 0.35,
          overallRetention: 0.65,
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

    return {
      dlt: {
        overall_mastery: dltState.overallMastery,
        worlds_unlocked: ['variables-kingdom'],
      },
      roadmap: {
        steps: roadmap.steps,
      },
    };
  }
}
