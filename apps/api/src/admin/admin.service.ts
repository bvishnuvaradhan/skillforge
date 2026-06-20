import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, ReportTargetType } from '@skillforge/db';
import { RedisService } from '../auth/redis.service';

@Injectable()
export class AdminService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Suspend user and revoke active sessions
   */
  async suspendUser(adminId: string, userId: string, ipAddress: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'suspended') {
      throw new BadRequestException('User is already suspended');
    }

    // 1. Update status to suspended
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'suspended' },
    });

    // 2. Revoke active refresh tokens in database
    await prisma.session.deleteMany({
      where: { userId },
    });

    // 3. Add userId to Redis blacklist for access token lifetime (15 minutes = 900s)
    await this.redisService.set(`blacklist:user:${userId}`, '1', 900);

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_SUSPEND',
        details: { suspendedUserId: userId },
        ipAddress,
      },
    });

    return { success: true, message: 'User suspended and sessions revoked successfully' };
  }

  /**
   * Fetch platform metrics and dashboard stats
   */
  async getDashboardStats() {
    const [userCount, mentorCount, activeSessions, pendingReports, resumesCount, examsCount] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'suspended' } } }),
      prisma.mentorProfile.count({ where: { verificationStatus: 'approved' } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.resume.count(),
      prisma.examAttempt.count(),
    ]);

    return {
      success: true,
      stats: {
        users: userCount,
        mentors: mentorCount,
        activeSessions,
        pendingReports,
        resumes: resumesCount,
        exams: examsCount,
      },
    };
  }

  /**
   * Fetch reports queue
   */
  async getReports() {
    const list = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: list };
  }

  /**
   * Resolve a report and verify target existence
   */
  async resolveReport(adminId: string, reportId: string, actionTaken: string, ipAddress: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'pending') {
      throw new BadRequestException('Report is already resolved or marked invalid');
    }

    // Target existence validation
    let targetExists = false;

    try {
      if (report.targetType === ReportTargetType.USER) {
        const entity = await prisma.user.findUnique({ where: { id: report.targetId } });
        if (entity) targetExists = true;
      } else if (report.targetType === ReportTargetType.MENTOR_PROFILE) {
        const entity = await prisma.mentorProfile.findUnique({ where: { id: report.targetId } });
        if (entity) targetExists = true;
      } else if (report.targetType === ReportTargetType.INTERVIEW_SESSION) {
        const entity = await prisma.interviewSession.findUnique({ where: { id: report.targetId } });
        if (entity) targetExists = true;
      } else if (report.targetType === ReportTargetType.COMMENT) {
        // Comments do not exist in current schema, we can mock validation or treat as invalid
        targetExists = false;
      }
    } catch {
      targetExists = false;
    }

    if (!targetExists) {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'invalid_target', actionTaken: 'Target entity does not exist' },
      });

      throw new BadRequestException({
        success: false,
        error: {
          code: 'INVALID_TARGET',
          message: 'Report target entity does not exist or has been deleted',
          details: {},
        },
      });
    }

    // Resolve report
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'resolved',
        actionTaken,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REPORT_RESOLVE',
        details: { reportId, actionTaken },
        ipAddress,
      },
    });

    return { success: true, data: updatedReport };
  }

  /**
   * Create or update a feature flag
   */
  async setFeatureFlag(adminId: string, key: string, isEnabled: boolean, description?: string, ipAddress?: string) {
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: { isEnabled, description },
      create: { key, isEnabled, description },
    });

    // Cache in Redis for quick O(1) checks in endpoints
    await this.redisService.set(`feature_flag:${key}`, isEnabled ? 'true' : 'false', 86400 * 30); // 30 days cache

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'FEATURE_FLAG_SET',
        details: { key, isEnabled },
        ipAddress,
      },
    });

    return { success: true, data: flag };
  }

  /**
   * Helper to check feature flag status
   */
  async isFeatureEnabled(key: string): Promise<boolean> {
    const cached = await this.redisService.get(`feature_flag:${key}`);
    if (cached !== null) {
      return cached === 'true';
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    const isEnabled = flag?.isEnabled ?? false;
    await this.redisService.set(`feature_flag:${key}`, isEnabled ? 'true' : 'false', 86400 * 30);
    return isEnabled;
  }
}
