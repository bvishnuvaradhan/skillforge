import { Controller, Get, Post, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { BossService } from './boss.service';
import { BossSessionService } from './boss.session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('boss')
@UseGuards(JwtAuthGuard)
export class BossController {
  constructor(
    private readonly bossService: BossService,
    private readonly bossSessionService: BossSessionService,
  ) {}

  @Get(':id')
  async getBoss(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bossService.getBoss(user.id, id);
    return { success: true, data };
  }

  // Redis-backed session routes for multi-level boss battles

  @Post(':id/session/start')
  async startSession(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bossSessionService.startSession(user.id, id);
    return { success: true, data };
  }

  @Get(':id/session/status')
  async getSessionStatus(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bossSessionService.getSessionStatus(user.id, id);
    return { success: true, data };
  }

  @Post(':id/session/submit')
  async submitSession(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const data = await this.bossSessionService.submitActiveLevel(user.id, id, body);
    return { success: true, data };
  }

  @Post(':id/session/timeout')
  async handleTimeout(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { partialCode?: string },
  ) {
    const data = await this.bossSessionService.handleTimeout(user.id, id, body.partialCode ?? '');
    return { success: true, data };
  }
}
