import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@skillforge/db';
import cookieParser from 'cookie-parser';
import { CodeRunnerService } from '../src/boss/code-runner.service';

jest.setTimeout(30000);

describe('LearningLoop (e2e)', () => {
  let app: NestExpressApplication;
  const uniqueId = Date.now();

  const studentEmail = `student-loop-${uniqueId}@example.com`;
  const studentPassword = 'SecurePassword123!';
  let studentCookie: string[] = [];
  let studentId = '';

  // Seeded IDs for verification
  let badgeId = '';
  let world1Id = '';
  let world2Id = '';
  let lessonId = '';
  let gameId = '';
  let typeSorterGameId = '';
  let echoChamberGameId = '';
  let switchboardGameId = '';
  let factoryLineGameId = '';
  let functionWorkshopGameId = '';
  let blackBoxFactoryGameId = '';
  let mirrorHallsGameId = '';
  let bugHuntGameId = '';
  let objectFoundryGameId = '';
  let wireRegisterGameId = '';
  let heapHeistGameId = '';
  let testCaseTowerGameId = '';
  let constructorChainGameId = '';
  let shapeShifterArenaGameId = '';
  let vaultKeeperGameId = '';
  let interfaceBridgeGameId = '';
  let assemblyYardGameId = '';
  let patternForgeGameId = '';
  let solidFoundationsGameId = '';
  let refactorRunGameId = '';
  let codeReviewCourtGameId = '';
  let bossId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(CodeRunnerService)
    .useValue({
      runCode: jest.fn().mockImplementation(async (_lang, code) => {
        if (code.includes('fail')) {
          return { success: false, error: 'Compilation failed' };
        }
        return { success: true, results: [] };
      }),
    })
    .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.use(cookieParser());
    await app.init();

    // 1. Register and login student
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Learning Loop Student',
        email: studentEmail,
        password: studentPassword,
        role: 'student',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: studentEmail,
        password: studentPassword,
      })
      .expect(200);

    studentCookie = (loginRes.headers['set-cookie'] as unknown as string[]) || [];
    studentId = loginRes.body.data.user.id;

    // 2. Setup DLT state and initial default unlocked world progress for variables-kingdom
    await prisma.dltState.create({
      data: {
        userId: studentId,
        overallMastery: 0.1,
        overallRetention: 0.8,
        learningStyle: 'game_based',
      },
    });

    // 3. Seed Learning content for test
    const badge = await prisma.badge.create({
      data: {
        name: `Test Variables Badge ${uniqueId}`,
        description: 'Completed Variables Test Boss',
        imageUrl: 'http://test.com/badge.png',
        rarity: 'common',
      },
    });
    badgeId = badge.id;

    const w1 = await prisma.world.create({
      data: {
        name: `Variables Kingdom E2E ${uniqueId}`,
        slug: `variables-kingdom-e2e-${uniqueId}`,
        description: 'Variables world for testing',
        orderIndex: 1,
        status: 'published',
        unlockCriteria: {}, // Unlocked by default
      },
    });
    world1Id = w1.id;

    const w2 = await prisma.world.create({
      data: {
        name: `Conditions Valley E2E ${uniqueId}`,
        slug: `conditions-valley-e2e-${uniqueId}`,
        description: 'Conditions world for testing',
        orderIndex: 2,
        status: 'published',
        unlockCriteria: {
          required_topics: [
            { topic_id: 'variables', min_mastery: 0.5 }
          ]
        },
      },
    });
    world2Id = w2.id;

    // Set first world progress to unlocked
    await prisma.userWorldProgress.create({
      data: {
        userId: studentId,
        worldId: world1Id,
        status: 'unlocked',
      },
    });

    // Set second world progress to locked
    await prisma.userWorldProgress.create({
      data: {
        userId: studentId,
        worldId: world2Id,
        status: 'locked',
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        worldId: world1Id,
        title: 'Variables Basics',
        orderIndex: 1,
        estimatedMinutes: 5,
        topicTags: ['variables'],
        status: 'published',
        content: {
          blocks: [
            { type: 'paragraph', content: 'Variables store values.' }
          ]
        },
      },
    });
    lessonId = lesson.id;

    const game = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Logic Builder: Variable Assignment',
        gameType: 'logic_builder',
        orderIndex: 1,
        masteryContribution: 0.4,
        xpReward: 50,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          expected_output: '42'
        },
      },
    });
    gameId = game.id;

    const boss = await prisma.bossBattle.create({
      data: {
        worldId: world1Id,
        name: 'Variables Overlord',
        level: 'mini',
        passThreshold: 0.5,
        xpReward: 100,
        badgeId: badgeId,
        questions: {
          level1: {
            type: 'quiz',
            questions: [
              { id: 'q1', text: 'What keyword defines a constant?', options: ['const', 'let', 'var'], correctAnswer: 'const', topic: 'variables' },
              { id: 'q2', text: 'Q2', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q3', text: 'Q3', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q4', text: 'Q4', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' },
              { id: 'q5', text: 'Q5', options: ['A', 'B'], correctAnswer: 'A', topic: 'variables' }
            ]
          },
          level2: {
            type: 'matching',
            prompt: 'Match data types',
            pairs: [
              { left: 'int', right: 'integer' },
              { left: 'float', right: 'floating point' }
            ]
          },
          level3: {
            type: 'boss_fight',
            monster: {
              name: 'Variables Overlord',
              maxHp: 100
            },
            challenges: {
              JAVASCRIPT: {
                prompt: 'Write doubleValue function',
                starterCode: 'function doubleValue(x) {}',
                testCases: [
                  { input: '2', output: '4' }
                ]
              }
            }
          }
        } as any,
      },
    });
    bossId = boss.id;

    const typeSorter = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Type Sorter Test',
        gameType: 'type_sorter',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          items: [
            { id: 'val1', value: '42', types: { JAVASCRIPT: 'number', PYTHON: 'int', JAVA: 'int', C: 'int', CPP: 'int' } },
            { id: 'val2', value: 'true', types: { JAVASCRIPT: 'boolean', PYTHON: 'bool', JAVA: 'boolean', C: 'bool', CPP: 'bool' } }
          ]
        }
      }
    });
    typeSorterGameId = typeSorter.id;

    const echoChamber = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Echo Chamber Test',
        gameType: 'echo_chamber',
        orderIndex: 3,
        masteryContribution: 0.3,
        xpReward: 75,
        tier: 'free',
        topicTags: ['io-flow'],
        config: {
          puzzles: {
            JAVASCRIPT: [
              { id: 'p1', statement: 'console.log("Val: " + 10);', output: 'Val: 10' }
            ]
          }
        }
      }
    });
    echoChamberGameId = echoChamber.id;

    const switchboard = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Switchboard Test',
        gameType: 'switchboard',
        orderIndex: 4,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['conditionals'],
        config: {
          inputs: [
            { value: '1', target: 'case 1' }
          ]
        }
      }
    });
    switchboardGameId = switchboard.id;

    const factoryLine = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Factory Line Test',
        gameType: 'factory_line',
        orderIndex: 5,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['loops'],
        config: {
          expected_iterations: 5,
          expected_actions: ['retrieve', 'paint']
        }
      }
    });
    factoryLineGameId = factoryLine.id;

    const functionWorkshop = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Function Workshop Test',
        gameType: 'function_workshop',
        orderIndex: 6,
        masteryContribution: 0.3,
        xpReward: 75,
        tier: 'free',
        topicTags: ['functions'],
        config: {
          expected_name: 'calculateInterest',
          expected_params: [
            { name: 'principal', type: 'number' },
            { name: 'rate', type: 'number' }
          ],
          expected_return_type: 'number',
          expected_body: ['multiply', 'return']
        }
      }
    });
    functionWorkshopGameId = functionWorkshop.id;

    const blackBoxFactory = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Black Box Factory Test',
        gameType: 'black_box_factory',
        orderIndex: 7,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['functions'],
        config: {
          inputs: [2, 5, 10],
          outputs: [5, 11, 21],
          expected_operations: ['multiply_2', 'add_1']
        }
      }
    });
    blackBoxFactoryGameId = blackBoxFactory.id;

    const mirrorHalls = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Mirror Halls Test',
        gameType: 'mirror_halls',
        orderIndex: 8,
        masteryContribution: 0.3,
        xpReward: 85,
        tier: 'free',
        topicTags: ['recursion'],
        config: {
          expected_base_condition: 'n === 0',
          expected_base_return: '1',
          expected_reduction_arg: 'n - 1'
        }
      }
    });
    mirrorHallsGameId = mirrorHalls.id;

    const bugHunt = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Bug Hunt Test',
        gameType: 'bug_hunt',
        orderIndex: 9,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['debugging'],
        config: {
          puzzles: {
            JAVASCRIPT: {
              code: "function findMax(arr) {\n  let max = arr[0];\n  for (let i = 0; i <= arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}",
              buggy_line: 3
            }
          }
        }
      }
    });
    bugHuntGameId = bugHunt.id;

    const objectFoundry = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Object Foundry Test',
        gameType: 'object_foundry',
        orderIndex: 10,
        masteryContribution: 0.3,
        xpReward: 95,
        tier: 'free',
        topicTags: ['classes'],
        config: {
          class_name: 'Car',
          expected_attributes: [
            { name: 'color', type: 'string' },
            { name: 'price', type: 'number' }
          ],
          target_specs: [
            { color: 'red', price: 15000 },
            { color: 'blue', price: 25000 }
          ]
        }
      }
    });
    objectFoundryGameId = objectFoundry.id;

    const wireRegister = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Wire Register Test',
        gameType: 'wire_register',
        orderIndex: 11,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['memory'],
        config: {
          initial_state: {
            INPUT: 42,
            RAM: { "42": 99 },
            SP: 0,
            OUTPUT_A: 0
          },
          expected_final_state: {
            OUTPUT_A: 99
          }
        }
      }
    });
    wireRegisterGameId = wireRegister.id;

    const heapHeist = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Heap Heist Test',
        gameType: 'heap_heist',
        orderIndex: 12,
        masteryContribution: 0.3,
        xpReward: 85,
        tier: 'free',
        topicTags: ['memory'],
        config: {
          code_sequence: [
            "int* ptr1 = malloc(sizeof(int));",
            "int* ptr2 = malloc(sizeof(int));",
            "ptr1 = ptr2;",
            "free(ptr2);"
          ],
          expected_allocations: [
            { pointer: "ptr1", heap_address: "0x2000" },
            { pointer: "ptr2", heap_address: "0x2000" }
          ],
          expected_freed: ["0x2000"]
        }
      }
    });
    heapHeistGameId = heapHeist.id;

    const testCaseTower = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Test Case Tower Test',
        gameType: 'test_case_tower',
        orderIndex: 13,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['debugging'],
        config: {
          code_snippet: "function process(x, y) {\n  if (x > 0 && y < 5) {\n    return 'Branch A';\n  } else if (x === 0) {\n    return 'Branch B';\n  } else {\n    return 'Branch C';\n  }\n}",
          branches: ["Branch A", "Branch B", "Branch C"],
          max_test_cases: 3
        }
      }
    });
    testCaseTowerGameId = testCaseTower.id;

    const constructorChain = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Constructor Chain Test',
        gameType: 'constructor_chain',
        orderIndex: 14,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['classes'],
        config: {
          target_desc: "Construct a SportsCar with color 'red', price 50000, and maxSpeed 200",
          expected_chain: ["super", "this_maxSpeed"]
        }
      }
    });
    constructorChainGameId = constructorChain.id;

    const shapeShifterArena = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Shape Shifter Arena Test',
        gameType: 'shape_shifter_arena',
        orderIndex: 15,
        masteryContribution: 0.3,
        xpReward: 95,
        tier: 'free',
        topicTags: ['oop-principles'],
        config: {
          slots: ["slot1", "slot2"],
          expected_assignments: {
            slot1: "Mage",
            slot2: "Archer"
          },
          expected_calls: ["slot1.attack()", "slot2.attack()"]
        }
      }
    });
    shapeShifterArenaGameId = shapeShifterArena.id;

    const vaultKeeper = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Vault Keeper Test',
        gameType: 'vault_keeper',
        orderIndex: 16,
        masteryContribution: 0.3,
        xpReward: 95,
        tier: 'free',
        topicTags: ['oop-principles'],
        config: {
          fields: [
            { name: "secretCode", description: "Highly sensitive secret code", expected_modifier: "private", access: "hidden" },
            { name: "bankBalance", description: "Standard account balance, readable only", expected_modifier: "private", access: "readonly" },
            { name: "ownerName", description: "Fully public owner name", expected_modifier: "public", access: "readwrite" }
          ],
          methods: [
            { name: "getSecretCode", expected_modifier: "private" },
            { name: "deposit", expected_modifier: "public" },
            { name: "withdraw", expected_modifier: "public" }
          ]
        }
      }
    });
    vaultKeeperGameId = vaultKeeper.id;

    const interfaceBridge = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Interface Bridge Test',
        gameType: 'interface_bridge',
        orderIndex: 17,
        masteryContribution: 0.3,
        xpReward: 85,
        tier: 'free',
        topicTags: ['advanced-oop'],
        config: {
          expected_mappings: {
            Car: ["Drivable"],
            Airplane: ["Drivable", "Flyable"]
          },
          expected_methods: {
            Car: ["drive"],
            Airplane: ["drive", "fly"]
          }
        }
      }
    });
    interfaceBridgeGameId = interfaceBridge.id;

    const assemblyYard = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Assembly Yard Test',
        gameType: 'assembly_yard',
        orderIndex: 18,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['advanced-oop'],
        config: {
          expected_relationships: {
            Engine: "composition",
            Wheel: "composition",
            Driver: "aggregation",
            NavigationService: "dependency"
          }
        }
      }
    });
    assemblyYardGameId = assemblyYard.id;

    const patternForge = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Pattern Forge Test',
        gameType: 'pattern_forge',
        orderIndex: 19,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['design-patterns'],
        config: {
          pattern_name: "Strategy",
          expected_roles: {
            PaymentProcessor: "Context",
            IPaymentStrategy: "StrategyInterface",
            CreditCardPayment: "ConcreteStrategy",
            PayPalPayment: "ConcreteStrategy"
          }
        }
      }
    });
    patternForgeGameId = patternForge.id;

    const solidFoundations = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'SOLID Foundations Test',
        gameType: 'solid_foundations',
        orderIndex: 20,
        masteryContribution: 0.3,
        xpReward: 95,
        tier: 'free',
        topicTags: ['design-patterns'],
        config: {
          expected_violations: {
            snippet_s: "SRP",
            snippet_o: "OCP",
            snippet_l: "LSP",
            snippet_i: "ISP",
            snippet_d: "DIP"
          },
          expected_resolutions: {
            snippet_s: "res_s",
            snippet_o: "res_o",
            snippet_l: "res_l",
            snippet_i: "res_i",
            snippet_d: "res_d"
          }
        }
      }
    });
    solidFoundationsGameId = solidFoundations.id;

    const refactorRun = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Refactor Run Test',
        gameType: 'refactor_run',
        orderIndex: 21,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['real-world-swe'],
        config: {
          expected_sequence: ["replace_magic_numbers", "extract_method", "rename_variables"]
        }
      }
    });
    refactorRunGameId = refactorRun.id;

    const codeReviewCourt = await prisma.game.create({
      data: {
        worldId: world1Id,
        name: 'Code Review Court Test',
        gameType: 'code_review_court',
        orderIndex: 22,
        masteryContribution: 0.3,
        xpReward: 95,
        tier: 'free',
        topicTags: ['real-world-swe'],
        config: {
          expected_reviews: {
            line1: "security_flaw",
            line2: "style_violation",
            line3: "performance_issue",
            line4: "correct_code"
          }
        }
      }
    });
    codeReviewCourtGameId = codeReviewCourt.id;
  });

  afterAll(async () => {
    // Cleanup everything
    await prisma.userBadge.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.bossAttempt.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.gameAttempt.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.userWorldProgress.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.dltState.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.masteryScore.deleteMany({ where: { userId: studentId } }).catch(() => {});
    await prisma.lesson.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.game.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.bossBattle.deleteMany({ where: { worldId: world1Id } }).catch(() => {});
    await prisma.world.deleteMany({ where: { id: { in: [world1Id, world2Id] } } }).catch(() => {});
    await prisma.badge.deleteMany({ where: { id: badgeId } }).catch(() => {});
    await prisma.user.delete({ where: { id: studentId } }).catch(() => {});

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /worlds', () => {
    it('should retrieve list of published worlds with student progress states', async () => {
      const response = await request(app.getHttpServer())
        .get('/worlds')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      const w1Progress = response.body.data.find((w: any) => w.id === world1Id);
      expect(w1Progress).toBeDefined();
      expect(w1Progress.progress.status).toBe('unlocked');

      const w2Progress = response.body.data.find((w: any) => w.id === world2Id);
      expect(w2Progress).toBeDefined();
      expect(w2Progress.progress.status).toBe('locked');
    });
  });

  describe('GET /worlds/:slug', () => {
    it('should return 403 Forbidden for locked worlds', async () => {
      const slug2 = `conditions-valley-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug2}`)
        .set('Cookie', studentCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WORLD_LOCKED');
    });

    it('should return 200 and details for unlocked world', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug1}`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe(slug1);
      expect(response.body.data.lessons).toBeInstanceOf(Array);
      expect(response.body.data.games).toBeInstanceOf(Array);
      expect(response.body.data.boss_battles).toBeInstanceOf(Array);
    });
  });

  describe('GET /worlds/:slug/lessons/:lessonId', () => {
    it('should retrieve lesson content details', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug1}/lessons/${lessonId}`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(lessonId);
      expect(response.body.data.content).toBeDefined();
    });
  });

  describe('POST /worlds/:slug/lessons/:lessonId/complete', () => {
    let lesson2Id = '';

    beforeAll(async () => {
      const lesson2 = await prisma.lesson.create({
        data: {
          worldId: world1Id,
          title: 'Variables Basics Part 2',
          orderIndex: 2,
          estimatedMinutes: 5,
          topicTags: ['variables'],
          status: 'published',
          content: { blocks: [{ type: 'paragraph', content: 'More variables.' }] },
        },
      });
      lesson2Id = lesson2.id;
    });

    afterAll(async () => {
      await prisma.lesson.delete({ where: { id: lesson2Id } }).catch(() => {});
    });

    it('should reject completing a future lesson out of order', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .post(`/worlds/${slug1}/lessons/${lesson2Id}/complete`)
        .set('Cookie', studentCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PREREQUISITE_LESSON_REQUIRED');
    });

    it('should successfully complete the first lesson and award initial XP', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .post(`/worlds/${slug1}/lessons/${lessonId}/complete`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.xp_earned).toBe(25);
    });

    it('should return completed: true when fetching an already completed lesson', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .get(`/worlds/${slug1}/lessons/${lessonId}`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
    });

    it('should return 0 XP on duplicate completions of the same lesson', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .post(`/worlds/${slug1}/lessons/${lessonId}/complete`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.xp_earned).toBe(0);
    });

    it('should complete the second lesson successfully now that the first is completed', async () => {
      const slug1 = `variables-kingdom-e2e-${uniqueId}`;
      const response = await request(app.getHttpServer())
        .post(`/worlds/${slug1}/lessons/${lesson2Id}/complete`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.xp_earned).toBe(25);
    });
  });

  describe('GET /dlt/me and GET /mastery', () => {
    it('should retrieve student DLT state and mastery scores', async () => {
      const dltResponse = await request(app.getHttpServer())
        .get('/dlt/me')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(dltResponse.body.success).toBe(true);
      expect(dltResponse.body.data.xp_total).toBeDefined();

      const masteryResponse = await request(app.getHttpServer())
        .get('/mastery')
        .set('Cookie', studentCookie)
        .expect(200);

      expect(masteryResponse.body.success).toBe(true);
      expect(masteryResponse.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /games/:id/submit', () => {
    it('should reject submission with missing structural template keys', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          // missing 'blocks', 'connections', 'output_node'
          time_seconds: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_SUBMISSION');
    });

    it('should accept valid submission and record game attempt successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          blocks: ['let age', '=', '42'],
          connections: [],
          output_node: '42',
          time_seconds: 15,
          hints_used: 0
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.xp_earned).toBeDefined();
    });

    it('should grade type_sorter game submissions (success and fail)', async () => {
      // 1. Fail submission (incorrect matches)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${typeSorterGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          matches: { val1: 'int', val2: 'int' },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.success).toBe(true);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success submission
      const passRes = await request(app.getHttpServer())
        .post(`/games/${typeSorterGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          matches: { val1: 'number', val2: 'boolean' },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade echo_chamber game submissions', async () => {
      const passRes = await request(app.getHttpServer())
        .post(`/games/${echoChamberGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          output_matches: { p1: 'Val: 10' },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade switchboard game submissions', async () => {
      const passRes = await request(app.getHttpServer())
        .post(`/games/${switchboardGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          routes: { '1': 'case 1' },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade factory_line game submissions (success and fail)', async () => {
      // 1. Fail (wrong bounds)
      const failRes1 = await request(app.getHttpServer())
        .post(`/games/${factoryLineGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          loop_config: { start: 0, end: 4, step: 1 },
          actions: ['retrieve', 'paint'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes1.body.data.passed).toBe(false);

      // 2. Fail (wrong action order)
      const failRes2 = await request(app.getHttpServer())
        .post(`/games/${factoryLineGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          loop_config: { start: 0, end: 5, step: 1 },
          actions: ['paint', 'retrieve'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes2.body.data.passed).toBe(false);

      // 3. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${factoryLineGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          loop_config: { start: 0, end: 5, step: 1 },
          actions: ['retrieve', 'paint'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade function_workshop game submissions (success and fail)', async () => {
      // 1. Fail (wrong name)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${functionWorkshopGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          name: 'wrongName',
          params: [
            { name: 'principal', type: 'number' },
            { name: 'rate', type: 'number' }
          ],
          return_type: 'number',
          body: ['multiply', 'return'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${functionWorkshopGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          name: 'calculateInterest',
          params: [
            { name: 'principal', type: 'number' },
            { name: 'rate', type: 'number' }
          ],
          return_type: 'number',
          body: ['multiply', 'return'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade black_box_factory game submissions (success and fail)', async () => {
      // 1. Fail (wrong operations)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${blackBoxFactoryGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          operations: ['multiply_2', 'add_5'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${blackBoxFactoryGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          operations: ['multiply_2', 'add_1'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade mirror_halls game submissions (success and fail)', async () => {
      // 1. Fail (wrong reduction)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${mirrorHallsGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          base_condition: 'n === 0',
          base_return: '1',
          reduction_arg: 'n - 2',
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${mirrorHallsGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          base_condition: 'n === 0',
          base_return: '1',
          reduction_arg: 'n - 1',
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade bug_hunt game submissions (success and fail)', async () => {
      // 1. Fail (wrong buggy line)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${bugHuntGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          buggy_line: 4,
          variable_traces: {},
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${bugHuntGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          buggy_line: 3,
          variable_traces: {},
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade object_foundry game submissions (success and fail)', async () => {
      // 1. Fail (wrong instantiation args)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${objectFoundryGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          attributes: [
            { name: 'color', type: 'string' },
            { name: 'price', type: 'number' }
          ],
          instantiations: [
            { args: ['red', '15000'] },
            { args: ['blue', '24000'] } // wrong price
          ],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${objectFoundryGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          attributes: [
            { name: 'color', type: 'string' },
            { name: 'price', type: 'number' }
          ],
          instantiations: [
            { args: ['red', '15000'] },
            { args: ['blue', '25000'] }
          ],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade wire_register game submissions (success and fail)', async () => {
      // 1. Fail (direct copy without register / dereference)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${wireRegisterGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          connections: [{ from: 'INPUT', to: 'OUTPUT_A' }],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${wireRegisterGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          connections: [
            { from: 'INPUT', to: 'SP' },
            { from: 'RAM[SP]', to: 'OUTPUT_A' }
          ],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade heap_heist game submissions (success and fail)', async () => {
      // 1. Fail (no deallocations freed)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${heapHeistGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          allocations: [
            { pointer: 'ptr1', heap_address: '0x2000' },
            { pointer: 'ptr2', heap_address: '0x2000' }
          ],
          freed: [],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${heapHeistGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          allocations: [
            { pointer: 'ptr1', heap_address: '0x2000' },
            { pointer: 'ptr2', heap_address: '0x2000' }
          ],
          freed: ['0x2000'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade test_case_tower game submissions (success and fail)', async () => {
      // 1. Fail (insufficient coverage - only 1 branch)
      const failRes1 = await request(app.getHttpServer())
        .post(`/games/${testCaseTowerGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          test_cases: [{ x: 5, y: 2 }],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes1.body.data.passed).toBe(false);
      expect(failRes1.body.data.score).toBe(0.2);

      // 2. Fail (too many test cases)
      const failRes2 = await request(app.getHttpServer())
        .post(`/games/${testCaseTowerGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          test_cases: [
            { x: 5, y: 2 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 10, y: 1 }
          ],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes2.body.data.passed).toBe(false);
      expect(failRes2.body.data.score).toBe(0.2);

      // 3. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${testCaseTowerGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          test_cases: [
            { x: 5, y: 2 },
            { x: 0, y: 0 },
            { x: -1, y: 0 }
          ],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade constructor_chain game submissions (success and fail)', async () => {
      // 1. Fail (wrong order sequence)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${constructorChainGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          chain: ['this_maxSpeed', 'super'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${constructorChainGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          chain: ['super', 'this_maxSpeed'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade shape_shifter_arena game submissions (success and fail)', async () => {
      // 1. Fail (wrong assignments)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${shapeShifterArenaGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          assignments: { slot1: 'Warrior', slot2: 'Archer' },
          calls: ['slot1.attack()', 'slot2.attack()'],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${shapeShifterArenaGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          assignments: { slot1: 'Mage', slot2: 'Archer' },
          calls: ['slot1.attack()', 'slot2.attack()'],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade vault_keeper game submissions (success and fail)', async () => {
      // 1. Fail (wrong access modifiers and violations)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${vaultKeeperGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          modifiers: { secretCode: 'public', bankBalance: 'private', ownerName: 'public' },
          access: { secretCode: 'hidden', bankBalance: 'readonly', ownerName: 'readwrite' },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${vaultKeeperGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          modifiers: {
            secretCode: 'private',
            bankBalance: 'private',
            ownerName: 'public',
            getSecretCode: 'private',
            deposit: 'public',
            withdraw: 'public'
          },
          access: {
            secretCode: 'hidden',
            bankBalance: 'readonly',
            ownerName: 'readwrite'
          },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade interface_bridge game submissions (success and fail)', async () => {
      // 1. Fail (incorrect mappings)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${interfaceBridgeGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          mappings: { Car: ["Drivable"], Airplane: ["Drivable"] },
          methods: { Car: ["drive"], Airplane: ["drive", "fly"] },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${interfaceBridgeGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          mappings: { Car: ["Drivable"], Airplane: ["Drivable", "Flyable"] },
          methods: { Car: ["drive"], Airplane: ["drive", "fly"] },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade assembly_yard game submissions (success and fail)', async () => {
      // 1. Fail (wrong relationship types)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${assemblyYardGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          relationships: { Engine: "aggregation", Wheel: "composition", Driver: "aggregation", NavigationService: "dependency" },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${assemblyYardGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          relationships: { Engine: "composition", Wheel: "composition", Driver: "aggregation", NavigationService: "dependency" },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade pattern_forge game submissions (success and fail)', async () => {
      // 1. Fail (incorrect role assignment)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${patternForgeGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          roles: { PaymentProcessor: "ConcreteStrategy", IPaymentStrategy: "StrategyInterface", CreditCardPayment: "ConcreteStrategy", PayPalPayment: "ConcreteStrategy" },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${patternForgeGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          roles: { PaymentProcessor: "Context", IPaymentStrategy: "StrategyInterface", CreditCardPayment: "ConcreteStrategy", PayPalPayment: "ConcreteStrategy" },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade solid_foundations game submissions (success and fail)', async () => {
      // 1. Fail (incorrect violation mappings)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${solidFoundationsGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          violations: { snippet_s: "OCP", snippet_o: "OCP", snippet_l: "LSP", snippet_i: "ISP", snippet_d: "DIP" },
          resolutions: { snippet_s: "res_s", snippet_o: "res_o", snippet_l: "res_l", snippet_i: "res_i", snippet_d: "res_d" },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${solidFoundationsGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          violations: { snippet_s: "SRP", snippet_o: "OCP", snippet_l: "LSP", snippet_i: "ISP", snippet_d: "DIP" },
          resolutions: { snippet_s: "res_s", snippet_o: "res_o", snippet_l: "res_l", snippet_i: "res_i", snippet_d: "res_d" },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade refactor_run game submissions (success and fail)', async () => {
      // 1. Fail (wrong sequence order)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${refactorRunGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          actions: ["extract_method", "replace_magic_numbers", "rename_variables"],
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${refactorRunGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          actions: ["replace_magic_numbers", "extract_method", "rename_variables"],
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });

    it('should grade code_review_court game submissions (success and fail)', async () => {
      // 1. Fail (incorrect reviews)
      const failRes = await request(app.getHttpServer())
        .post(`/games/${codeReviewCourtGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          reviews: { line1: "correct_code", line2: "style_violation", line3: "performance_issue", line4: "correct_code" },
          time_seconds: 10
        })
        .expect(201);
      expect(failRes.body.data.passed).toBe(false);
      expect(failRes.body.data.score).toBe(0.2);

      // 2. Success
      const passRes = await request(app.getHttpServer())
        .post(`/games/${codeReviewCourtGameId}/submit`)
        .set('Cookie', studentCookie)
        .send({
          reviews: { line1: "security_flaw", line2: "style_violation", line3: "performance_issue", line4: "correct_code" },
          time_seconds: 10
        })
        .expect(201);
      expect(passRes.body.success).toBe(true);
      expect(passRes.body.data.passed).toBe(true);
      expect(passRes.body.data.score).toBe(1.0);
    });
  });

  describe('Boss Session (e2e)', () => {
    it('should walk through the multi-level boss session flow successfully', async () => {
      // 1. Start session
      const startRes = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/start`)
        .set('Cookie', studentCookie)
        .expect(201);

      expect(startRes.body.success).toBe(true);
      expect(startRes.body.data.lives).toBe(3);
      expect(startRes.body.data.currentLevel).toBe(1);
      expect(startRes.body.data.level1.questions).toHaveLength(5);

      // 2. Get status
      const statusRes = await request(app.getHttpServer())
        .get(`/boss/${bossId}/session/status`)
        .set('Cookie', studentCookie)
        .expect(200);

      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.data.lives).toBe(3);
      expect(statusRes.body.data.currentLevel).toBe(1);

      // 3. Submit incorrect Level 1 answers
      const incorrectL1Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'incorrect' }
          ]
        })
        .expect(201);

      expect(incorrectL1Res.body.success).toBe(true);
      expect(incorrectL1Res.body.data.success).toBe(false);
      expect(incorrectL1Res.body.data.lives).toBe(2);
      expect(incorrectL1Res.body.data.currentLevel).toBe(1);

      // 4. Submit correct Level 1 answers
      const correctL1Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'const' },
            { question_id: 'q2', answer: 'A' },
            { question_id: 'q3', answer: 'A' },
            { question_id: 'q4', answer: 'A' },
            { question_id: 'q5', answer: 'A' }
          ]
        })
        .expect(201);

      expect(correctL1Res.body.success).toBe(true);
      expect(correctL1Res.body.data.success).toBe(true);
      expect(correctL1Res.body.data.currentLevel).toBe(2);

      // 5. Submit incorrect Level 2 matched pairs
      const incorrectL2Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          matchedPairs: [
            { left: 'int', right: 'floating point' }
          ]
        })
        .expect(201);

      expect(incorrectL2Res.body.success).toBe(true);
      expect(incorrectL2Res.body.data.success).toBe(false);
      expect(incorrectL2Res.body.data.lives).toBe(1);
      expect(incorrectL2Res.body.data.currentLevel).toBe(2);

      // 6. Submit correct Level 2 matched pairs
      const correctL2Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          matchedPairs: [
            { left: 'int', right: 'integer' },
            { left: 'float', right: 'floating point' }
          ]
        })
        .expect(201);

      expect(correctL2Res.body.success).toBe(true);
      expect(correctL2Res.body.data.success).toBe(true);
      expect(correctL2Res.body.data.currentLevel).toBe(3);

      // 7. Submit failing Level 3 code
      const failL3Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          code: 'fail_code',
          language: 'JAVASCRIPT',
          timeSeconds: 10
        })
        .expect(201);

      expect(failL3Res.body.success).toBe(true);
      expect(failL3Res.body.data.success).toBe(false);
      expect(failL3Res.body.data.lives).toBe(0);
      expect(failL3Res.body.data.reset).toBe(true); // reset to L1 because lives hit 0

      // 8. Re-start and pass Level 3 code
      await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/start`)
        .set('Cookie', studentCookie)
        .expect(201);

      // Bypass L1 and L2 using state manipulation or direct submission
      await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          answers: [
            { question_id: 'q1', answer: 'const' },
            { question_id: 'q2', answer: 'A' },
            { question_id: 'q3', answer: 'A' },
            { question_id: 'q4', answer: 'A' },
            { question_id: 'q5', answer: 'A' }
          ]
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          matchedPairs: [
            { left: 'int', right: 'integer' },
            { left: 'float', right: 'floating point' }
          ]
        })
        .expect(201);

      // Pass Level 3 code
      const passL3Res = await request(app.getHttpServer())
        .post(`/boss/${bossId}/session/submit`)
        .set('Cookie', studentCookie)
        .send({
          code: 'function doubleValue(x) { return x * 2; }',
          language: 'JAVASCRIPT',
          timeSeconds: 30
        })
        .expect(201);

      expect(passL3Res.body.success).toBe(true);
      expect(passL3Res.body.data.success).toBe(true);
      expect(passL3Res.body.data.passed).toBe(true);
      expect(passL3Res.body.data.xp_earned).toBe(100);
      expect(passL3Res.body.data.badge_earned).toBeDefined();
    });
  });
});
