import { Controller, Get, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { mentorChatSchema, MentorChatDto } from './mentor.dto';

@Controller('mentor-ai')
@UseGuards(JwtAuthGuard)
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post('chat')
  @UsePipes(new ZodValidationPipe(mentorChatSchema))
  async chat(@CurrentUser() user: AuthUser, @Body() dto: MentorChatDto) {
    const data = await this.mentorService.sendMessage(user.id, dto.message, dto.session_id);
    return {
      success: true,
      data,
    };
  }

  @Get('usage')
  async getUsage(@CurrentUser() user: AuthUser) {
    const data = await this.mentorService.getUsage(user.id);
    return {
      success: true,
      data,
    };
  }
}
