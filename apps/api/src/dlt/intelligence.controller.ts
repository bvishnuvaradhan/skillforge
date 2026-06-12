import { Controller, Get, Param, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { prisma } from '@skillforge/db';
import { ConsistencyPattern, ExplorationBehavior, ForecastType } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  private readonly logger = new Logger(IntelligenceController.name);

  @Get('skill-dna')
  async getSkillDna(@CurrentUser() currentUser: AuthUser) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, createdAt: true, streakCount: true },
    });

    if (!user) {
      throw new HttpException({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found', details: {} } }, HttpStatus.UNAUTHORIZED);
    }

    // Calculate days since registration
    const diffMs = Date.now() - user.createdAt.getTime();
    const daysRegistered = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    // Gate Skill DNA on minimum 7 days of platform activity
    if (daysRegistered < 7) {
      return {
        success: true,
        data: {
          status: 'insufficient_data',
          available_in_days: 7 - daysRegistered,
        },
      };
    }

    // Compute Skill DNA
    const dltState = await prisma.dltState.findUnique({ where: { userId: user.id } });
    const masteryScores = await prisma.masteryScore.findMany({ where: { userId: user.id } });

    const learningStyle = dltState?.learningStyle ?? 'game_based';

    let consistencyPattern: ConsistencyPattern = ConsistencyPattern.irregular;
    if (user.streakCount > 5) {
      consistencyPattern = ConsistencyPattern.daily;
    } else if (user.streakCount >= 2) {
      consistencyPattern = ConsistencyPattern.bursty;
    }

    // Simple heuristic for exploration behavior
    const explorationBehavior = ExplorationBehavior.balanced;

    const strengths = masteryScores.filter((m) => m.score >= 0.80).map((m) => m.topicId);
    const weaknesses = masteryScores.filter((m) => m.score < 0.60).map((m) => m.topicId);
    const growthOpportunities = masteryScores
      .filter((m) => m.score >= 0.60 && m.score < 0.80)
      .map((m) => m.topicId);

    // Save DNA to DB
    const dna = await prisma.skillDna.upsert({
      where: { userId: user.id },
      update: {
        learningStyle,
        consistencyPattern,
        explorationBehavior,
        strengths,
        weaknesses,
        growthOpportunities,
        computedAt: new Date(),
      },
      create: {
        userId: user.id,
        learningStyle,
        consistencyPattern,
        explorationBehavior,
        strengths,
        weaknesses,
        growthOpportunities,
      },
    });

    return {
      success: true,
      data: {
        status: 'computed',
        dna: {
          learning_style: dna.learningStyle,
          consistency_pattern: dna.consistencyPattern,
          exploration_behavior: dna.explorationBehavior,
          strengths: dna.strengths,
          weaknesses: dna.weaknesses,
          growth_opportunities: dna.growthOpportunities,
          computed_at: dna.computedAt,
        },
      },
    };
  }

  @Get('forecasts')
  async getForecasts(@CurrentUser() currentUser: AuthUser) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { plan: true },
    });

    if (!user || user.plan !== 'premium') {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'PAYMENT_REQUIRED',
            message: 'Forecasting is a premium-only feature.',
            details: {},
          },
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Premium user: generate mock/calculated forecasts based on their masteries
    const masteries = await prisma.masteryScore.findMany({ where: { userId: currentUser.id } });
    const retentions = await prisma.retentionScore.findMany({ where: { userId: currentUser.id } });

    const forecasts = [];
    const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    for (const m of masteries) {
      forecasts.push({
        type: ForecastType.topic_readiness,
        topic_id: m.topicId,
        predicted_value: Math.round(Math.min(1.0, m.score + 0.15) * 100) / 100,
        predicted_at_date: sevenDaysOut,
        confidence: 0.85,
      });
    }

    for (const r of retentions) {
      if (r.retention > 0.70) {
        forecasts.push({
          type: ForecastType.retention_risk,
          topic_id: r.topicId,
          predicted_value: Math.round(Math.max(0.0, r.retention - 0.25) * 100) / 100,
          predicted_at_date: threeDaysOut,
          confidence: 0.90,
        });
      }
    }

    // Default general forecast if no topic data exists yet
    if (forecasts.length === 0) {
      forecasts.push({
        type: ForecastType.placement,
        topic_id: 'general',
        predicted_value: 0.65,
        predicted_at_date: sevenDaysOut,
        confidence: 0.75,
      });
    }

    return {
      success: true,
      data: {
        forecasts,
      },
    };
  }

  @Get('explain/:type/:id')
  async getExplain(
    @CurrentUser() currentUser: AuthUser,
    @Param('type') type: string,
    @Param('id') id: string,
    @Query('more') more?: string,
  ) {
    if (!['recommendation', 'mastery', 'retention'].includes(type)) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid type parameter. Must be recommendation, mastery, or retention.',
            details: {},
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { plan: true },
    });

    const isPremium = user?.plan === 'premium';
    const isMoreRequest = more === 'true';

    let title = 'AI Decision Explanation';
    let body = '';
    const evidence: string[] = [];

    if (type === 'recommendation') {
      const rec = await prisma.recommendation.findFirst({
        where: { id, userId: currentUser.id },
      });

      if (!rec) {
        throw new HttpException(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Recommendation not found', details: {} },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      title = `Why this recommendation?`;
      body = rec.why; // Pre-populated rule-based plain English explanation
      evidence.push(`Recommendation Type: ${rec.type}`);
      evidence.push(`AI Confidence Score: ${Math.round(rec.confidence * 100)}%`);
      evidence.push(`Estimated Effort: ${rec.effortMinutes} minutes`);

      // If premium user clicks "Tell me more", call LLM
      if (isMoreRequest && isPremium) {
        const prompt = `Explain in detail why this recommendation of type "${rec.type}" with title "${rec.title}" is generated for the student.
The rule-based reason is: "${rec.why}". Describe the importance of this topic and how mastering it will help their overall coding growth.`;
        
        const llmResponse = await this.callLLM(prompt);
        if (llmResponse) {
          body = llmResponse;
        }
      } else if (isMoreRequest && !isPremium) {
        evidence.push('💡 Upgrade to Premium for deeper AI explainability reports!');
      }
    } else {
      // Mastery or retention explanations
      title = `Why this ${type} status?`;
      body = `Your ${type} level for topic "${id}" is calculated from recent coding attempts and review frequency.`;
      evidence.push(`Topic: ${id}`);

      if (isMoreRequest && isPremium) {
        const prompt = `Explain in detail why the student has a particular ${type} level for the topic "${id}". Provide constructive learning tips.`;
        const llmResponse = await this.callLLM(prompt);
        if (llmResponse) {
          body = llmResponse;
        }
      }
    }

    return {
      success: true,
      data: {
        explanation: {
          title,
          body,
          evidence,
        },
      },
    };
  }

  /**
   * Helper to make LLM calls for premium explainability upgrade
   */
  private async callLLM(prompt: string): Promise<string | null> {
    const isTest = process.env.NODE_ENV === 'test';
    if (isTest || (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)) {
      return '[Premium AI Deep Explanation]: Mastering this concept is critical for data structures. Reviews help rebuild memory stability in the call stack.';
    }

    try {
      const model = process.env.PREMIUM_TIER_MODEL ?? 'gpt-4o';
      if (model.startsWith('claude-')) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey ?? '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          return data.content?.[0]?.text ?? null;
        }
      } else {
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey ?? ''}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          return data.choices?.[0]?.message?.content ?? null;
        }
      }
    } catch (error) {
      this.logger.error('Error in premium explainability LLM call:', error);
    }
    return null;
  }
}
