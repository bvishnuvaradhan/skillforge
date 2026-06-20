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
  function_workshop: ['name', 'params', 'return_type', 'body'],
  bfs_explorer: ['start_node', 'visited_order', 'queue_states'],
  dfs_adventure: ['start_node', 'visited_order', 'stack_states'],
  recursion_maze: ['base_case', 'recursive_case', 'call_stack'],
  sliding_window: ['window_size', 'pointer_positions', 'result'],
  dp_builder: ['states', 'transitions', 'base_cases'],
  graph_puzzle: ['nodes', 'edges', 'traversal_path'],
  greedy_arena: ['choices', 'greedy_criterion', 'result_sequence'],
  type_sorter: ['matches'],
  echo_chamber: ['output_matches'],
  switchboard: ['routes'],
  factory_line: ['loop_config', 'actions'],
  black_box_factory: ['operations'],
  mirror_halls: ['base_condition', 'base_return', 'reduction_arg'],
  bug_hunt: ['buggy_line', 'variable_traces'],
  object_foundry: ['attributes', 'instantiations'],
  wire_register: ['connections'],
  heap_heist: ['allocations', 'freed'],
  test_case_tower: ['test_cases'],
  constructor_chain: ['chain'],
  shape_shifter_arena: ['assignments', 'calls'],
  vault_keeper: ['modifiers', 'access'],
  interface_bridge: ['mappings', 'methods'],
  assembly_yard: ['relationships'],
  pattern_forge: ['roles'],
  solid_foundations: ['violations', 'resolutions'],
  refactor_run: ['actions'],
  code_review_court: ['reviews'],
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
    const isUnlockedByDefault = !game.world.unlockCriteria ||
      Object.keys(game.world.unlockCriteria as Record<string, any>).length === 0 ||
      game.world.orderIndex === 1;
    const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');
    if (status === 'locked') {
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
    const isUnlockedByDefault = !game.world.unlockCriteria ||
      Object.keys(game.world.unlockCriteria as Record<string, any>).length === 0 ||
      game.world.orderIndex === 1;
    const status = progress?.status ?? (isUnlockedByDefault ? 'unlocked' : 'locked');
    if (status === 'locked') {
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

    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      select: { languageTrack: true },
    });
    const languageTrack = userDetails?.languageTrack ?? 'JAVASCRIPT';

    // Calculate score based on submission quality (structural evaluation)
    const score = this.evaluateSubmission(
      game.gameType,
      submission,
      game.config as Record<string, unknown>,
      languageTrack,
    );
    const passed = score >= 0.6;

    // Check if user has already passed or attempted this game before to prevent duplicate XP
    const hasPassedBefore = await prisma.gameAttempt.findFirst({
      where: { userId, gameId, passed: true },
    });
    const hasAttemptsBefore = await prisma.gameAttempt.findFirst({
      where: { userId, gameId },
    });

    let xpEarned = 0;
    if (passed && !hasPassedBefore) {
      xpEarned = game.xpReward;
    }

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
      const isFirstPass = !hasPassedBefore;

      // Update world progress
      await prisma.userWorldProgress.upsert({
        where: { userId_worldId: { userId, worldId: game.worldId } },
        update: {
          gamesCompleted: isFirstPass ? { increment: 1 } : undefined,
          xpEarned: xpEarned > 0 ? { increment: xpEarned } : undefined,
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
    } else {
      // Failed attempt: update status and trigger DLT worker with 0 XP on the first attempt
      if (!hasAttemptsBefore) {
        await prisma.userWorldProgress.upsert({
          where: { userId_worldId: { userId, worldId: game.worldId } },
          update: {
            status: 'in_progress',
          },
          create: {
            userId,
            worldId: game.worldId,
            status: 'in_progress',
            gamesCompleted: 0,
            xpEarned: 0,
          },
        });

        await this.dltWorker.enqueueDltUpdate({
          userId,
          eventType: 'game_attempt',
          topicTags: game.topicTags,
          score,
          xpEarned: 0,
        });
      }
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
   * Logical and semantic evaluation — scores submission based on correctness of the answer.
   * Handles E2E mock tests and actual game logic validation rules.
   */
  private evaluateSubmission(
    gameType: string,
    submission: Record<string, unknown>,
    config: Record<string, unknown>,
    languageTrack: string = 'JAVASCRIPT',
  ): number {
    const requiredKeys = GAME_SUBMISSION_TEMPLATES[gameType] ?? [];
    if (requiredKeys.length === 0) return 0.7;

    // 1. Fallback to expected_output if defined (such as in E2E tests)
    const expectedOutput = config.expected_output;
    if (expectedOutput !== undefined && submission.output_node !== undefined) {
      const outputMatch = JSON.stringify(submission.output_node) === JSON.stringify(expectedOutput);
      return outputMatch ? 1.0 : 0.2;
    }

    // 3. Logical/Semantic validation per gameType
    switch (gameType) {
      case 'logic_builder': {
        const blocks = Array.isArray(submission.blocks) ? (submission.blocks as string[]) : [];
        const decIdx = blocks.indexOf('declare_variable');
        const assIdx = blocks.indexOf('assign_value');
        const prnIdx = blocks.indexOf('print_output');
        const isValid = decIdx !== -1 && assIdx !== -1 && prnIdx !== -1 && decIdx < assIdx && assIdx < prnIdx;
        return isValid ? 1.0 : 0.2;
      }

      case 'ifelse_constructor': {
        const condStr = (Array.isArray(submission.condition_blocks) ? submission.condition_blocks[0] : '') || '';
        const tbStr = (Array.isArray(submission.true_branch) ? submission.true_branch[0] : '') || '';
        const fbStr = (Array.isArray(submission.false_branch) ? submission.false_branch[0] : '') || '';

        const cleanCond = String(condStr).replace(/\s+/g, '').toLowerCase();
        const cleanTb = String(tbStr).replace(/\s+/g, '').toLowerCase();
        const cleanFb = String(fbStr).replace(/\s+/g, '').toLowerCase();

        // Needs variable temp/temperature, comparison >, <, >=, <=, and number 25
        const matchesCond =
          (cleanCond.includes('temp') || cleanCond.includes('temperature')) &&
          (cleanCond.includes('>') || cleanCond.includes('<')) &&
          cleanCond.includes('25');

        // True branch must print/log Warm
        const matchesTb = cleanTb.includes('warm');

        // False branch must print/log Cold
        const matchesFb = cleanFb.includes('cold');

        const isValid = matchesCond && matchesTb && matchesFb;
        return isValid ? 1.0 : 0.2;
      }

      case 'loop_builder': {
        const loopType = submission.loop_type;
        const count = Number(submission.iteration_count);
        // Requires 'for' loop and exactly 10 iterations
        const isValid = loopType === 'for' && count === 10;
        return isValid ? 1.0 : 0.2;
      }

      case 'bfs_explorer': {
        const visited = Array.isArray(submission.visited_order) ? (submission.visited_order as string[]) : [];
        const visitedStr = JSON.stringify(visited);
        // Both standard left-to-right and level-by-level right-to-left are acceptable
        const isValid =
          visitedStr === JSON.stringify(['A', 'B', 'C', 'D', 'E', 'F']) ||
          visitedStr === JSON.stringify(['A', 'C', 'B', 'F', 'D', 'E']);
        return isValid ? 1.0 : 0.2;
      }

      case 'dfs_adventure': {
        const visited = Array.isArray(submission.visited_order) ? (submission.visited_order as string[]) : [];
        const visitedStr = JSON.stringify(visited);
        const isValid =
          visitedStr === JSON.stringify(['A', 'B', 'D', 'E', 'C', 'F']) ||
          visitedStr === JSON.stringify(['A', 'B', 'E', 'D', 'C', 'F']) ||
          visitedStr === JSON.stringify(['A', 'C', 'F', 'B', 'D', 'E']) ||
          visitedStr === JSON.stringify(['A', 'C', 'F', 'B', 'E', 'D']);
        return isValid ? 1.0 : 0.2;
      }

      case 'recursion_maze': {
        const baseCase = submission.base_case;
        const recursiveCase = submission.recursive_case;
        const callStack = Array.isArray(submission.call_stack) ? (submission.call_stack as string[]) : [];

        const bc = String(baseCase).replace(/\s+/g, '').toLowerCase();
        const rc = String(recursiveCase).replace(/\s+/g, '').toLowerCase();
        const stack = callStack.map((s) => String(s).replace(/\s+/g, '').toLowerCase());

        // Base case: check for boundary on 0 or 1, and return 1
        const bcValid =
          (bc.includes('n===0') ||
            bc.includes('n==0') ||
            bc.includes('n<=1') ||
            bc.includes('n<=0') ||
            bc.includes('n<1') ||
            bc.includes('n===1') ||
            bc.includes('n==1')) &&
          bc.includes('return1');

        // Recursive case: must call factorial recursively with n-1 and multiply by n
        const rcValid = rc.includes('factorial(n-1)') && (rc.includes('n*') || rc.includes('*n'));

        // Call stack frames: stack trace for n = 3 (includes factorial(3), factorial(2), factorial(1), and optionally factorial(0))
        const stackStr = JSON.stringify(stack);
        const isStackValid =
          stackStr === JSON.stringify(['factorial(3)', 'factorial(2)', 'factorial(1)', 'factorial(0)']) ||
          stackStr === JSON.stringify(['factorial(3)', 'factorial(2)', 'factorial(1)']);

        const isValid = bcValid && rcValid && isStackValid;
        return isValid ? 1.0 : 0.2;
      }

      case 'type_sorter': {
        const matches = (submission.matches as Record<string, string>) || {};
        const items = (config.items as Array<{ id: string; types: Record<string, string> }>) || [];
        if (items.length === 0) return 0.2;

        let allCorrect = true;
        for (const item of items) {
          const expected = item.types[languageTrack] || item.types['JAVASCRIPT'];
          const actual = matches[item.id];
          if (actual !== expected) {
            allCorrect = false;
            break;
          }
        }
        return allCorrect ? 1.0 : 0.2;
      }

      case 'echo_chamber': {
        const outputMatches = (submission.output_matches as Record<string, string>) || {};
        const puzzles = (config.puzzles as Record<string, Record<string, Array<{ id: string; output: string }>>>) || {};
        const list = (puzzles[languageTrack] || puzzles['JAVASCRIPT'] || []) as Array<{ id: string; output: string }>;
        if (list.length === 0) return 0.2;

        let allCorrect = true;
        for (const puzzle of list) {
          if (outputMatches[puzzle.id] !== puzzle.output) {
            allCorrect = false;
            break;
          }
        }
        return allCorrect ? 1.0 : 0.2;
      }

      case 'switchboard': {
        const routes = (submission.routes as Record<string, string>) || {};
        const inputs = (config.inputs as Array<{ value: string; target: string }>) || [];
        if (inputs.length === 0) return 0.2;

        let allCorrect = true;
        for (const input of inputs) {
          if (routes[input.value] !== input.target) {
            allCorrect = false;
            break;
          }
        }
        return allCorrect ? 1.0 : 0.2;
      }

      case 'factory_line': {
        const loopConfig = (submission.loop_config as { start?: unknown; end?: unknown; step?: unknown }) || {};
        const actions = Array.isArray(submission.actions) ? (submission.actions as string[]) : [];

        const start = Number(loopConfig.start ?? 0);
        const end = Number(loopConfig.end ?? 0);
        const step = Number(loopConfig.step ?? 0);

        const expectedIterations = Number(config.expected_iterations ?? 5);
        const expectedActions = (config.expected_actions as string[]) || [];

        const iterations = step > 0 ? Math.max(0, Math.ceil((end - start) / step)) : 0;

        const boundsValid = iterations === expectedIterations;
        const actionsValid = JSON.stringify(actions) === JSON.stringify(expectedActions);

        return boundsValid && actionsValid ? 1.0 : 0.2;
      }

      case 'function_workshop': {
        const name = String(submission.name ?? '').trim();
        const returnType = String(submission.return_type ?? '').trim();
        const params = Array.isArray(submission.params) ? submission.params : [];
        const body = Array.isArray(submission.body) ? submission.body : [];

        const expectedName = String(config.expected_name ?? '');
        const expectedReturnType = String(config.expected_return_type ?? '');
        const expectedParams = Array.isArray(config.expected_params) ? config.expected_params : [];
        const expectedBody = Array.isArray(config.expected_body) ? config.expected_body : [];

        const nameValid = name.toLowerCase() === expectedName.toLowerCase();
        const returnValid = returnType.toLowerCase() === expectedReturnType.toLowerCase();

        let paramsValid = params.length === expectedParams.length;
        if (paramsValid) {
          for (let i = 0; i < params.length; i++) {
            const p = params[i] as { name?: string; type?: string };
            const ep = expectedParams[i] as { name?: string; type?: string };
            if (p.name?.trim() !== ep.name?.trim() || p.type?.trim() !== ep.type?.trim()) {
              paramsValid = false;
              break;
            }
          }
        }

        const bodyValid = JSON.stringify(body) === JSON.stringify(expectedBody);

        return nameValid && returnValid && paramsValid && bodyValid ? 1.0 : 0.2;
      }

      case 'black_box_factory': {
        const operations = Array.isArray(submission.operations) ? submission.operations : [];
        const expectedOperations = Array.isArray(config.expected_operations) ? config.expected_operations : [];
        return JSON.stringify(operations) === JSON.stringify(expectedOperations) ? 1.0 : 0.2;
      }

      case 'mirror_halls': {
        const baseCondition = String(submission.base_condition ?? '');
        const baseReturn = String(submission.base_return ?? '').trim();
        const reductionArg = String(submission.reduction_arg ?? '');

        const cond0 = this.safeEval(baseCondition, 0);
        const cond1 = this.safeEval(baseCondition, 1);
        const reductionVal = this.safeEval(reductionArg, 5);

        const expectedBaseReturn = String(config.expected_base_return ?? '1').trim();

        const condValid = cond0 === true && cond1 === false;
        const returnValid = baseReturn === expectedBaseReturn;
        const reductionValid = reductionVal === 4;

        return condValid && returnValid && reductionValid ? 1.0 : 0.2;
      }

      case 'bug_hunt': {
        const buggyLine = Number(submission.buggy_line ?? 0);

        const puzzles = (config.puzzles as Record<string, { buggy_line: number }>) || {};
        const puzzle = puzzles[languageTrack] || puzzles['JAVASCRIPT'] || { buggy_line: 3 };

        return buggyLine === puzzle.buggy_line ? 1.0 : 0.2;
      }

      case 'object_foundry': {
        const attributes = Array.isArray(submission.attributes) ? submission.attributes : [];
        const instantiations = Array.isArray(submission.instantiations) ? submission.instantiations : [];

        const expectedAttributes = Array.isArray(config.expected_attributes) ? config.expected_attributes : [];
        const targetSpecs = Array.isArray(config.target_specs) ? config.target_specs as Array<{ color: string; price: number }> : [];

        let attrsValid = attributes.length === expectedAttributes.length;
        if (attrsValid) {
          for (let i = 0; i < attributes.length; i++) {
            const a = attributes[i] as { name?: string; type?: string };
            const ea = expectedAttributes[i] as { name?: string; type?: string };
            if (a.name?.trim() !== ea.name?.trim() || a.type?.trim() !== ea.type?.trim()) {
              attrsValid = false;
              break;
            }
          }
        }

        let instsValid = instantiations.length === targetSpecs.length;
        if (instsValid) {
          for (let i = 0; i < targetSpecs.length; i++) {
            const inst = instantiations[i] as { args?: unknown[] };
            const spec = targetSpecs[i];
            if (!spec) {
              instsValid = false;
              break;
            }
            const args = Array.isArray(inst.args) ? inst.args : [];

            if (args.length < 2) {
              instsValid = false;
              break;
            }

            const argColor = String(args[0] ?? '').replace(/['"]/g, '').trim();
            const argPrice = Number(args[1] ?? 0);

            if (argColor !== spec.color || argPrice !== spec.price) {
              instsValid = false;
              break;
            }
          }
        }

        return attrsValid && instsValid ? 1.0 : 0.2;
      }

      case 'wire_register': {
        const connections = Array.isArray(submission.connections) ? (submission.connections as Array<{ from: string; to: string }>) : [];
        const state: { INPUT: number; SP: number; OUTPUT_A: number; RAM: Record<number, number> } = { INPUT: 42, SP: 0, OUTPUT_A: 0, RAM: { 42: 99 } };
        let changed = true;
        let iterations = 0;
        while (changed && iterations < 10) {
          changed = false;
          iterations++;
          for (const conn of connections) {
            let value = 0;
            if (conn.from === 'INPUT') {
              value = state.INPUT;
            } else if (conn.from === 'SP') {
              value = state.SP;
            } else if (conn.from === 'RAM[SP]') {
              value = state.RAM[state.SP] || 0;
            }

            if (conn.to === 'SP') {
              if (state.SP !== value) {
                state.SP = value;
                changed = true;
              }
            } else if (conn.to === 'OUTPUT_A') {
              if (state.OUTPUT_A !== value) {
                state.OUTPUT_A = value;
                changed = true;
              }
            }
          }
        }
        return state.OUTPUT_A === 99 ? 1.0 : 0.2;
      }

      case 'heap_heist': {
        const allocations = Array.isArray(submission.allocations) ? submission.allocations : [];
        const expectedAllocations = Array.isArray(config.expected_allocations) ? config.expected_allocations : [];
        const freed = Array.isArray(submission.freed) ? submission.freed : [];
        const expectedFreed = Array.isArray(config.expected_freed) ? config.expected_freed : [];

        let allocsValid = allocations.length === expectedAllocations.length;
        if (allocsValid) {
          for (const expected of expectedAllocations) {
            const found = allocations.find(
              (a: any) => a.pointer === expected.pointer && a.heap_address === expected.heap_address
            );
            if (!found) {
              allocsValid = false;
              break;
            }
          }
        }

        let freedValid = freed.length === expectedFreed.length;
        if (freedValid) {
          for (const addr of expectedFreed) {
            if (!freed.includes(addr)) {
              freedValid = false;
              break;
            }
          }
        }

        return allocsValid && freedValid ? 1.0 : 0.2;
      }

      case 'test_case_tower': {
        const testCases = Array.isArray(submission.test_cases) ? submission.test_cases : [];
        if (testCases.length === 0 || testCases.length > 3) {
          return 0.2;
        }

        const covered = new Set<string>();
        for (const tc of testCases) {
          const x = Number(tc.x ?? 0);
          const y = Number(tc.y ?? 0);

          if (x > 0 && y < 5) {
            covered.add('Branch A');
          } else if (x === 0) {
            covered.add('Branch B');
          } else {
            covered.add('Branch C');
          }
        }

        const expectedBranches = (config.branches as string[]) || ['Branch A', 'Branch B', 'Branch C'];
        const allCovered = expectedBranches.every(b => covered.has(b));
        return allCovered ? 1.0 : 0.2;
      }

      case 'constructor_chain': {
        const chain = Array.isArray(submission.chain) ? submission.chain : [];
        const expectedChain = Array.isArray(config.expected_chain) ? config.expected_chain : [];
        return JSON.stringify(chain) === JSON.stringify(expectedChain) ? 1.0 : 0.2;
      }

      case 'shape_shifter_arena': {
        const assignments = (submission.assignments as Record<string, string>) || {};
        const calls = Array.isArray(submission.calls) ? submission.calls : [];

        const expectedAssignments = (config.expected_assignments as Record<string, string>) || {};
        const expectedCalls = Array.isArray(config.expected_calls) ? config.expected_calls : [];

        const assignmentsValid = JSON.stringify(assignments) === JSON.stringify(expectedAssignments);
        const callsValid = JSON.stringify(calls) === JSON.stringify(expectedCalls);

        return assignmentsValid && callsValid ? 1.0 : 0.2;
      }

      case 'vault_keeper': {
        const modifiers = (submission.modifiers as Record<string, string>) || {};
        const access = (submission.access as Record<string, string>) || {};

        const fields = Array.isArray(config.fields) ? config.fields : [];
        const methods = Array.isArray(config.methods) ? config.methods : [];

        let allCorrect = true;
        // Verify fields modifiers and access
        for (const f of fields) {
          const expectedModifier = f.expected_modifier;
          const expectedAccess = f.access;
          if (modifiers[f.name] !== expectedModifier || access[f.name] !== expectedAccess) {
            allCorrect = false;
            break;
          }
        }
        // Verify methods modifiers
        if (allCorrect) {
          for (const m of methods) {
            if (modifiers[m.name] !== m.expected_modifier) {
              allCorrect = false;
              break;
            }
          }
        }
        // Enforce logical constraints: public modifier MUST map to readwrite access
        if (allCorrect) {
          for (const key of Object.keys(modifiers)) {
            if (modifiers[key] === 'public' && access[key] && access[key] !== 'readwrite') {
              allCorrect = false;
              break;
            }
          }
        }
        return allCorrect ? 1.0 : 0.2;
      }

      case 'interface_bridge': {
        const mappings = (submission.mappings as Record<string, string[]>) || {};
        const methods = (submission.methods as Record<string, string[]>) || {};

        const expectedMappings = (config.expected_mappings as Record<string, string[]>) || {};
        const expectedMethods = (config.expected_methods as Record<string, string[]>) || {};

        // Helper to compare arrays ignoring order
        const arrayEquals = (a?: string[], b?: string[]) => {
          if (!a || !b) return false;
          if (a.length !== b.length) return false;
          const sortedA = [...a].sort();
          const sortedB = [...b].sort();
          return JSON.stringify(sortedA) === JSON.stringify(sortedB);
        };

        let isValid = true;
        for (const cls of Object.keys(expectedMappings)) {
          if (!arrayEquals(mappings[cls], expectedMappings[cls]) || !arrayEquals(methods[cls], expectedMethods[cls])) {
            isValid = false;
            break;
          }
        }
        return isValid ? 1.0 : 0.2;
      }

      case 'assembly_yard': {
        const relationships = (submission.relationships as Record<string, string>) || {};
        const expected = (config.expected_relationships as Record<string, string>) || {};

        let isValid = true;
        for (const key of Object.keys(expected)) {
          if (relationships[key] !== expected[key]) {
            isValid = false;
            break;
          }
        }
        return isValid ? 1.0 : 0.2;
      }

      case 'pattern_forge': {
        const roles = (submission.roles as Record<string, string>) || {};
        const expected = (config.expected_roles as Record<string, string>) || {};

        let isValid = true;
        for (const key of Object.keys(expected)) {
          if (roles[key] !== expected[key]) {
            isValid = false;
            break;
          }
        }
        return isValid ? 1.0 : 0.2;
      }

      case 'solid_foundations': {
        const violations = (submission.violations as Record<string, string>) || {};
        const resolutions = (submission.resolutions as Record<string, string>) || {};

        const expectedViolations = (config.expected_violations as Record<string, string>) || {};
        const expectedResolutions = (config.expected_resolutions as Record<string, string>) || {};

        let isValid = true;
        for (const key of Object.keys(expectedViolations)) {
          if (violations[key] !== expectedViolations[key] || resolutions[key] !== expectedResolutions[key]) {
            isValid = false;
            break;
          }
        }
        return isValid ? 1.0 : 0.2;
      }

      case 'refactor_run': {
        const actions = Array.isArray(submission.actions) ? submission.actions : [];
        const expected = Array.isArray(config.expected_sequence) ? config.expected_sequence : [];
        return JSON.stringify(actions) === JSON.stringify(expected) ? 1.0 : 0.2;
      }

      case 'code_review_court': {
        const reviews = (submission.reviews as Record<string, string>) || {};
        const expected = (config.expected_reviews as Record<string, string>) || {};

        let isValid = true;
        for (const key of Object.keys(expected)) {
          if (reviews[key] !== expected[key]) {
            isValid = false;
            break;
          }
        }
        return isValid ? 1.0 : 0.2;
      }

      default:
        // Fallback for other/future game types
        return 1.0;
    }
  }

  private safeEval(expr: string, nVal: number): any {
    const clean = (expr || '').replace(/\s+/g, '');
    if (!/^[n0-9+\-*/=<>!]+$/.test(clean)) {
      return null;
    }
    const replaced = clean.replace(/n/g, nVal.toString());

    const compMatch = replaced.match(/^([+-]?\d+)(===|!==|==|!=|<=|>=|<|>)([+-]?\d+)$/);
    if (compMatch && compMatch[1] !== undefined && compMatch[2] !== undefined && compMatch[3] !== undefined) {
      const v1 = parseInt(compMatch[1], 10);
      const op = compMatch[2];
      const v2 = parseInt(compMatch[3], 10);
      if (op === '===' || op === '==') return v1 === v2;
      if (op === '!==' || op === '!=') return v1 !== v2;
      if (op === '<=') return v1 <= v2;
      if (op === '>=') return v1 >= v2;
      if (op === '<') return v1 < v2;
      if (op === '>') return v1 > v2;
    }

    const arithmeticMatch = replaced.match(/^([+-]?\d+)([+\-*/])([+-]?\d+)$/);
    if (arithmeticMatch && arithmeticMatch[1] !== undefined && arithmeticMatch[2] !== undefined && arithmeticMatch[3] !== undefined) {
      const v1 = parseInt(arithmeticMatch[1], 10);
      const op = arithmeticMatch[2];
      const v2 = parseInt(arithmeticMatch[3], 10);
      if (op === '+') return v1 + v2;
      if (op === '-') return v1 - v2;
      if (op === '*') return v1 * v2;
      if (op === '/' && v2 !== 0) return v1 / v2;
      return null;
    }

    if (/^[+-]?\d+$/.test(replaced)) {
      return parseInt(replaced, 10);
    }

    return null;
  }
}
