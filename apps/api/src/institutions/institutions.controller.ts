import { Controller, Get, Post, Body, Req, Param, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { InstitutionsService } from './institutions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { z } from 'zod';
import { ZodValidationPipe } from '../auth/zod.pipe';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const createInstitutionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  domain: z.string().optional(),
});

const createCohortSchema = z.object({
  name: z.string().min(1, 'Cohort name is required'),
});

const enrollStudentsSchema = z.object({
  emails: z.array(z.string().email('Invalid email format')).min(1, 'At least one email is required'),
});

const joinCohortSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
  shareDataConsent: z.boolean(),
});

type CreateInstitutionDto = z.infer<typeof createInstitutionSchema>;
type CreateCohortDto = z.infer<typeof createCohortSchema>;
type EnrollStudentsDto = z.infer<typeof enrollStudentsSchema>;
type JoinCohortDto = z.infer<typeof joinCohortSchema>;

@Controller()
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post('institutions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(createInstitutionSchema))
  async createInstitution(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.createInstitution(dto.name, dto.domain);
  }

  @Post('institutions/:id/cohorts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(createCohortSchema))
  async createCohort(@Param('id') id: string, @Body() dto: CreateCohortDto) {
    return this.institutionsService.createCohort(id, dto.name);
  }

  @Post('cohorts/:cohortId/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(enrollStudentsSchema))
  async enrollStudents(@Param('cohortId') cohortId: string, @Body() dto: EnrollStudentsDto) {
    return this.institutionsService.enrollStudents(cohortId, dto.emails);
  }

  @Get('cohorts/:cohortId/analytics')
  @UseGuards(JwtAuthGuard)
  async getCohortAnalytics(@Param('cohortId') cohortId: string) {
    return this.institutionsService.getCohortAnalytics(cohortId);
  }

  @Post('cohorts/join')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @UsePipes(new ZodValidationPipe(joinCohortSchema))
  async joinCohort(@Req() req: AuthenticatedRequest, @Body() dto: JoinCohortDto) {
    return this.institutionsService.enrollWithInviteCode(req.user.id, dto.inviteCode, dto.shareDataConsent);
  }
}
