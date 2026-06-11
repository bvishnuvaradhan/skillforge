import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { WorldsService } from './worlds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('worlds')
@UseGuards(JwtAuthGuard)
export class WorldsController {
  constructor(private readonly worldsService: WorldsService) {}

  @Get()
  async getWorlds(@CurrentUser() user: AuthUser) {
    const data = await this.worldsService.getWorlds(user.id);
    return { success: true, data };
  }

  @Get(':slug')
  async getWorld(@CurrentUser() user: AuthUser, @Param('slug') slug: string) {
    const data = await this.worldsService.getWorldBySlug(user.id, slug);
    return { success: true, data };
  }

  @Get(':slug/lessons/:lessonId')
  async getLesson(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Param('lessonId') lessonId: string,
  ) {
    const data = await this.worldsService.getLesson(user.id, slug, lessonId);
    return { success: true, data };
  }

  @Post(':slug/lessons/:lessonId/complete')
  async completeLesson(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Param('lessonId') lessonId: string,
  ) {
    const data = await this.worldsService.completeLesson(user.id, slug, lessonId);
    return { success: true, data };
  }
}
