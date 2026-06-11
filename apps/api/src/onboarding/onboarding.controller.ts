import { Controller, Post, Body, Req, Res, UseGuards, UsePipes, HttpStatus, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { OnboardingService } from './onboarding.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { setGoalSchema, submitAssessmentSchema, SetGoalDto, SubmitAssessmentDto } from './onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthService } from '../auth/auth.service';
import { prisma } from '@skillforge/db';

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
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly authService: AuthService,
  ) {}

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
  async completeOnboarding(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.onboardingService.completeOnboarding(req.user.id);
    
    // Fetch updated user to get onboardingComplete = true status
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user) {
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Re-issue JWT tokens with the updated onboardingComplete payload
      const tokens = await this.authService.generateTokensForUser(user, ip, userAgent);
      this.authService.setAuthCookies(res, tokens);
    }

    return {
      success: true,
      data: result,
    };
  }
}
