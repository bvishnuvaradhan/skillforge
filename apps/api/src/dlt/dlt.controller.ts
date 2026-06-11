import { Controller, Get, UseGuards } from '@nestjs/common';
import { DltService } from './dlt.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class DltController {
  constructor(private readonly dltService: DltService) {}

  @Get('dlt/me')
  async getMyDlt(@CurrentUser() user: AuthUser) {
    const data = await this.dltService.getMyDlt(user.id);
    return { success: true, data };
  }

  @Get(['mastery', 'dlt/mastery'])
  async getMastery(@CurrentUser() user: AuthUser) {
    const data = await this.dltService.getMasteryScores(user.id);
    return { success: true, data };
  }
}
