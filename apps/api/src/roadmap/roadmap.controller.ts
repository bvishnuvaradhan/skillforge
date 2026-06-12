import { Controller, Get, Patch, Body, UseGuards, UsePipes } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { updateGoalSchema, UpdateGoalDto } from './roadmap.dto';

@Controller('roadmap')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  async getRoadmap(@CurrentUser() user: AuthUser) {
    const data = await this.roadmapService.getRoadmap(user.id);
    return {
      success: true,
      data,
    };
  }

  @Patch('goal')
  @UsePipes(new ZodValidationPipe(updateGoalSchema))
  async updateGoal(@CurrentUser() user: AuthUser, @Body() dto: UpdateGoalDto) {
    const data = await this.roadmapService.updateGoal(user.id, dto.goal);
    return {
      success: true,
      data,
    };
  }
}
