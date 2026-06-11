import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { DltWorkerService } from '../dlt/dlt-worker.service';

/**
 * Structural JSON validation templates for each game type.
 * Backend validates that the submission has these required keys.
 * No code execution — pure structural validation.
 */
const GAME_SUBMISSION_TEMPLATES: Record<string, string[]> = {
  logic_builder: ['blocks', 'connections', 'output_node'],
  ifelse_constructor: ['condition_blocks', 'true_branch', 'false_branch'],
  loop_builder: ['loop_type', 'iteration_count', 'body_blocks'],
  function_workshop: ['function_name', 'parameters', 'body_blocks', 'return_block'],
  bfs_explorer: ['start_node', 'visited_order', 'queue_states'],
  dfs_adventure: ['start_node', 'visited_order', 'stack_states'],
  recursion_maze: ['base_case', 'recursive_case', 'call_stack'],
  sliding_window: ['window_size', 'pointer_positions', 'result'],
  dp_builder: ['states', 'transitions', 'base_cases'],
  graph_puzzle: ['nodes', 'edges', 'traversal_path'],
  greedy_arena: ['choices', 'greedy_criterion', 'result_sequence'],
};

@Injectable()
export class GamesService {
  constructor(private readonly dltWorker: DltWorkerService) {}

  async getGame(userId: string, gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { world: { include: { progressEntries: { where: { userId } } } } },
    });

    if (!game) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Game not found', details: {} },
      });
    }

    // Check world access
    const progress = game.world.progressEntries[0];
    if (!progress || progress.status === 'locked') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'WORLD_LOCKED', message: 'Complete the world prerequisites first.', details: {} },
      });
    }

    // Check premium tier
    if (game.tier === 'premium') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (user?.plan !== 'premium') {
        throw new ForbiddenException({
          success: false,
          error: { code: 'PREMIUM_REQUIRED', message: 'This game requires a premium subscription.', details: {} },
        });
      }
    }

    return {
      id: game.id,
      name: game.name,
      game_type: game.gameType,
      config: game.config,
      topic_tags: game.topicTags,
      xp_reward: game.xpReward,
      mastery_contribution: game.masteryContribution,
    };
  }

  async submitGame(userId: string, gameId: string, submission: Record<string, unknown>) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { world: { include: { progressEntries: { where: { userId } } } } },
    });

    if (!game) {
      throw new NotFoundException({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Game not found', details: {} },
      });
    }

    // World access check
    const progress = game.world.progressEntries[0];
    if (!progress || progress.status === 'locked') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'WORLD_LOCKED', message: 'Complete the world prerequisites first.', details: {} },
      });
    }

    // Structural JSON template validation — no code execution
    const requiredKeys = GAME_SUBMISSION_TEMPLATES[game.gameType];
    if (requiredKeys) {
      const missingKeys = requiredKeys.filter((key) => !(key in submission));
      if (missingKeys.length > 0) {
        throw new BadRequestException({
          success: false,
          error: {
            code: 'INVALID_SUBMISSION',
            message: `Submission is missing required keys: ${missingKeys.join(', ')}`,
            details: { required_keys: requiredKeys, missing_keys: missingKeys },
          },
        });
      }
    }

    // Calculate score based on submission quality (structural evaluation)
    const score = this.evaluateSubmission(game.gameType, submission, game.config as Record<string, unknown>);
    const passed = score >= 0.6;
    const xpEarned = passed ? game.xpReward : Math.floor(game.xpReward * 0.2);

    // Get attempt number
    const prevAttempts = await prisma.gameAttempt.count({ where: { userId, gameId } });
    const timeSeconds = typeof submission.time_seconds === 'number' ? submission.time_seconds : 0;
    const hintsUsed = typeof submission.hints_used === 'number' ? submission.hints_used : 0;

    // Record attempt
    await prisma.gameAttempt.create({
      data: {
        userId,
        gameId,
        score,
        passed,
        hintsUsed,
        timeSeconds,
        attemptNumber: prevAttempts + 1,
      },
    });

    if (passed) {
      // Update world progress
      await prisma.userWorldProgress.upsert({
        where: { userId_worldId: { userId, worldId: game.worldId } },
        update: {
          gamesCompleted: { increment: 1 },
          xpEarned: { increment: xpEarned },
          status: 'in_progress',
        },
        create: {
          userId,
          worldId: game.worldId,
          status: 'in_progress',
          gamesCompleted: 1,
          xpEarned,
        },
      });

      // Enqueue BullMQ DLT update
      await this.dltWorker.enqueueDltUpdate({
        userId,
        eventType: 'game_attempt',
        topicTags: game.topicTags,
        score,
        xpEarned,
      });
    }

    return {
      score,
      passed,
      xp_earned: xpEarned,
      attempt_number: prevAttempts + 1,
      feedback: passed
        ? 'Great work! Your solution structure is correct.'
        : 'Keep practicing! Focus on the required blocks and connections.',
    };
  }

  /**
   * Structural evaluation — scores submission based on completeness of required fields
   * and their non-empty values. No code execution.
   */
  private evaluateSubmission(
    gameType: string,
    submission: Record<string, unknown>,
    config: Record<string, unknown>,
  ): number {
    const requiredKeys = GAME_SUBMISSION_TEMPLATES[gameType] ?? [];
    if (requiredKeys.length === 0) return 0.7;

    let score = 0;
    for (const key of requiredKeys) {
      const value = submission[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          score += value.length > 0 ? 1 : 0.5;
        } else {
          score += 1;
        }
      }
    }

    // Check against expected_output if config provides it
    const expectedOutput = config.expected_output;
    if (expectedOutput !== undefined && submission.output_node !== undefined) {
      const outputMatch = JSON.stringify(submission.output_node) === JSON.stringify(expectedOutput);
      return outputMatch ? 1.0 : score / requiredKeys.length * 0.8;
    }

    return Math.min(1.0, score / requiredKeys.length);
  }
}
