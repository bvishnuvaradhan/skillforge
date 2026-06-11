import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { BossService } from './boss.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

interface SubmitBossDto {
  answers: Array<{ question_id: string; answer: string }>;
  time_seconds: number;
}

@Controller('boss')
@UseGuards(JwtAuthGuard)
export class BossController {
  constructor(private readonly bossService: BossService) {}

  @Get(':id')
  async getBoss(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.bossService.getBoss(user.id, id);
    return { success: true, data };
  }

  @Post(':id/submit')
  async submitBoss(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitBossDto,
  ) {
    const data = await this.bossService.submitBoss(user.id, id, dto.answers ?? [], dto.time_seconds ?? 0);
    return { success: true, data };
  }
}
