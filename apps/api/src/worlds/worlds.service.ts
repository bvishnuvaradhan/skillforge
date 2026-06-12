import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { DltWorkerService } from '../dlt/dlt-worker.service';

@Injectable()
export class WorldsService {
  constructor(
    private readonly dltWorker: DltWorkerService,
  ) {}

  /**
   * GET /v1/worlds — world map overview with user progress
   */
  async getWorlds(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true }
    });
    const languageTrack = user?.languageTrack ?? 'JAVASCRIPT';

    const worlds = await prisma.world.findMany({
      where: { status: 'published' },
      orderBy: { orderIndex: 'asc' },
      include: {
        progressEntries: { where: { userId } },
        lessons: {
          where: { status: 'published', languageTrack },
          select: { id: true },
        },
        _count: { select: { games: true, bossBattles: true } },
      },
    });

    return worlds.map((w) => {
      const progress = w.progressEntries[0];
      const isUnlockedByDefault = !w.unlockCriteria ||
        Object.keys(w.unlockCriteria as Record<string, any>).length === 0 ||
        w.orderIndex === 1;

      const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');

      return {
        id: w.id,
        slug: w.slug,
        name: w.name,
        description: w.description,
        order_index: w.orderIndex,
        xp_reward: w.xpReward,
        unlock_criteria: w.unlockCriteria,
        lesson_count: w.lessons.length,
        game_count: w._count.games,
        boss_count: w._count.bossBattles,
        progress: {
          status,
          lessons_completed: progress?.lessonsCompleted ?? 0,
          games_completed: progress?.gamesCompleted ?? 0,
          xp_earned: progress?.xpEarned ?? 0,
        },
      };
    });
  }

  /**
   * GET /v1/worlds/:slug — full world detail (403 if locked)
   */
  async getWorldBySlug(userId: string, slug: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true }
    });
    const languageTrack = user?.languageTrack ?? 'JAVASCRIPT';

    const world = await prisma.world.findUnique({
      where: { slug },
      include: {
        lessons: { 
          where: { status: 'published', languageTrack }, 
          orderBy: { orderIndex: 'asc' } 
        },
        games: { orderBy: { orderIndex: 'asc' } },
        bossBattles: {
          include: { badge: true },
        },
        progressEntries: { where: { userId } },
      },
    });

    if (!world) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'World not found', details: {} },
      });
    }

    const progress = world.progressEntries[0];
    const isUnlockedByDefault = !world.unlockCriteria ||
      Object.keys(world.unlockCriteria as Record<string, any>).length === 0 ||
      world.orderIndex === 1;

    const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');

    // Enforce lock — never expose content for locked worlds
    if (status === 'locked') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'WORLD_LOCKED', message: 'This world is locked. Complete prerequisites first.', details: { slug } },
      });
    }

    return {
      id: world.id,
      slug: world.slug,
      name: world.name,
      description: world.description,
      xp_reward: world.xpReward,
      unlock_criteria: world.unlockCriteria,
      progress: {
        status,
        lessons_completed: progress?.lessonsCompleted ?? 0,
        games_completed: progress?.gamesCompleted ?? 0,
        xp_earned: progress?.xpEarned ?? 0,
      },
      lessons: world.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order_index: l.orderIndex,
        estimated_minutes: l.estimatedMinutes,
        topic_tags: l.topicTags,
      })),
      games: world.games.map((g) => ({
        id: g.id,
        name: g.name,
        game_type: g.gameType,
        xp_reward: g.xpReward,
        order_index: g.orderIndex,
        tier: g.tier,
        topic_tags: g.topicTags,
      })),
      boss_battles: world.bossBattles.map((b) => ({
        id: b.id,
        name: b.name,
        level: b.level,
        xp_reward: b.xpReward,
        pass_threshold: b.passThreshold,
        badge: b.badge ? { id: b.badge.id, name: b.badge.name, rarity: b.badge.rarity } : null,
      })),
    };
  }

  /**
   * GET /v1/worlds/:slug/lessons/:id — single lesson content (access check)
   */
  async getLesson(userId: string, worldSlug: string, lessonId: string) {
    // Verify world access
    await this.assertWorldAccess(userId, worldSlug);

    const world = await prisma.world.findUnique({ where: { slug: worldSlug } });
    if (!world) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'World not found', details: {} },
      });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lesson not found', details: {} },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true }
    });
    const languageTrack = user?.languageTrack ?? 'JAVASCRIPT';

    if (lesson.languageTrack !== languageTrack) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'This lesson is for a different language track.',
          details: { expected: languageTrack, actual: lesson.languageTrack },
        },
      });
    }

    const lessons = await prisma.lesson.findMany({
      where: { worldId: world.id, status: 'published', languageTrack },
      orderBy: { orderIndex: 'asc' },
    });
    const lessonIndex = lessons.findIndex((l) => l.id === lessonId);

    const progress = await prisma.userWorldProgress.findUnique({
      where: { userId_worldId: { userId, worldId: world.id } },
    });
    const lessonsCompletedCount = progress?.lessonsCompleted ?? 0;
    const completed = lessonIndex !== -1 && lessonIndex < lessonsCompletedCount;

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      order_index: lesson.orderIndex,
      estimated_minutes: lesson.estimatedMinutes,
      topic_tags: lesson.topicTags,
      completed,
    };
  }

  /**
   * POST /v1/worlds/:slug/lessons/:id/complete
   */
  async completeLesson(userId: string, worldSlug: string, lessonId: string) {
    await this.assertWorldAccess(userId, worldSlug);

    const world = await prisma.world.findUnique({ where: { slug: worldSlug } });
    if (!world) throw new NotFoundException({ success: false, error: { code: 'NOT_FOUND', message: 'World not found', details: {} } });

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException({ success: false, error: { code: 'NOT_FOUND', message: 'Lesson not found', details: {} } });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true }
    });
    const languageTrack = user?.languageTrack ?? 'JAVASCRIPT';

    if (lesson.languageTrack !== languageTrack) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'This lesson is for a different language track.',
          details: { expected: languageTrack, actual: lesson.languageTrack },
        },
      });
    }

    // Enforce sequential lesson completion
    const lessons = await prisma.lesson.findMany({
      where: { worldId: world.id, status: 'published', languageTrack },
      orderBy: { orderIndex: 'asc' },
    });

    const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
    if (lessonIndex === -1) {
      throw new NotFoundException({ success: false, error: { code: 'NOT_FOUND', message: 'Lesson not found in this world', details: {} } });
    }

    const progress = await prisma.userWorldProgress.findUnique({
      where: { userId_worldId: { userId, worldId: world.id } },
    });
    const currentCompleted = progress?.lessonsCompleted ?? 0;

    if (lessonIndex < currentCompleted) {
      // Lesson is already completed, return success but with 0 XP
      return { message: 'Lesson already completed', xp_earned: 0 };
    }

    if (lessonIndex > currentCompleted) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'PREREQUISITE_LESSON_REQUIRED',
          message: 'Complete the previous lessons first.',
          details: { current_completed: currentCompleted, target_lesson_index: lessonIndex },
        },
      });
    }

    const XP_PER_LESSON = 25;

    // Update world progress
    await prisma.userWorldProgress.upsert({
      where: { userId_worldId: { userId, worldId: world.id } },
      update: {
        lessonsCompleted: { increment: 1 },
        xpEarned: { increment: XP_PER_LESSON },
        status: 'in_progress',
      },
      create: {
        userId,
        worldId: world.id,
        status: 'in_progress',
        lessonsCompleted: 1,
        xpEarned: XP_PER_LESSON,
      },
    });

    // Trigger async DLT update
    await this.dltWorker.enqueueDltUpdate({
      userId,
      eventType: 'lesson_complete',
      topicTags: lesson.topicTags,
      score: 0.5, // Lesson completion gives moderate mastery nudge
      xpEarned: XP_PER_LESSON,
    });

    return { message: 'Lesson completed', xp_earned: XP_PER_LESSON };
  }

  private async assertWorldAccess(userId: string, worldSlug: string): Promise<void> {
    const world = await prisma.world.findUnique({ where: { slug: worldSlug } });
    if (!world) {
      throw new NotFoundException({ success: false, error: { code: 'NOT_FOUND', message: 'World not found', details: {} } });
    }

    const progress = await prisma.userWorldProgress.findUnique({
      where: { userId_worldId: { userId, worldId: world.id } },
    });

    const isUnlockedByDefault = !world.unlockCriteria ||
      Object.keys(world.unlockCriteria as Record<string, any>).length === 0 ||
      world.orderIndex === 1;

    const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');

    if (status === 'locked') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'WORLD_LOCKED', message: 'This world is locked.', details: { slug: worldSlug } },
      });
    }
  }

  async assertLessonBelongsToWorld(lessonId: string, worldSlug: string): Promise<void> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { world: true },
    });
    if (!lesson || lesson.world.slug !== worldSlug) {
      throw new BadRequestException({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Lesson does not belong to this world', details: {} },
      });
    }
  }
}
