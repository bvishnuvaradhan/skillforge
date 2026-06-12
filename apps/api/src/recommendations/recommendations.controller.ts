import { Controller, Get, Patch, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { updateRecommendationSchema, UpdateRecommendationDto } from './recommendations.dto';
import { Recommendation } from '@prisma/client';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(@CurrentUser() user: AuthUser) {
    const data = await this.recommendationsService.getRecommendations(user.id);
    return {
      success: true,
      data: {
        recommendations: data.map((r: Recommendation) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          why: r.why,
          impact: r.impact,
          effort_minutes: r.effortMinutes,
          confidence: r.confidence,
          topic_id: r.topicId,
          action_url: r.actionUrl,
        })),
      },
    };
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateRecommendationSchema))
  async updateRecommendation(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationDto,
  ) {
    const data = await this.recommendationsService.updateRecommendation(
      user.id,
      id,
      dto.action,
      dto.snooze_days,
    );
    return {
      success: true,
      data,
    };
  }
}
