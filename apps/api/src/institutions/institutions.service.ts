import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { EmailService } from '../common/email.service';
import crypto from 'crypto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Create a new institution
   */
  async createInstitution(name: string, domain?: string) {
    const inst = await prisma.institution.create({
      data: { name, domain },
    });
    return { success: true, data: inst };
  }

  /**
   * Create a new student cohort in an institution
   */
  async createCohort(institutionId: string, name: string) {
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!inst) {
      throw new NotFoundException('Institution not found');
    }

    const inviteCode = `cohort-${crypto.randomBytes(4).toString('hex')}`;
    const cohort = await prisma.cohort.create({
      data: {
        institutionId,
        name,
        inviteCode,
      },
    });

    return { success: true, data: cohort };
  }

  /**
   * Bulk enroll students into a cohort
   */
  async enrollStudents(cohortId: string, emails: string[]) {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { institution: true },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    const results = [];

    for (const email of emails) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) continue;

      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      let isNewUser = false;

      // 1. If user does not exist, provision an invited/shell account
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0] || 'Invited Student',
            role: 'student',
            status: 'invited', // mark as invited/shell
          },
        });
        isNewUser = true;

        // Dispatch invitation email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?email=${encodeURIComponent(normalizedEmail)}`;
        await this.emailService.sendInviteEmail(normalizedEmail, inviteLink, cohort.name);
      }

      // 2. Add to CohortMember if not already present
      const existingMember = await prisma.cohortMember.findUnique({
        where: {
          cohortId_userId: {
            cohortId,
            userId: user.id,
          },
        },
      });

      if (!existingMember) {
        await prisma.cohortMember.create({
          data: {
            cohortId,
            userId: user.id,
            role: 'student',
            shareDataConsent: false, // Default is no consent
          },
        });
      }

      results.push({
        email: normalizedEmail,
        userId: user.id,
        status: isNewUser ? 'invited' : 'enrolled',
      });
    }

    return { success: true, enrolled: results };
  }

  /**
   * Fetch cohort analytics and cohort member details
   */
  async getCohortAnalytics(cohortId: string) {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    // Fetch cohort members with DLT state (excluding suspended users)
    const members = await prisma.cohortMember.findMany({
      where: {
        cohortId,
        user: {
          status: { not: 'suspended' },
        },
      },
      include: {
        user: {
          include: {
            dltState: true,
          },
        },
      },
    });

    const count = members.length;

    // 1. Calculate aggregated, anonymized cohort-wide statistics
    let sumMastery = 0;
    let sumRetention = 0;
    let sumReadiness = 0;
    let sumStreak = 0;
    let sumLevel = 0;

    for (const m of members) {
      const dlt = m.user.dltState;
      sumMastery += dlt?.overallMastery || 0;
      sumRetention += dlt?.overallRetention || 0;
      sumReadiness += dlt?.placementReadiness || 0;
      sumStreak += m.user.streakCount || 0;
      sumLevel += dlt?.level || 1;
    }

    const averages = {
      overallMastery: count > 0 ? sumMastery / count : 0.0,
      overallRetention: count > 0 ? sumRetention / count : 0.0,
      placementReadiness: count > 0 ? sumReadiness / count : 0.0,
      streakCount: count > 0 ? sumStreak / count : 0.0,
      level: count > 0 ? sumLevel / count : 1.0,
    };

    // 2. Compile branching student details list based on shareDataConsent
    const membersDetails = members.map((m) => {
      const dlt = m.user.dltState;
      const isConsented = m.shareDataConsent;

      if (isConsented) {
        // Return fully identifiable details
        return {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          shareDataConsent: true,
          streakCount: m.user.streakCount,
          overallMastery: dlt?.overallMastery || 0.0,
          overallRetention: dlt?.overallRetention || 0.0,
          placementReadiness: dlt?.placementReadiness || 0.0,
          level: dlt?.level || 1,
          xpTotal: dlt?.xpTotal || 0,
        };
      } else {
        // Return masked / anonymized stats
        return {
          id: 'anonymous',
          name: 'Anonymous Student',
          email: 'masked@skillforge.local',
          role: m.role,
          shareDataConsent: false,
          streakCount: null,
          overallMastery: dlt?.overallMastery || 0.0,
          overallRetention: dlt?.overallRetention || 0.0,
          placementReadiness: dlt?.placementReadiness || 0.0,
          level: dlt?.level || 1,
          xpTotal: dlt?.xpTotal || 0,
        };
      }
    });

    return {
      success: true,
      cohortInfo: {
        id: cohort.id,
        name: cohort.name,
        inviteCode: cohort.inviteCode,
        totalStudents: count,
      },
      averages,
      members: membersDetails,
    };
  }

  /**
   * Student self-enrolls into a cohort using invite code
   */
  async enrollWithInviteCode(userId: string, inviteCode: string, shareDataConsent: boolean) {
    const cohort = await prisma.cohort.findUnique({
      where: { inviteCode },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found with this invite code');
    }

    const existingMember = await prisma.cohortMember.findUnique({
      where: {
        cohortId_userId: {
          cohortId: cohort.id,
          userId,
        },
      },
    });

    if (existingMember) {
      // Update consent if already enrolled
      const updated = await prisma.cohortMember.update({
        where: { id: existingMember.id },
        data: { shareDataConsent },
      });
      return { success: true, data: updated, message: 'Enrollment updated' };
    }

    const member = await prisma.cohortMember.create({
      data: {
        cohortId: cohort.id,
        userId,
        role: 'student',
        shareDataConsent,
      },
    });

    return { success: true, data: member, message: 'Enrolled in cohort successfully' };
  }
}
