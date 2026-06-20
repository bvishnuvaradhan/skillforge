import { Controller, Get, Post, Body, Req, Param, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
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

const resolveReportSchema = z.object({
  actionTaken: z.string().min(1, 'actionTaken is required'),
});

const featureFlagSchema = z.object({
  key: z.string().min(1, 'key is required'),
  isEnabled: z.boolean(),
  description: z.string().optional(),
});

type ResolveReportDto = z.infer<typeof resolveReportSchema>;
type FeatureFlagDto = z.infer<typeof featureFlagSchema>;

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('users/:userId/suspend')
  async suspendUser(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    return this.adminService.suspendUser(req.user.id, userId, ipAddress);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Post('reports/:reportId/resolve')
  @UsePipes(new ZodValidationPipe(resolveReportSchema))
  async resolveReport(
    @Req() req: AuthenticatedRequest,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    return this.adminService.resolveReport(req.user.id, reportId, dto.actionTaken, ipAddress);
  }

  @Post('feature-flags')
  @UsePipes(new ZodValidationPipe(featureFlagSchema))
  async setFeatureFlag(
    @Req() req: AuthenticatedRequest,
    @Body() dto: FeatureFlagDto,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    return this.adminService.setFeatureFlag(req.user.id, dto.key, dto.isEnabled, dto.description, ipAddress);
  }
}
