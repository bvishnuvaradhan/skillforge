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
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ResumeService } from './resume.service';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { z } from 'zod';
import { prisma, ResumeTemplate } from '@skillforge/db';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const createResumeSchema = z.object({
  name: z.string().optional(),
  template: z.enum(['ats', 'product', 'fresher', 'experienced']),
});

const updateResumeSchema = z.object({
  name: z.string().optional(),
  template: z.enum(['ats', 'product', 'fresher', 'experienced']).optional(),
  content: z.record(z.string(), z.any()).optional(),
  isPrimary: z.boolean().optional(),
});

const analyzeLinkedinSchema = z.object({
  bioText: z.string(),
});

@Controller()
export class CareerController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * List user resumes
   */
  @Get('resumes')
  @UseGuards(JwtAuthGuard)
  async listResumes(@Req() req: AuthenticatedRequest) {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      include: {
        scores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      success: true,
      data: resumes,
    };
  }

  /**
   * Create a pre-filled resume based on DLT stats
   */
  @Post('resumes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(createResumeSchema))
  async createResume(
    @Req() req: AuthenticatedRequest,
    @Body() body: z.infer<typeof createResumeSchema>,
  ) {
    const result = await this.resumeService.createPrefilledResume(
      req.user.id,
      body.name ?? '',
      body.template as ResumeTemplate,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Edit resume content JSON or details
   */
  @Patch('resumes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(updateResumeSchema))
  async updateResume(
    @Req() req: AuthenticatedRequest,
    @Param('id') resumeId: string,
    @Body() body: z.infer<typeof updateResumeSchema>,
  ) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== req.user.id) {
      throw new BadRequestException('Resume not found or access denied');
    }

    // Handle isPrimary toggling: if true, reset other user resumes primary state
    if (body.isPrimary === true) {
      await prisma.resume.updateMany({
        where: { userId: req.user.id },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        name: body.name,
        template: body.template as ResumeTemplate,
        content: body.content ? (body.content as any) : undefined,
        isPrimary: body.isPrimary,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Score resume across 6 dimensions
   */
  @Post('resumes/:id/score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async scoreResume(
    @Req() req: AuthenticatedRequest,
    @Param('id') resumeId: string,
  ) {
    const scoreRecord = await this.resumeService.scoreResume(req.user.id, resumeId);
    return {
      success: true,
      data: scoreRecord,
    };
  }

  /**
   * Paste and analyze LinkedIn bio
   */
  @Post('career/linkedin/analyze')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(analyzeLinkedinSchema))
  async analyzeLinkedIn(
    @Req() req: AuthenticatedRequest,
    @Body() body: z.infer<typeof analyzeLinkedinSchema>,
  ) {
    const result = await this.resumeService.analyzeLinkedIn(req.user.id, body.bioText);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Retrieve placement readiness company tiers
   */
  @Get('career/readiness')
  @UseGuards(JwtAuthGuard)
  async getCareerReadiness(@Req() req: AuthenticatedRequest) {
    const result = await this.resumeService.getReadiness(req.user.id);
    return {
      success: true,
      data: result,
    };
  }
}
