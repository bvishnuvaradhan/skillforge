import { Controller, Get, Post, Body, Req, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { z } from 'zod';
import { ZodValidationPipe } from '../auth/zod.pipe';
import { ReportTargetType } from '@skillforge/db';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name cannot exceed 50 characters'),
});

const joinTeamSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

const createReportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetId: z.string().uuid('Target ID must be a valid UUID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000, 'Reason is too long'),
});

type CreateTeamDto = z.infer<typeof createTeamSchema>;
type JoinTeamDto = z.infer<typeof joinTeamSchema>;
type CreateReportDto = z.infer<typeof createReportSchema>;

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('teams')
  @UseGuards(RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(createTeamSchema))
  async createTeam(@Req() req: AuthenticatedRequest, @Body() dto: CreateTeamDto) {
    return this.communityService.createTeam(req.user.id, dto.name);
  }

  @Post('teams/join')
  @UseGuards(RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(joinTeamSchema))
  async joinTeam(@Req() req: AuthenticatedRequest, @Body() dto: JoinTeamDto) {
    return this.communityService.joinTeam(req.user.id, dto.inviteCode);
  }

  @Get('teams/me')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getMyTeam(@Req() req: AuthenticatedRequest) {
    return this.communityService.getTeamDashboard(req.user.id);
  }

  @Get('leaderboards')
  async getLeaderboards(@Req() req: AuthenticatedRequest) {
    return this.communityService.getLeaderboards(req.user.id);
  }

  @Post('reports')
  @UsePipes(new ZodValidationPipe(createReportSchema))
  async createReport(@Req() req: AuthenticatedRequest, @Body() dto: CreateReportDto) {
    return this.communityService.createReport(req.user.id, dto.targetType, dto.targetId, dto.reason);
  }
}
