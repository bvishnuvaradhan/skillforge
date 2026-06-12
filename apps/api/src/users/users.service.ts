import { Injectable, NotFoundException, ForbiddenException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { prisma, PrivacySetting, CodingPlatform, User } from '@skillforge/db';
import { UpdateProfileDto, LinkCodingProfileDto, UpdateSettingsDto } from './users.dto';
import { ProfileSyncService } from './profile-sync.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly profileSyncService: ProfileSyncService,
  ) {}
  /**
   * Helper to format a User model into a safe user object without passwordHash
   */
  private formatSafeUser(user: User) {
    const safeUser = { ...user } as Partial<User>;
    delete safeUser.passwordHash;
    return safeUser as Omit<User, 'passwordHash'>;
  }

  /**
   * Get current authenticated user details
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found or account is deactivated',
          details: {},
        },
      });
    }

    return {
      user: this.formatSafeUser(user),
    };
  }

  /**
   * Update current user profile details
   */
  async updateMe(userId: string, dto: UpdateProfileDto) {
    // Verify user exists and is active
    await this.getMe(userId);

    const updateData: Partial<User> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;
    if (dto.privacySetting !== undefined) {
      updateData.privacySetting = dto.privacySetting as PrivacySetting;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      user: this.formatSafeUser(updatedUser),
    };
  }

  /**
   * Update user settings (selected model, etc.)
   */
  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    await this.getMe(userId);

    const updateData: Partial<User> = {};
    if (dto.selectedModel !== undefined) {
      updateData.selectedModel = dto.selectedModel;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      user: this.formatSafeUser(updatedUser),
    };
  }

  /**
   * Schedule user account for deletion (soft delete)
   */
  async deleteMe(userId: string) {
    // Verify user exists and is active
    await this.getMe(userId);

    // Schedule deletion 30 days in the future
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: deletionDate },
    });

    return {
      message: 'Account scheduled for deletion in 30 days',
    };
  }

  /**
   * Fetch another user's profile (privacy checks enforced)
   */
  async getProfile(requesterId: string, profileId: string) {
    const user = await prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found',
          details: {},
        },
      });
    }

    // Privacy logic: private/team profiles can only be viewed by the owner themselves
    if (user.privacySetting !== PrivacySetting.public && requesterId !== profileId) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'This profile is private',
          details: {},
        },
      });
    }

    return {
      profile: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        badges: [], // Placeholder for Phase 2
        strengths: [], // Placeholder for Phase 2
        activityCalendar: {}, // Placeholder for Phase 2
      },
    };
  }

  /**
   * Link an external coding profile for a student
   */
  async linkCodingProfile(userId: string, dto: LinkCodingProfileDto) {
    const platform = dto.platform as CodingPlatform;

    // Check if platform is already linked
    const existing = await prisma.codingProfile.findFirst({
      where: { userId, platform },
    });

    if (existing) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Platform ${dto.platform} is already linked to this account`,
          details: {},
        },
      });
    }

    const codingProfile = await prisma.codingProfile.create({
      data: {
        userId,
        platform,
        username: dto.username,
        solvedCount: 0,
        rating: null,
      },
    });

    await this.profileSyncService.enqueueSync(userId, platform, dto.username);

    return {
      coding_profile: {
        id: codingProfile.id,
        platform: codingProfile.platform,
        username: codingProfile.username,
        solved_count: codingProfile.solvedCount,
        rating: codingProfile.rating,
      },
    };
  }

  /**
   * Unlink a coding profile
   */
  async unlinkCodingProfile(userId: string, platformStr: string) {
    // Validate platform string matches expected CodingPlatform enum values
    const validPlatforms = Object.values(CodingPlatform) as string[];
    if (!validPlatforms.includes(platformStr)) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid platform: ${platformStr}. Must be one of leetcode, codeforces, codechef, github`,
          details: {},
        },
      });
    }

    const platform = platformStr as CodingPlatform;

    const profile = await prisma.codingProfile.findFirst({
      where: { userId, platform },
    });

    if (!profile) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Coding profile for platform ${platform} not found`,
          details: {},
        },
      });
    }

    await prisma.codingProfile.delete({
      where: { id: profile.id },
    });

    await this.profileSyncService.recalculateMastery(userId);

    return {
      message: 'Profile unlinked',
    };
  }
}
