import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AiInterviewService } from './ai-interview.service';
import { MentorService } from './mentor.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { z } from 'zod';
import { prisma, InterviewType } from '@skillforge/db';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const startAiInterviewSchema = z.object({
  interviewType: z.enum(['dsa', 'coding', 'system_design', 'behavioral', 'hr']),
  targetCompany: z.string().optional(),
});

const submitAiMessageSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

const bookMentorSchema = z.object({
  mentorId: z.string().uuid(),
  scheduledAt: z.string(),
  interviewType: z.enum(['dsa', 'coding', 'system_design', 'behavioral', 'hr']),
  targetCompany: z.string().optional(),
  bypassPayment: z.boolean().optional(),
});

const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const updateMentorProfileSchema = z.object({
  bio: z.string().optional(),
  headline: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  experienceYears: z.number().int().min(0).optional(),
  sessionPrice: z.number().min(0).optional(),
  sessionDurationMinutes: z.number().int().min(15).optional(),
});

@Controller('interviews')
export class InterviewsController {
  constructor(
    private readonly aiInterviewService: AiInterviewService,
    private readonly mentorService: MentorService,
  ) {}

  /**
   * Start an AI Interview Session
   */
  @Post('ai/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(startAiInterviewSchema))
  async startAiInterview(
    @Req() req: AuthenticatedRequest,
    @Body() body: z.infer<typeof startAiInterviewSchema>,
  ) {
    const result = await this.aiInterviewService.startSession(
      req.user.id,
      body.interviewType as InterviewType,
      body.targetCompany,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Submit Message to AI Interview
   */
  @Post(':sessionId/message')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(submitAiMessageSchema))
  async submitAiMessage(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() body: z.infer<typeof submitAiMessageSchema>,
  ) {
    const result = await this.aiInterviewService.submitMessage(
      req.user.id,
      sessionId,
      body.message,
      body.code,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Complete AI Interview and generate evaluation
   */
  @Post(':sessionId/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async completeAiInterview(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.aiInterviewService.completeSession(req.user.id, sessionId);
    return result;
  }

  /**
   * Get feedback details of completed session
   */
  @Get(':sessionId/feedback')
  @UseGuards(JwtAuthGuard)
  async getFeedback(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || (session.studentId !== req.user.id && session.mentorId !== req.user.id && req.user.role !== 'admin')) {
      throw new BadRequestException('Session not found or access denied');
    }

    const feedback = await prisma.interviewFeedback.findUnique({
      where: { sessionId },
    });

    return {
      success: true,
      data: {
        session,
        feedback,
      },
    };
  }

  /**
   * List interview sessions for student or mentor
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async listSessions(@Req() req: AuthenticatedRequest) {
    const sessions = await prisma.interviewSession.findMany({
      where: req.user.role === 'mentor' ? { mentorId: req.user.id } : { studentId: req.user.id },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: sessions,
    };
  }

  /**
   * List approved mentors in marketplace
   */
  @Get('mentors')
  @UseGuards(JwtAuthGuard)
  async listMentors() {
    const result = await this.mentorService.listMentors();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Request booking / Checkout session
   */
  @Post('bookings/checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(bookMentorSchema))
  async bookMentorSession(
    @Req() req: AuthenticatedRequest,
    @Body() body: z.infer<typeof bookMentorSchema>,
  ) {
    const result = await this.mentorService.bookSession(
      req.user.id,
      body.mentorId,
      new Date(body.scheduledAt),
      body.interviewType as InterviewType,
      body.targetCompany,
      body.bypassPayment ?? false,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Stripe webhook handling
   */
  @Post('bookings/webhook')
  async stripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = (req as any).rawBody || req.body;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test';
    
    const result = await this.mentorService.handleStripeWebhook(
      rawBody,
      signature,
      webhookSecret,
    );
    return result;
  }

  /**
   * Submit Review for Mentor
   */
  @Post(':sessionId/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(submitReviewSchema))
  async submitReview(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() body: z.infer<typeof submitReviewSchema>,
  ) {
    const result = await this.mentorService.submitReview(
      req.user.id,
      sessionId,
      body.rating,
      body.comment,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update Mentor Profile (bio, pricing)
   */
  @Patch('mentor/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor', 'admin')
  @UsePipes(new ZodValidationPipe(updateMentorProfileSchema))
  async updateMentorProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: z.infer<typeof updateMentorProfileSchema>,
  ) {
    const profileData: any = { ...body };
    if (body.sessionPrice) {
      profileData.sessionPrice = body.sessionPrice;
    }
    const result = await this.mentorService.updateProfile(req.user.id, profileData);
    return {
      success: true,
      data: result,
    };
  }
}
