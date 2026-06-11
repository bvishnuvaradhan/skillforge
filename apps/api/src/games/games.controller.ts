import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(':id')
  async getGame(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.gamesService.getGame(user.id, id);
    return { success: true, data };
  }

  @Post(':id/submit')
  async submitGame(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() submission: Record<string, unknown>,
  ) {
    const data = await this.gamesService.submitGame(user.id, id, submission);
    return { success: true, data };
  }
}
