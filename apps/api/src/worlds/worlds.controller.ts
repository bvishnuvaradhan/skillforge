import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
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

  @Post(':slug/problems/:type/:problemId/complete')
  async completeProblem(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Param('type') type: 'original' | 'external',
    @Param('problemId') problemId: string,
    @Body() body: { code?: string; language?: string },
  ) {
    const data = await this.worldsService.completeProblem(user.id, slug, type, problemId, body ?? {});
    return { success: true, data };
  }

  @Post(':slug/problems/original/:problemId/run')
  async runProblem(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Param('problemId') problemId: string,
    @Body() body: { code?: string; language?: string },
  ) {
    const data = await this.worldsService.runProblemCode(user.id, slug, problemId, body ?? {});
    return { success: true, data };
  }

  @Post(':slug/problems/original/:problemId/save')
  async saveDraft(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Param('problemId') problemId: string,
    @Body() body: { code?: string },
  ) {
    const code = body?.code || '';
    if (Buffer.byteLength(code, 'utf8') > 50 * 1024) {
      throw new BadRequestException({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Solution draft exceeds the 50KB limit.', details: {} },
      });
    }
    const data = await this.worldsService.saveProblemDraft(user.id, slug, problemId, code);
    return { success: true, data };
  }
}
