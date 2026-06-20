import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExamsService } from './exams.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { z } from 'zod';
import { prisma } from '@skillforge/db';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const submitAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
});

const submitRegularExamSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.string(),
  })),
});

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  /**
   * Get exams catalog
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async listExams() {
    const result = await this.examsService.listExams();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Start an exam attempt
   */
  @Post(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async startAttempt(
    @Req() req: AuthenticatedRequest,
    @Param('id') examId: string,
  ) {
    const result = await this.examsService.startAttempt(req.user.id, examId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Submit single answer (for adaptive workflow)
   */
  @Post('attempts/:attemptId/answer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(submitAnswerSchema))
  async submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() body: z.infer<typeof submitAnswerSchema>,
  ) {
    const result = await this.examsService.submitAnswer(
      attemptId,
      body.questionId,
      body.selectedAnswer,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Submit complete regular exam answers
   */
  @Post('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(submitRegularExamSchema))
  async submitRegularExam(
    @Param('attemptId') attemptId: string,
    @Body() body: z.infer<typeof submitRegularExamSchema>,
  ) {
    const result = await this.examsService.submitRegularExam(attemptId, body.answers);
    return result;
  }

  /**
   * Get user's completed exam history / scores
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getExamHistory(@Req() req: AuthenticatedRequest) {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: req.user.id },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      success: true,
      data: attempts,
    };
  }
}
