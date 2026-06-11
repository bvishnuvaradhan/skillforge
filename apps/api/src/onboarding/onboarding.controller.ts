import { Controller, Post, Body, Req, UseGuards, UsePipes, HttpStatus, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { OnboardingService } from './onboarding.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { setGoalSchema, submitAssessmentSchema, SetGoalDto, SubmitAssessmentDto } from './onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('goal')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(setGoalSchema))
  async setGoal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SetGoalDto,
  ) {
    const result = await this.onboardingService.setGoal(req.user.id, dto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('assessment')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(submitAssessmentSchema))
  async submitAssessment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitAssessmentDto,
  ) {
    const result = await this.onboardingService.submitAssessment(req.user.id, dto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(@Req() req: AuthenticatedRequest) {
    const result = await this.onboardingService.completeOnboarding(req.user.id);
    return {
      success: true,
      data: result,
    };
  }
}
