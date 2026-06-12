import { Controller, Get, UseGuards } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('memory')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get('lab')
  async getMemoryLab(@CurrentUser() user: AuthUser) {
    const data = await this.memoryService.getMemoryLabData(user.id);
    return {
      success: true,
      data: {
        memory_health_score: Math.round(data.overall_health * 100),
        risk_areas: data.risk_areas.map((ra) => ({
          topic_id: ra.topicId,
          retention: Math.round(ra.retention * 100) / 100,
          days_until_critical: Math.max(
            0,
            Math.round(
              (ra.nextReviewAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          ),
          risk_level: ra.riskLevel,
        })),
        retention_scores: data.retention_scores,
        calendar_items: data.calendar_items,
        review_suggestions: data.risk_areas.map((ra) => ({
          topic_id: ra.topicId,
          title: `Review ${ra.topicId}`,
          action_url: `/worlds/game`,
        })),
      },
    };
  }
}
