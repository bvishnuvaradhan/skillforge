import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, ReportTargetType } from '@skillforge/db';
import crypto from 'crypto';

@Injectable()
export class CommunityService {
  /**
   * Create a new learning team
   */
  async createTeam(userId: string, name: string) {
    const existing = await prisma.team.findUnique({
      where: { name },
    });

    if (existing) {
      throw new BadRequestException('Team name is already taken');
    }

    // Check if user is already in a team (enforce 1 active team per user)
    const inTeam = await prisma.teamMember.findFirst({
      where: { userId },
    });

    if (inTeam) {
      throw new BadRequestException('You are already a member of a team');
    }

    const inviteCode = `team-${crypto.randomBytes(4).toString('hex')}`;
    const team = await prisma.team.create({
      data: {
        name,
        inviteCode,
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'owner',
      },
    });

    return { success: true, data: team };
  }

  /**
   * Join a team using invite code
   */
  async joinTeam(userId: string, inviteCode: string) {
    const team = await prisma.team.findUnique({
      where: { inviteCode },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is already in a team
    const inTeam = await prisma.teamMember.findFirst({
      where: { userId },
    });

    if (inTeam) {
      if (inTeam.teamId === team.id) {
        return { success: true, message: 'Already a member of this team', data: team };
      }
      throw new BadRequestException('You must leave your current team before joining a new one');
    }

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'member',
      },
    });

    return { success: true, data: team };
  }

  /**
   * Fetch active team dashboard progress
   */
  async getTeamDashboard(userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: { userId },
    });

    if (!member) {
      return { success: true, hasTeam: false, data: null };
    }

    const team = await prisma.team.findUnique({
      where: { id: member.teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                streakCount: true,
                status: true,
                dltState: {
                  select: {
                    xpTotal: true,
                    level: true,
                    overallMastery: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Filter out suspended members
    const activeMembers = team.members.filter((m) => m.user.status !== 'suspended');

    return {
      success: true,
      hasTeam: true,
      data: {
        id: team.id,
        name: team.name,
        inviteCode: team.inviteCode,
        members: activeMembers.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          role: m.role,
          streakCount: m.user.streakCount,
          xpTotal: m.user.dltState?.xpTotal || 0,
          level: m.user.dltState?.level || 1,
          overallMastery: m.user.dltState?.overallMastery || 0.0,
        })),
      },
    };
  }

  /**
   * Fetch leaderboards (Global and Cohort standings)
   */
  async getLeaderboards(userId: string) {
    // 1. Global leaderboards
    const globalStandings = await prisma.user.findMany({
      where: {
        status: { not: 'suspended' },
        dltState: { isNot: null },
      },
      orderBy: {
        dltState: {
          xpTotal: 'desc',
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        streakCount: true,
        dltState: {
          select: {
            xpTotal: true,
            level: true,
          },
        },
      },
    });

    // Format global
    const global = globalStandings.map((u) => ({
      userId: u.id,
      name: u.name,
      streakCount: u.streakCount,
      xpTotal: u.dltState?.xpTotal || 0,
      level: u.dltState?.level || 1,
    }));

    // 2. Cohort leaderboards
    let cohort: Array<{
      userId: string;
      name: string;
      streakCount: number;
      xpTotal: number;
      level: number;
    }> = [];
    const myCohortMembership = await prisma.cohortMember.findFirst({
      where: { userId },
    });

    if (myCohortMembership) {
      const cohortMembers = await prisma.cohortMember.findMany({
        where: {
          cohortId: myCohortMembership.cohortId,
          user: {
            status: { not: 'suspended' },
            dltState: { isNot: null },
          },
        },
        orderBy: {
          user: {
            dltState: {
              xpTotal: 'desc',
            },
          },
        },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              streakCount: true,
              dltState: {
                select: {
                  xpTotal: true,
                  level: true,
                },
              },
            },
          },
        },
      });

      cohort = cohortMembers.map((cm) => ({
        userId: cm.user.id,
        name: cm.user.name,
        streakCount: cm.user.streakCount,
        xpTotal: cm.user.dltState?.xpTotal || 0,
        level: cm.user.dltState?.level || 1,
      }));
    }

    return {
      success: true,
      global,
      cohort,
    };
  }

  /**
   * Submit a moderation report
   */
  async createReport(reporterId: string, targetType: ReportTargetType, targetId: string, reason: string) {
    // Validate target existence
    let targetExists = false;

    if (targetType === ReportTargetType.USER) {
      const u = await prisma.user.findUnique({ where: { id: targetId } });
      if (u) targetExists = true;
    } else if (targetType === ReportTargetType.MENTOR_PROFILE) {
      const m = await prisma.mentorProfile.findUnique({ where: { id: targetId } });
      if (m) targetExists = true;
    } else if (targetType === ReportTargetType.INTERVIEW_SESSION) {
      const s = await prisma.interviewSession.findUnique({ where: { id: targetId } });
      if (s) targetExists = true;
    }

    if (!targetExists) {
      throw new BadRequestException('Reported target entity does not exist or has been deleted');
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        status: 'pending',
      },
    });

    return { success: true, data: report };
  }
}
