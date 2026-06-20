import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Clean existing database contents
  await prisma.userBadge.deleteMany({});
  await prisma.bossAttempt.deleteMany({});
  await prisma.gameAttempt.deleteMany({});
  await prisma.examAttempt.deleteMany({});
  await prisma.userWorldProgress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.bossBattle.deleteMany({});
  await prisma.world.deleteMany({});
  await prisma.badge.deleteMany({});

  console.log('Cleared existing learning content.');

  // 2. Seed Badges for Modules 1-13
  const badgeMap: Record<string, any> = {};
  const badgeData = [
    { key: 'variables', name: 'Variables Mastery Badge', desc: 'Mastered variables, types, and expressions.' },
    { key: 'io', name: 'I/O & Flow Insignia', desc: 'Mastered inputs, outputs, and format streams.' },
    { key: 'conditionals', name: 'Decision Making Crest', desc: 'Mastered execution paths and logic branches.' },
    { key: 'loops', name: 'Loops & Iteration Medallion', desc: 'Mastered repetitions, breaks, and iterations.' },
    { key: 'functions', name: 'Functions Crest', desc: 'Mastered reuse, parameters, and modular layouts.' },
    { key: 'recursion', name: 'Recursion Relic', desc: 'Mastered stack frames and recursion logic.' },
    { key: 'memory', name: 'Memory & Internals Relic', desc: 'Mastered stack/heap and pointers.' },
    { key: 'debugging', name: 'Debugging & Testing Medallion', desc: 'Mastered unit tests and dry runs.' },
    { key: 'classes', name: 'Classes & Objects Badge', desc: 'Mastered attributes, constructors, and lifecycles.' },
    { key: 'oop-principles', name: 'Core OOP Badge', desc: 'Mastered encapsulation, inheritance, and polymorphism.' },
    { key: 'oop-relations', name: 'Advanced OOP Badge', desc: 'Mastered composition and aggregations.' },
    { key: 'design-patterns', name: 'SOLID Patterns Crest', desc: 'Mastered SOLID and design patterns.' },
    { key: 'real-world-swe', name: 'SWE Capstone Insignia', desc: 'Mastered version control, code review, and refactoring.' }
  ];

  for (const b of badgeData) {
    const badge = await prisma.badge.create({
      data: {
        name: b.name,
        description: b.desc,
        imageUrl: `https://skillforge.app/badges/${b.key}.png`,
        rarity: b.key === 'recursion' || b.key === 'memory' ? 'epic' : 'common',
      }
    });
    badgeMap[b.key] = badge;
  }

  console.log('Seeded Badges.');

  // 3. Seed Worlds (13 Part 1 Modules)
  const variablesWorld = await prisma.world.create({
    data: {
      name: 'Variables, Data Types & Operators',
      slug: 'variables-operators',
      description: 'Master variables, constants, data types, type conversions, and expressions.',
      orderIndex: 1,
      status: 'published',
      xpReward: 200,
      unlockCriteria: {},
    },
  });

  const ioWorld = await prisma.world.create({
    data: {
      name: 'Input, Output & Program Flow',
      slug: 'io-program-flow',
      description: 'Learn stream reading/writing, output formatting, execution flow, and execution lifecycle.',
      orderIndex: 2,
      status: 'published',
      xpReward: 250,
      unlockCriteria: {
        required_topics: [{ topic_id: 'variables', min_mastery: 0.6 }],
      },
    },
  });

  const conditionsWorld = await prisma.world.create({
    data: {
      name: 'Decision Making',
      slug: 'decision-making',
      description: 'Direct logic execution using if-else ladders, nested conditionals, and switch-case blocks.',
      orderIndex: 3,
      status: 'published',
      xpReward: 300,
      unlockCriteria: {
        required_topics: [{ topic_id: 'io-flow', min_mastery: 0.6 }],
      },
    },
  });

  const loopsWorld = await prisma.world.create({
    data: {
      name: 'Loops & Iteration',
      slug: 'loops-iteration',
      description: 'Master repetitive execution, nested loops, break/continue statements, and loop optimizations.',
      orderIndex: 4,
      status: 'published',
      xpReward: 350,
      unlockCriteria: {
        required_topics: [{ topic_id: 'conditionals', min_mastery: 0.6 }],
      },
    },
  });

  const functionsWorld = await prisma.world.create({
    data: {
      name: 'Functions & Modular Programming',
      slug: 'functions-modular',
      description: 'Explore functional parameter passing, scopes, lifetimes, and return declarations.',
      orderIndex: 5,
      status: 'published',
      xpReward: 400,
      unlockCriteria: {
        required_topics: [{ topic_id: 'loops', min_mastery: 0.6 }],
      },
    },
  });

  const recursionWorld = await prisma.world.create({
    data: {
      name: 'Recursion & Advanced Thinking',
      slug: 'recursion-advanced',
      description: 'Master base cases, call stack mechanics, recursive traces, and backtracking.',
      orderIndex: 6,
      status: 'published',
      xpReward: 400,
      unlockCriteria: {
        required_topics: [{ topic_id: 'functions', min_mastery: 0.6 }],
      },
    },
  });

  const memoryWorld = await prisma.world.create({
    data: {
      name: 'Memory & Program Internals',
      slug: 'memory-internals',
      description: 'Learn memory layout, stack vs heap allocation, pointers, and manual reference management.',
      orderIndex: 7,
      status: 'published',
      xpReward: 500,
      unlockCriteria: {
        required_topics: [{ topic_id: 'recursion', min_mastery: 0.6 }],
      },
    },
  });

  const debugWorld = await prisma.world.create({
    data: {
      name: 'Debugging, Testing & Complexity',
      slug: 'debugging-testing',
      description: 'Master tracing, breakpoint analysis, exception handling, and time/space complexity.',
      orderIndex: 8,
      status: 'published',
      xpReward: 400,
      unlockCriteria: {
        required_topics: [{ topic_id: 'memory', min_mastery: 0.6 }],
      },
    },
  });

  const classesWorld = await prisma.world.create({
    data: {
      name: 'Classes, Objects & Constructors',
      slug: 'classes-objects',
      description: 'Learn standard object-oriented design, constructors, destructors, and lifecycles.',
      orderIndex: 9,
      status: 'published',
      xpReward: 450,
      unlockCriteria: {
        required_topics: [{ topic_id: 'debugging', min_mastery: 0.6 }],
      },
    },
  });

  const oopPrinciplesWorld = await prisma.world.create({
    data: {
      name: 'Core OOP Principles',
      slug: 'core-oop-principles',
      description: 'Master encapsulation, inheritance, polymorphism, and interface abstraction.',
      orderIndex: 10,
      status: 'published',
      xpReward: 500,
      unlockCriteria: {
        required_topics: [{ topic_id: 'classes-objects', min_mastery: 0.6 }],
      },
    },
  });

  const oopRelationsWorld = await prisma.world.create({
    data: {
      name: 'Advanced OOP Relationships',
      slug: 'advanced-oop-relationships',
      description: 'Learn composition, aggregation, associations, and dependency layouts.',
      orderIndex: 11,
      status: 'published',
      xpReward: 500,
      unlockCriteria: {
        required_topics: [{ topic_id: 'oop-principles', min_mastery: 0.6 }],
      },
    },
  });

  const designPatternsWorld = await prisma.world.create({
    data: {
      name: 'Design Patterns & Software Design',
      slug: 'design-patterns-software',
      description: 'Master SOLID principles, dependency injection, and clean coding practices.',
      orderIndex: 12,
      status: 'published',
      xpReward: 550,
      unlockCriteria: {
        required_topics: [{ topic_id: 'advanced-oop', min_mastery: 0.6 }],
      },
    },
  });

  const sweWorld = await prisma.world.create({
    data: {
      name: 'Real-World Software Engineering',
      slug: 'real-world-swe',
      description: 'Explore code reviews, maintenance structures, refactoring, and version controls.',
      orderIndex: 13,
      status: 'published',
      xpReward: 600,
      unlockCriteria: {
        required_topics: [{ topic_id: 'design-patterns', min_mastery: 0.6 }],
      },
    },
  });

  console.log('Seeded 13 Worlds.');

  // 4. Seed Lessons (Programmatic loop for all 5 language tracks)
  const languages: ('C' | 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT')[] = ['C', 'CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT'];

  const worldLessonsMap = [
    {
      world: variablesWorld,
      lessons: [
        { title: 'Introduction to Variables', topicTags: ['variables', 'data-types'] },
        { title: 'Primitive Data Types', topicTags: ['data-types'] },
        { title: 'Variable Declaration & Initialization', topicTags: ['variables'] },
        { title: 'Constant Variables', topicTags: ['variables'] },
        { title: 'Variables Scope', topicTags: ['variables', 'scope'] },
      ]
    },
    {
      world: ioWorld,
      lessons: [
        { title: 'Console Output Streams', topicTags: ['io-flow'] },
        { title: 'Reading User Input', topicTags: ['io-flow'] },
        { title: 'Formatting Output Streams', topicTags: ['io-flow'] },
        { title: 'Program Lifecycle', topicTags: ['io-flow'] },
      ]
    },
    {
      world: conditionsWorld,
      lessons: [
        { title: 'Decision Making with If-Else', topicTags: ['conditionals'] },
        { title: 'The Switch Statement', topicTags: ['conditionals'] },
        { title: 'Nested If-Else Blocks', topicTags: ['conditionals'] },
        { title: 'Boolean Operators & logic', topicTags: ['conditionals', 'logic'] },
        { title: 'Ternary Operator', topicTags: ['conditionals'] },
      ]
    },
    {
      world: loopsWorld,
      lessons: [
        { title: 'Loops: For & While', topicTags: ['loops'] },
        { title: 'Nested Loops', topicTags: ['loops'] },
        { title: 'Do-While Loop Structure', topicTags: ['loops'] },
        { title: 'Loop Control: break & continue', topicTags: ['loops'] },
        { title: 'Infinite Loops and termination', topicTags: ['loops'] },
      ]
    },
    {
      world: functionsWorld,
      lessons: [{ title: 'Introduction to Functions', topicTags: ['functions'] }]
    },
    {
      world: recursionWorld,
      lessons: [{ title: 'Introduction to Recursion', topicTags: ['recursion'] }]
    },
    {
      world: memoryWorld,
      lessons: [{ title: 'Introduction to Memory', topicTags: ['memory'] }]
    },
    {
      world: debugWorld,
      lessons: [{ title: 'Introduction to Debugging', topicTags: ['debugging'] }]
    },
    {
      world: classesWorld,
      lessons: [{ title: 'Introduction to Classes', topicTags: ['classes'] }]
    },
    {
      world: oopPrinciplesWorld,
      lessons: [{ title: 'Introduction to OOP Principles', topicTags: ['oop-principles'] }]
    },
    {
      world: oopRelationsWorld,
      lessons: [{ title: 'Introduction to OOP Relations', topicTags: ['advanced-oop'] }]
    },
    {
      world: designPatternsWorld,
      lessons: [{ title: 'Introduction to Design Patterns', topicTags: ['design-patterns'] }]
    },
    {
      world: sweWorld,
      lessons: [{ title: 'Introduction to Real-World SWE', topicTags: ['real-world-swe'] }]
    }
  ];

  for (const item of worldLessonsMap) {
    for (const lang of languages) {
      for (let i = 0; i < item.lessons.length; i++) {
        const l = item.lessons[i]!;
        const content = generateLessonContent(l.title, lang, item.world.slug);
        await prisma.lesson.create({
          data: {
            worldId: item.world.id,
            title: `${l.title} (${lang})`,
            orderIndex: i + 1,
            estimatedMinutes: content.estimated_minutes,
            topicTags: l.topicTags,
            status: 'published',
            languageTrack: lang as any,
            content: content as any,
          }
        });
      }
    }
  }

  console.log('Seeded All Lessons.');

  // 5. Seed Games (Modules 1, 2, 3, 4, 6)
  await prisma.game.createMany({
    data: [
      // Variables (Module 1)
      {
        worldId: variablesWorld.id,
        name: 'Logic Builder: Potion Mixer',
        gameType: 'logic_builder',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          available_blocks: ['declare_variable', 'assign_value', 'print_output'],
        },
      },
      {
        worldId: variablesWorld.id,
        name: 'Data Foundry: Type Sorter',
        gameType: 'type_sorter',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          items: [
            { id: 'val1', value: '42', types: { JAVASCRIPT: 'number', PYTHON: 'int', JAVA: 'int', C: 'int', CPP: 'int' } },
            { id: 'val2', value: '3.14', types: { JAVASCRIPT: 'number', PYTHON: 'float', JAVA: 'double', C: 'float', CPP: 'float' } },
            { id: 'val3', value: '"hello"', types: { JAVASCRIPT: 'string', PYTHON: 'str', JAVA: 'String', C: 'char*', CPP: 'string' } },
            { id: 'val4', value: 'true', types: { JAVASCRIPT: 'boolean', PYTHON: 'bool', JAVA: 'boolean', C: 'bool', CPP: 'bool' } }
          ]
        },
      },
      // Input/Output (Module 2)
      {
        worldId: ioWorld.id,
        name: 'I/O Terminal: Stream Matcher',
        gameType: 'stream_matching',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 75,
        tier: 'free',
        topicTags: ['io-flow'],
        config: {
          available_blocks: ['read_input', 'format_output', 'write_stdout'],
        },
      },
      {
        worldId: ioWorld.id,
        name: 'Terminal Echo: Stream Format',
        gameType: 'echo_chamber',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 75,
        tier: 'free',
        topicTags: ['io-flow'],
        config: {
          puzzles: {
            JAVASCRIPT: [
              { id: 'p1', statement: 'console.log(`Val: ${10}`);', output: 'Val: 10' },
              { id: 'p2', statement: 'console.log(`Val: ${3.14.toFixed(1)}`);', output: 'Val: 3.1' }
            ],
            PYTHON: [
              { id: 'p1', statement: 'print(f"Val: {10}")', output: 'Val: 10' },
              { id: 'p2', statement: 'print(f"Val: {3.14:.1f}")', output: 'Val: 3.1' }
            ],
            JAVA: [
              { id: 'p1', statement: 'System.out.printf("Val: %d\\n", 10);', output: 'Val: 10' },
              { id: 'p2', statement: 'System.out.printf("Val: %.1f\\n", 3.14);', output: 'Val: 3.1' }
            ],
            C: [
              { id: 'p1', statement: 'printf("Val: %d\\n", 10);', output: 'Val: 10' },
              { id: 'p2', statement: 'printf("Val: %.1f\\n", 3.14);', output: 'Val: 3.1' }
            ],
            CPP: [
              { id: 'p1', statement: 'std::cout << "Val: " << 10 << std::endl;', output: 'Val: 10' },
              { id: 'p2', statement: 'std::cout << "Val: " << std::fixed << std::setprecision(1) << 3.14 << std::endl;', output: 'Val: 3.1' }
            ]
          }
        },
      },
      // Decision Making (Module 3)
      {
        worldId: conditionsWorld.id,
        name: 'If-Else Valley Sorting Hat',
        gameType: 'ifelse_constructor',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['conditionals'],
        config: {
          puzzles: [
            {
              id: 'cond_puzzle_1',
              question: 'Complete the condition to test if age is adult.',
              template: 'if (age >= ?)',
              answer: '18',
            },
          ],
        },
      },
      {
        worldId: conditionsWorld.id,
        name: 'Logical Gate: Switchboard Route',
        gameType: 'switchboard',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['conditionals'],
        config: {
          inputs: [
            { value: '1', target: 'case 1' },
            { value: '2', target: 'case 2' },
            { value: '5', target: 'default' }
          ]
        },
      },
      // Loops (Module 4)
      {
        worldId: loopsWorld.id,
        name: 'Loop Forest Collector',
        gameType: 'loop_builder',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['loops'],
        config: {
          puzzles: [
            {
              id: 'loop_puzzle_1',
              question: 'Write a loop that prints numbers from 0 to 9.',
              template: 'for (let i = 0; i < ?; i++)',
              answer: '10',
            },
          ],
        },
      },
      {
        worldId: loopsWorld.id,
        name: 'Assembly Belt: Loop Factory',
        gameType: 'factory_line',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['loops'],
        config: {
          expected_iterations: 5,
          expected_actions: ['retrieve', 'paint', 'package']
        },
      },
      // Recursion (Module 6)
      {
        worldId: recursionWorld.id,
        name: 'Recursion Maze: Factorial Escape',
        gameType: 'recursion_maze',
        orderIndex: 1,
        masteryContribution: 0.4,
        xpReward: 100,
        tier: 'free',
        topicTags: ['recursion'],
        config: {
          puzzles: [
            { id: 'rec_puzzle_1', question: 'What does factorial(0) return?', answer: '1' }
          ]
        },
      },
      // Module 5: Functions & Modular Programming
      {
        worldId: functionsWorld.id,
        name: 'Data Forge: Function Workshop',
        gameType: 'function_workshop',
        orderIndex: 1,
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
      },
      {
        worldId: functionsWorld.id,
        name: 'Logical Factory: Black Box Operator',
        gameType: 'black_box_factory',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['functions'],
        config: {
          inputs: [2, 5, 10],
          outputs: [5, 11, 21],
          expected_operations: ['multiply_2', 'add_1']
        }
      },
      // Module 6: Recursion Game 2
      {
        worldId: recursionWorld.id,
        name: 'Mirror Halls: Reflector Recursion',
        gameType: 'mirror_halls',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 85,
        tier: 'free',
        topicTags: ['recursion'],
        config: {
          expected_base_condition: 'n === 0',
          expected_base_return: '1',
          expected_reduction_arg: 'n - 1'
        }
      },
      // Module 8: Debugging, Testing & Complexity
      {
        worldId: debugWorld.id,
        name: 'The Grid: Bug Hunt',
        gameType: 'bug_hunt',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['debugging'],
        config: {
          puzzles: {
            JAVASCRIPT: {
              code: "function findMax(arr) {\n  let max = arr[0];\n  for (let i = 0; i <= arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}",
              buggy_line: 3
            },
            PYTHON: {
              code: "def find_max(arr):\n    max_val = arr[0]\n    for i in range(0, len(arr) + 1):\n        if arr[i] > max_val:\n            max_val = arr[i]\n    return max_val",
              buggy_line: 3
            },
            JAVA: {
              code: "public static int findMax(int[] arr) {\n    int max = arr[0];\n    for (int i = 0; i <= arr.length; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}",
              buggy_line: 3
            },
            C: {
              code: "int findMax(int arr[], int n) {\n    int max = arr[0];\n    for (int i = 0; i <= n; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}",
              buggy_line: 3
            },
            CPP: {
              code: "int findMax(const vector<int>& arr) {\n    int max = arr[0];\n    for (int i = 0; i <= arr.size(); i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}",
              buggy_line: 3
            }
          }
        }
      },
      // Module 9: Classes & Objects
      {
        worldId: classesWorld.id,
        name: 'Structure Foundry: Object Builder',
        gameType: 'object_foundry',
        orderIndex: 1,
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
      },
      // Module 7: Memory & Internals
      {
        worldId: memoryWorld.id,
        name: 'Wire & Register: Pointer Link',
        gameType: 'wire_register',
        orderIndex: 1,
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
      },
      {
        worldId: memoryWorld.id,
        name: 'Heap Heist: Leak Collector',
        gameType: 'heap_heist',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 85,
        tier: 'free',
        topicTags: ['memory'],
        config: {
          code_sequence: [
            "int* ptr1 = malloc(sizeof(int)); // Allocates Block A at 0x1000",
            "int* ptr2 = malloc(sizeof(int)); // Allocates Block B at 0x2000",
            "ptr1 = ptr2; // ptr1 now points to Block B. Block A is leaked!",
            "free(ptr2); // Deallocate Block B at 0x2000"
          ],
          expected_allocations: [
            { pointer: "ptr1", heap_address: "0x2000" },
            { pointer: "ptr2", heap_address: "0x2000" }
          ],
          expected_freed: ["0x2000"]
        }
      },
      // Module 8: Debugging & Testing
      {
        worldId: debugWorld.id,
        name: 'Test Case Tower: Coverage Builder',
        gameType: 'test_case_tower',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['debugging'],
        config: {
          code_snippet: "function process(x, y) {\n  if (x > 0 && y < 5) {\n    return 'Branch A';\n  } else if (x === 0) {\n    return 'Branch B';\n  } else {\n    return 'Branch C';\n  }\n}",
          branches: ["Branch A", "Branch B", "Branch C"],
          max_test_cases: 3
        }
      },
      // Module 9: Classes & Objects
      {
        worldId: classesWorld.id,
        name: 'Constructor Chain: Initializer',
        gameType: 'constructor_chain',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['classes'],
        config: {
          target_desc: "Construct a SportsCar with color 'red', price 50000, and maxSpeed 200",
          expected_chain: ["super", "this_maxSpeed"]
        }
      },
      // Module 10: Core OOP Principles
      {
        worldId: oopPrinciplesWorld.id,
        name: 'Polymorph: Shape Shifter Arena',
        gameType: 'shape_shifter_arena',
        orderIndex: 1,
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
      },
      {
        worldId: oopPrinciplesWorld.id,
        name: 'Vault Keeper: Access Control',
        gameType: 'vault_keeper',
        orderIndex: 2,
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
      },
      // Module 11: Advanced OOP Relationships
      {
        worldId: oopRelationsWorld.id,
        name: 'Interface Bridge: Contracts',
        gameType: 'interface_bridge',
        orderIndex: 1,
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
      },
      {
        worldId: oopRelationsWorld.id,
        name: 'Assembly Yard: Composition',
        gameType: 'assembly_yard',
        orderIndex: 2,
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
      },
      // Module 12: Design Patterns & Software Design
      {
        worldId: designPatternsWorld.id,
        name: 'Pattern Forge: Strategy',
        gameType: 'pattern_forge',
        orderIndex: 1,
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
      },
      {
        worldId: designPatternsWorld.id,
        name: 'SOLID Foundations: Design',
        gameType: 'solid_foundations',
        orderIndex: 2,
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
      },
      // Module 13: Real-World Software Engineering
      {
        worldId: sweWorld.id,
        name: 'Refactor Run: Cleanup',
        gameType: 'refactor_run',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 90,
        tier: 'free',
        topicTags: ['real-world-swe'],
        config: {
          expected_sequence: ["replace_magic_numbers", "extract_method", "rename_variables"]
        }
      },
      {
        worldId: sweWorld.id,
        name: 'Code Review Court: PR Review',
        gameType: 'code_review_court',
        orderIndex: 2,
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
    ],
  });

  console.log('Seeded Games.');

  // 6. Seed 3-Level Boss Battles (Modules 1-4)
  // Module 1 Boss: Variables
  const m1BossQuestions = {
    level1: {
      type: "quiz",
      questions: [
        {
          id: "m1_q1",
          text: "Which keyword defines a variable that cannot be reassigned?",
          options: ["let", "var", "const", "set"],
          correctAnswer: "const",
          topic: "variables"
        },
        {
          id: "m1_q2",
          text: "What is the primary difference between a constant and a variable?",
          options: ["Constants use more memory", "Constants cannot be changed after assignment", "Variables cannot be local", "Variables are slower"],
          correctAnswer: "Constants cannot be changed after assignment",
          topic: "variables"
        },
        {
          id: "m1_q3",
          text: "What type does the literal 42 represent in most languages?",
          options: ["Float", "String", "Integer", "Boolean"],
          correctAnswer: "Integer",
          topic: "data-types"
        },
        {
          id: "m1_q4",
          text: "Which operator represents assignment?",
          options: ["==", "=", "===", "=>"],
          correctAnswer: "=",
          topic: "variables"
        },
        {
          id: "m1_q5",
          text: "What is the result of the expression 5 + 3 * 2 (using standard precedence)?",
          options: ["16", "11", "13", "10"],
          correctAnswer: "11",
          topic: "operators"
        }
      ]
    },
    level2: {
      type: "matching",
      prompt: "Match the operators with their correct definitions",
      pairs: [
        { left: "&&", right: "Logical AND" },
        { left: "||", right: "Logical OR" },
        { left: "!", right: "Logical NOT" },
        { left: "%", right: "Modulo / Remainder" }
      ]
    },
    level3: {
      type: "boss_fight",
      monster: { name: "Syntax Golem", maxHp: 100 },
      challenges: {
        C: {
          prompt: "Write a complete C function `int square(int n)` that returns the square of `n`.",
          starterCode: "int square(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "3", output: "9\n" },
            { input: "5", output: "25\n" },
            { input: "-2", output: "4\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*n"
        },
        CPP: {
          prompt: "Write a complete C++ function `int square(int n)` that returns the square of `n`.",
          starterCode: "int square(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "3", output: "9\n" },
            { input: "5", output: "25\n" },
            { input: "-2", output: "4\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*n"
        },
        JAVA: {
          prompt: "Write a Java method `public static int square(int n)` inside class Solution that returns the square of `n`.",
          starterCode: "public class Solution {\n    public static int square(int n) {\n        // Write your code here\n    }\n}",
          testCases: [
            { input: "3", output: "9\n" },
            { input: "5", output: "25\n" },
            { input: "-2", output: "4\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*n"
        },
        PYTHON: {
          prompt: "Write a Python function `square(n)` that returns the square of `n`.",
          starterCode: "def square(n):\n    # Write your code here\n",
          testCases: [
            { input: "3", output: "9\n" },
            { input: "5", output: "25\n" },
            { input: "-2", output: "4\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*n|return\\s+n\\s*\\*\\*\\s*2"
        },
        JAVASCRIPT: {
          prompt: "Write a JavaScript function `square(n)` that returns the square of `n`.",
          starterCode: "function square(n) {\n    // Write your code here\n}",
          testCases: [
            { input: "3", output: "9\n" },
            { input: "5", output: "25\n" },
            { input: "-2", output: "4\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*n|return\\s+Math\\.pow\\(n,\\s*2\\)"
        }
      }
    }
  };

  await prisma.bossBattle.create({
    data: {
      worldId: variablesWorld.id,
      name: 'Variables Overlord',
      level: 'mini',
      passThreshold: 0.8,
      xpReward: 120,
      badgeId: badgeMap['variables'].id,
      questions: m1BossQuestions as any,
    }
  });

  // Module 2 Boss: I/O & Program Flow
  const m2BossQuestions = {
    level1: {
      type: "quiz",
      questions: [
        {
          id: "m2_q1",
          text: "Which stream handles standard errors in terminal systems?",
          options: ["stdin", "stdout", "stderr", "stdlog"],
          correctAnswer: "stderr",
          topic: "io-flow"
        },
        {
          id: "m2_q2",
          text: "What is the standard purpose of the stdin stream?",
          options: ["Writing data to logs", "Reading user input", "Throwing exceptions", "Compiling variables"],
          correctAnswer: "Reading user input",
          topic: "io-flow"
        },
        {
          id: "m2_q3",
          text: "What escape character represents a new line?",
          options: ["\\t", "\\n", "\\r", "\\b"],
          correctAnswer: "\\n",
          topic: "io-flow"
        },
        {
          id: "m2_q4",
          text: "Which of the following describes the execution flow of a simple console program?",
          options: ["Parallel execution of functions", "Top-down sequential statement execution", "Random jumping of statements", "Bottom-up recursion only"],
          correctAnswer: "Top-down sequential statement execution",
          topic: "io-flow"
        },
        {
          id: "m2_q5",
          text: "What does the exit code 0 typically represent in program termination?",
          options: ["Runtime Error", "Successful Execution", "Memory Stack Overflow", "Undefined Behavior"],
          correctAnswer: "Successful Execution",
          topic: "io-flow"
        }
      ]
    },
    level2: {
      type: "matching",
      prompt: "Match formatting placeholders with correct types",
      pairs: [
        { left: "%d", right: "Integer / Decimal" },
        { left: "%f", right: "Floating Point" },
        { left: "%s", right: "String" },
        { left: "%c", right: "Character" }
      ]
    },
    level3: {
      type: "boss_fight",
      monster: { name: "I/O Overlord", maxHp: 100 },
      challenges: {
        C: {
          prompt: "Write a complete C function `int doubleValue(int n)` that returns the double of `n`.",
          starterCode: "int doubleValue(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "8\n" },
            { input: "-3", output: "-6\n" },
            { input: "0", output: "0\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*2"
        },
        CPP: {
          prompt: "Write a complete C++ function `int doubleValue(int n)` that returns the double of `n`.",
          starterCode: "int doubleValue(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "8\n" },
            { input: "-3", output: "-6\n" },
            { input: "0", output: "0\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*2"
        },
        JAVA: {
          prompt: "Write a Java method `public static int doubleValue(int n)` inside class Solution that returns the double of `n`.",
          starterCode: "public class Solution {\n    public static int doubleValue(int n) {\n        // Write your code here\n    }\n}",
          testCases: [
            { input: "4", output: "8\n" },
            { input: "-3", output: "-6\n" },
            { input: "0", output: "0\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*2"
        },
        PYTHON: {
          prompt: "Write a Python function `doubleValue(n)` that returns the double of `n`.",
          starterCode: "def doubleValue(n):\n    # Write your code here\n",
          testCases: [
            { input: "4", output: "8\n" },
            { input: "-3", output: "-6\n" },
            { input: "0", output: "0\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*2"
        },
        JAVASCRIPT: {
          prompt: "Write a JavaScript function `doubleValue(n)` that returns the double of `n`.",
          starterCode: "function doubleValue(n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "8\n" },
            { input: "-3", output: "-6\n" },
            { input: "0", output: "0\n" }
          ],
          validationRegex: "return\\s+n\\s*\\*\\s*2"
        }
      }
    }
  };

  await prisma.bossBattle.create({
    data: {
      worldId: ioWorld.id,
      name: 'I/O Sentinel',
      level: 'mini',
      passThreshold: 0.8,
      xpReward: 150,
      badgeId: badgeMap['io'].id,
      questions: m2BossQuestions as any,
    }
  });

  // Module 3 Boss: Decision Making
  const m3BossQuestions = {
    level1: {
      type: "quiz",
      questions: [
        {
          id: "m3_q1",
          text: "What structure executes one out of multiple conditions sequentially, stopping at the first match?",
          options: ["nested if", "switch-case", "if-else-if ladder", "while loop"],
          correctAnswer: "if-else-if ladder",
          topic: "conditionals"
        },
        {
          id: "m3_q2",
          text: "Which logical operator represents logical AND?",
          options: ["||", "&&", "!", "=="],
          correctAnswer: "&&",
          topic: "logic"
        },
        {
          id: "m3_q3",
          text: "Which block in a switch-case statement runs when no matching constants are found?",
          options: ["else", "break", "default", "final"],
          correctAnswer: "default",
          topic: "conditionals"
        },
        {
          id: "m3_q4",
          text: "What is the primary feature of a Ternary Operator?",
          options: ["It executes code blocks in parallel", "It provides a shorthand if-else inline evaluation", "It triggers memory allocation", "It terminates programs"],
          correctAnswer: "It provides a shorthand if-else inline evaluation",
          topic: "conditionals"
        },
        {
          id: "m3_q5",
          text: "What happens in a switch block if a 'break' statement is omitted after a matching case?",
          options: ["Compiler throws syntax error", "Execution falls through to the next case", "Program terminates immediately", "Memory overflows"],
          correctAnswer: "Execution falls through to the next case",
          topic: "conditionals"
        }
      ]
    },
    level2: {
      type: "matching",
      prompt: "Match expressions to their boolean outputs (assuming x = 5)",
      pairs: [
        { left: "x > 3 && x < 10", right: "true" },
        { left: "x == 4 || x < 2", right: "false" },
        { left: "!(x > 10)", right: "true" },
        { left: "x != 5", right: "false" }
      ]
    },
    level3: {
      type: "boss_fight",
      monster: { name: "Condition Wizard", maxHp: 100 },
      challenges: {
        C: {
          prompt: "Write a complete C function `int isEven(int n)` that returns 1 if `n` is even and 0 otherwise.",
          starterCode: "int isEven(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "1\n" },
            { input: "7", output: "0\n" },
            { input: "0", output: "1\n" }
          ],
          validationRegex: "return\\s+n\\s*%\\s*2\\s*==\\s*0|return\\s+!\\(n\\s*%\\s*2\\)"
        },
        CPP: {
          prompt: "Write a complete C++ function `bool isEven(int n)` that returns true if `n` is even and false otherwise.",
          starterCode: "bool isEven(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "1\n" },
            { input: "7", output: "0\n" },
            { input: "0", output: "1\n" }
          ],
          validationRegex: "return\\s+n\\s*%\\s*2\\s*==\\s*0|return\\s+!\\(n\\s*%\\s*2\\)"
        },
        JAVA: {
          prompt: "Write a Java method `public static boolean isEven(int n)` inside class Solution that returns true if `n` is even and false otherwise.",
          starterCode: "public class Solution {\n    public static boolean isEven(int n) {\n        // Write your code here\n    }\n}",
          testCases: [
            { input: "4", output: "true\n" },
            { input: "7", output: "false\n" },
            { input: "0", output: "true\n" }
          ],
          validationRegex: "return\\s+n\\s*%\\s*2\\s*==\\s*0|return\\s+!\\(n\\s*%\\s*2\\)"
        },
        PYTHON: {
          prompt: "Write a Python function `isEven(n)` that returns True if `n` is even and False otherwise.",
          starterCode: "def isEven(n):\n    # Write your code here\n",
          testCases: [
            { input: "4", output: "True\n" },
            { input: "7", output: "False\n" },
            { input: "0", output: "True\n" }
          ],
          validationRegex: "return\\s+n\\s*%\\s*2\\s*==\\s*0"
        },
        JAVASCRIPT: {
          prompt: "Write a JavaScript function `isEven(n)` that returns true if `n` is even and false otherwise.",
          starterCode: "function isEven(n) {\n    // Write your code here\n}",
          testCases: [
            { input: "4", output: "true\n" },
            { input: "7", output: "false\n" },
            { input: "0", output: "true\n" }
          ],
          validationRegex: "return\\s+n\\s*%\\s*2\\s*==\\s*0|return\\s+!\\(n\\s*%\\s*2\\)"
        }
      }
    }
  };

  await prisma.bossBattle.create({
    data: {
      worldId: conditionsWorld.id,
      name: 'Valley Arbitrator',
      level: 'mini',
      passThreshold: 0.8,
      xpReward: 200,
      badgeId: badgeMap['conditionals'].id,
      questions: m3BossQuestions as any,
    }
  });

  // Module 4 Boss: Loops & Iteration
  const m4BossQuestions = {
    level1: {
      type: "quiz",
      questions: [
        {
          id: "m4_q1",
          text: "Which statement terminates loop execution immediately and jumps to the statement following the loop?",
          options: ["continue", "exit", "break", "return"],
          correctAnswer: "break",
          topic: "loops"
        },
        {
          id: "m4_q2",
          text: "What structure executes its body first before evaluating the termination condition?",
          options: ["for", "while", "do-while", "nested for"],
          correctAnswer: "do-while",
          topic: "loops"
        },
        {
          id: "m4_q3",
          text: "Which statement skips the current iteration and jumps directly to the loop update expression?",
          options: ["break", "continue", "skip", "pass"],
          correctAnswer: "continue",
          topic: "loops"
        },
        {
          id: "m4_q4",
          text: "What happens when a loop has no update statement or terminating condition?",
          options: ["Compiler syntax error", "Infinite loop iteration", "Immediate stack trace crash", "Variables declaration error"],
          correctAnswer: "Infinite loop iteration",
          topic: "loops"
        },
        {
          id: "m4_q5",
          text: "In nested loops, how does a 'break' statement behave inside the innermost loop?",
          options: ["Terminates all outer loops", "Terminates only the innermost loop", "Crashes the runtime stack", "Skips next function calls"],
          correctAnswer: "Terminates only the innermost loop",
          topic: "loops"
        }
      ]
    },
    level2: {
      type: "matching",
      prompt: "Match loops to their typical iteration styles",
      pairs: [
        { left: "for loop", right: "Counter-controlled iteration" },
        { left: "while loop", right: "Condition-controlled iteration" },
        { left: "do-while", right: "Guaranteed single execution" },
        { left: "infinite loop", right: "Non-terminating iteration" }
      ]
    },
    level3: {
      type: "boss_fight",
      monster: { name: "Loop Sentinel", maxHp: 120 },
      challenges: {
        C: {
          prompt: "Write a complete C function `int sumToN(int n)` that returns the sum of numbers from 1 to `n` using a loop.",
          starterCode: "int sumToN(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "5", output: "15\n" },
            { input: "1", output: "1\n" },
            { input: "10", output: "55\n" }
          ],
          validationRegex: "for|while"
        },
        CPP: {
          prompt: "Write a complete C++ function `int sumToN(int n)` that returns the sum of numbers from 1 to `n` using a loop.",
          starterCode: "int sumToN(int n) {\n    // Write your code here\n}",
          testCases: [
            { input: "5", output: "15\n" },
            { input: "1", output: "1\n" },
            { input: "10", output: "55\n" }
          ],
          validationRegex: "for|while"
        },
        JAVA: {
          prompt: "Write a Java method `public static int sumToN(int n)` inside class Solution that returns the sum of numbers from 1 to `n` using a loop.",
          starterCode: "public class Solution {\n    public static int sumToN(int n) {\n        // Write your code here\n    }\n}",
          testCases: [
            { input: "5", output: "15\n" },
            { input: "1", output: "1\n" },
            { input: "10", output: "55\n" }
          ],
          validationRegex: "for|while"
        },
        PYTHON: {
          prompt: "Write a Python function `sumToN(n)` that returns the sum of numbers from 1 to `n` using a loop.",
          starterCode: "def sumToN(n):\n    # Write your code here\n",
          testCases: [
            { input: "5", output: "15\n" },
            { input: "1", output: "1\n" },
            { input: "10", output: "55\n" }
          ],
          validationRegex: "for|while|range"
        },
        JAVASCRIPT: {
          prompt: "Write a JavaScript function `sumToN(n)` that returns the sum of numbers from 1 to `n` using a loop.",
          starterCode: "function sumToN(n) {\n    // Write your code here\n}",
          testCases: [
            { input: "5", output: "15\n" },
            { input: "1", output: "1\n" },
            { input: "10", output: "55\n" }
          ],
          validationRegex: "for|while"
        }
      }
    }
  };

  await prisma.bossBattle.create({
    data: {
      worldId: loopsWorld.id,
      name: 'Forest Sentinel',
      level: 'world',
      passThreshold: 0.8,
      xpReward: 250,
      badgeId: badgeMap['loops'].id,
      questions: m4BossQuestions as any,
    }
  });

  console.log('Seeded Boss Battles.');
  console.log('Seeding completed successfully!');
}

function generateLessonContent(title: string, lang: string, worldSlug: string) {
  const LANGUAGE_DETAILS: Record<string, string> = {
    C: "When programming in C, we are directly interfacing with the system's virtual memory address space. The C execution model is compilation-based, where source files are compiled by compilers like GCC or Clang directly into architecture-specific machine code. The compiler parses the code, performs optimizations, and generates assembly instruction sequences. Memory layout in C is extremely deterministic: variables declared inside functions are allocated on the stack segment, which grows downwards in memory. When a function executes, a stack frame is pushed, containing its parameters, local variables, and the return address. Upon function return, the stack pointer register is decremented, instantly deallocating the memory. The heap segment is used for dynamic memory, managed manually via malloc() and free(). Data types in C have size constraints dictated by the hardware architecture and ABI (Application Binary Interface). Operators translate to basic CPU instructions, meaning zero-overhead abstraction. The C preprocessor handles macros and file inclusions before compilation, which allows static configurations. Variables can also have static storage duration, meaning they reside in the Data or BSS segments of the executable and persist for the entire program execution.",
    CPP: "C++ builds on the execution model of C but introduces object-oriented and generic abstractions with zero runtime overhead. C++ source code is compiled into machine instructions, with the compiler handling advanced language features like classes, templates, and exceptions. Memory management is deterministic, with local variables adhering to the RAII (Resource Acquisition Is Initialization) pattern. In RAII, the lifetime of resources (like memory, file handles, or network sockets) is bound to the lifetime of the object containing them; when the object goes out of scope, its destructor is called automatically, freeing the resources. The compiler structures class objects in memory by laying out their member variables contiguously. If a class has virtual methods, the compiler adds a pointer (vptr) to a virtual method table (vtable) at the start of the object to enable runtime polymorphism. Memory allocation on the heap is done via new and delete, and modern C++ strongly encourages the use of smart pointers (std::unique_ptr and std::shared_ptr) to automate memory reclamation. The C++ compiler performs heavy optimizations such as inline expansion, template instantiation, and dead code elimination to generate highly efficient machine code.",
    JAVA: "Java programs are executed using a hybrid compilation and interpretation model. The Java compiler (javac) translates source code into architecture-independent bytecode stored in .class files. When the program runs, the Java Virtual Machine (JVM) loads this bytecode, verifies it, and interprets it, or compiles it to native machine code using the Just-In-Time (JIT) compiler. The JVM divides its memory into several runtime data areas. The JVM Stack holds local variables and partial results, pushing a stack frame for each method call. Unlike C/C++, Java objects cannot be allocated on the stack; they are always allocated on the garbage-collected Heap. The heap is divided into generations: the Young Generation (containing Eden and Survivor spaces) for short-lived objects, and the Old Generation for long-lived objects. Garbage Collectors (such as G1, ZGC, or Parallel GC) periodically run in the background, identifying unreachable objects and reclaiming their memory using algorithms like Mark-and-Sweep. Java enforces strict type safety, prevents direct pointer arithmetic, and manages array bounds checking at runtime. This abstraction layer protects against memory corruption but introduces overhead due to object headers, boxing/unboxing, and garbage collection pauses.",
    PYTHON: "Python is an interpreted, dynamically-typed language whose reference implementation is written in C (CPython). When a Python script runs, the compiler compiles the source code into bytecode, which is then executed by the CPython virtual machine interpreter loop. In Python, every variable is a reference to an object, and every object is represented in memory as a PyObject structure. This structure contains a reference count (for memory management) and a pointer to the object's type object. Memory management is automatic and uses two main mechanisms: reference counting and a cycle-detecting garbage collector. When a variable name is rebound or goes out of scope, the reference count of the target object is decremented. If it hits zero, the memory is immediately deallocated. To handle reference cycles (where objects reference each other, preventing their counts from hitting zero), a generational garbage collector periodically scans containers (lists, dicts, custom objects) to detect and resolve cyclic references. Because Python variables are dynamic references, there is significant memory overhead; for example, a simple integer in Python takes 28 bytes of memory compared to just 4 bytes for a primitive integer in C. The dynamic nature also means that symbol lookup is resolved via hash tables (namespaces) at runtime, although the interpreter optimizes this for local variables using fast-array lookups.",
    JAVASCRIPT: "JavaScript is a dynamically-typed scripting language executed by high-performance engines like Google's V8 (used in Chrome and Node.js). JavaScript engines employ Just-In-Time (JIT) compilation, where source code is parsed into an Abstract Syntax Tree (AST), compiled by an interpreter (like Ignition) into bytecode, and then optimized on-the-fly by an optimizing compiler (like TurboFan) based on profiling feedback. The JavaScript execution environment runs on a single-threaded event loop, managing tasks via a call stack, a callback queue, and a microtask queue. Memory is divided into the Stack (for execution contexts, primitive values, and reference pointers) and the Heap (for dynamically allocated objects, arrays, and functions). Memory management is entirely automatic; the engine's garbage collector identifies unreachable objects using the Mark-and-Sweep algorithm, starting from root references and traversing the object graph. To minimize garbage collection pauses, engines use generational GC, separate young and old memory generations, and perform incremental or concurrent marking. JavaScript uses lexical scoping, where scopes are determined at compile time by the placement of variables in the source code. When a function is declared, it retains a reference to its outer lexical environment, creating a closure that keeps the outer scope's variables alive in memory even after the outer function has completed execution."
  };

  const TOPIC_DETAILS: Record<string, string> = {
    'Introduction to Variables': "Variables are the fundamental storage units in programming, representing named memory locations that hold values that can change during execution. From a hardware perspective, a variable is an abstraction over a physical address in the RAM. When a programmer declares a variable, they instruct the compiler or runtime to reserve a specific chunk of memory. The size of this memory block is determined by the variable's data type. Understanding variables requires distinguishing between the variable's name (identifier), its address (where it resides in memory), its value (the binary data stored inside), and its scope (where it can be accessed). In statically-typed languages, the data type is fixed at compile-time, allowing the compiler to perform type checking and optimize register usage. In dynamically-typed languages, variables are name-bindings that point to objects of arbitrary types at runtime, providing flexibility but requiring runtime type checks and additional memory allocation.",
    'Primitive Data Types': "Primitive data types are the basic, built-in types provided by a programming language from which all other types are constructed. They represent the most basic values, such as integers, floating-point numbers, characters, and booleans. Unlike complex objects or structures, primitive data types are stored directly in memory (typically on the stack) and map directly to the hardware representation of data. For instance, an integer primitive is stored as a direct binary value (often using two's complement for signed integers), while a boolean is represented by a single bit (though usually padded to a full byte for alignment). Floating-point primitives follow the IEEE 754 standard, partitioning memory into sign, exponent, and mantissa fields. Understanding primitives is crucial because they form the leaf nodes of all data structures. Their fixed size allows compilers to perform static analysis, predict cache alignment, and generate highly optimized mathematical instructions.",
    'Variable Declaration & Initialization': "Variable declaration is the process of informing the compiler or interpreter about a variable's name and data type, prompting it to allocate memory space. Initialization is the subsequent process of assigning an initial value to that declared variable before it is read. Declaring a variable without initializing it can lead to undefined behavior or runtime exceptions, as the memory location may contain garbage data left over from previous processes. Different languages handle uninitialized variables differently; for instance, C leaves garbage in the memory, while Java initializes primitives to default values (like 0 or false) and object references to null. Proper initialization is a cornerstone of safe programming. Modern best practices encourage declaring variables as close to their first use as possible and initializing them immediately, which reduces the window where a variable is in an indeterminate state and helps prevent difficult-to-track bugs.",
    'Constant Variables': "Constant variables, often declared using keywords like const or final, are variables whose values are assigned once and cannot be modified during program execution. Constants provide read-only access to values, enforcing immutability and preventing accidental side effects. From a compiler perspective, constants allow for powerful optimizations like constant folding, where mathematical operations involving constants are evaluated at compile time rather than runtime. Additionally, constants are sometimes placed in read-only memory segments (like the Text segment), causing the operating system to trigger a segmentation fault if the program attempts to write to them. Constants also improve code readability and maintainability by replacing magic numbers with named identifiers, ensuring that key values (such as physical constants, configuration settings, or array bounds) are declared in a single place.",
    'Variables Scope': "Variables scope defines the region of a program's text within which a variable's identifier is visible and can be accessed. Scoping rules prevent namespace collisions and manage variable lifetimes. Most modern languages use lexical scoping (or static scoping), where scope is determined at compile time based on the nesting of code blocks. Global variables are accessible throughout the entire program, but their use is generally discouraged due to the risk of state corruption. Local variables are declared inside a function or block and are only accessible within that block. Block scope ensures that variables declared inside loops or conditional blocks are deallocated when execution leaves the block, which optimizes memory utilization. Variable shadowing occurs when a variable declared within an inner scope has the same name as a variable in an outer scope, temporarily hiding the outer variable and sometimes introducing subtle logical bugs.",
    'Console Output Streams': "Console output streams represent the standard mechanism through which programs write text-based information back to the user or terminal. In operating systems like Unix and Windows, this is managed via the standard output file descriptor (stdout). When a program calls an output function (like printf in C, std::cout in C++, System.out.println in Java, or print in Python), the data is placed into an output buffer. Buffering optimizes performance by reducing the number of costly system calls; instead of writing each character to the console screen individually, characters are accumulated in memory and written in blocks. Standard output is usually line-buffered when connected to a terminal, meaning the buffer is flushed (written to the device) whenever a newline character is encountered. Programmers must understand stream buffering to avoid synchronization issues, particularly when mixing stdout with the unbuffered standard error stream (stderr).",
    'Reading User Input': "Reading user input is the process of receiving data from external sources, typically the keyboard or a file, via the standard input stream (stdin). The input stream is treated as a continuous sequence of characters. When a user types and presses Enter, the characters are sent to an input buffer. The program then consumes characters from this buffer using input functions (such as scanf in C, std::cin in C++, Scanner in Java, or input() in Python). Reading input involves parsing text into appropriate data types, which requires handling format mismatches, buffer overflows, and empty inputs. If a program expects an integer but receives a word, the parsing logic can fail, leaving the input stream in a corrupted state. Robust input handling requires validating input data, clearing the buffer of invalid characters, and handling End-Of-File (EOF) signals to prevent infinite loops and crashes.",
    'Formatting Output Streams': "Formatting output streams allows developers to control the visual presentation of data written to the console or files. This includes specifying the precision of floating-point numbers, padding strings with spaces, aligning columns, and formatting numbers in hexadecimal or octal. In C, formatting is done using format specifiers (like %d or %0.2f) inside printf, which are parsed at runtime. While powerful, this approach lacks type safety. C++ addresses this with stream manipulators (like std::setw or std::setprecision) or std::format in newer standards. Java uses System.out.printf and String.format, while Python supports f-strings and the .format() method. Proper formatting is essential for generating clean, readable reports, aligning tabular data, and creating professional user interfaces. It also has performance implications, as parsing complex format strings can be computationally expensive compared to simple stream writes.",
    'Program Lifecycle': "The program lifecycle describes the phases an application goes through, from loading and execution to termination. When a user runs a compiled executable or script, the operating system's loader allocates memory space, maps the code segment, and initializes global and static variables. The OS then hands control to the program's runtime entry point, which is typically the main function. During execution, the program allocates and deallocates memory on the stack and heap, processes input, and executes control flow. The lifecycle ends when the program terminates. Normal termination occurs when the main function returns or the program calls exit functions, returning an exit status code to the OS (usually 0 for success and non-zero for error). Abnormal termination occurs when the program crashes due to uncaught exceptions, segmentation faults, or signals from the OS, leaving resources in an indeterminate state.",
    'Decision Making with If-Else': "Decision making with if-else blocks is the core mechanism of conditional control flow, allowing a program to execute different branches of code based on boolean conditions. When the program encounters an if statement, it evaluates the conditional expression to true or false. If true, the code block immediately following the statement is executed; otherwise, the else or else if blocks are evaluated. At the hardware level, this maps to conditional jump instructions in the CPU. Modern CPUs use branch prediction to guess which branch will be taken, pre-fetching instructions along that path. If the guess is wrong (a branch misprediction), the CPU must flush its instruction pipeline, causing a small performance penalty. Programmers can write cleaner and more efficient conditional blocks by placing the most common case first and keeping condition expressions simple.",
    'The Switch Statement': "The switch statement is a multi-way branch control structure that evaluates a single expression and jumps to matching case labels. Unlike a series of if-else statements, which must be evaluated sequentially, a switch statement can be optimized by compilers into a jump table (an array of code addresses) if the cases are closely grouped integer constants. This allows the CPU to jump directly to the correct case block in constant time, O(1), regardless of the number of cases. Switch statements are ideal for handling enums, characters, or integers. However, switch blocks require careful use of the break statement to prevent 'fall-through', where execution continues into subsequent case blocks. Modern languages like Swift or Go have eliminated fall-through by default, while others require explicit keywords to control this behavior.",
    'Nested If-Else Blocks': "Nested if-else blocks are conditional statements placed inside other conditional statements, enabling programs to model complex, multi-layered decision trees. While nesting is necessary to evaluate hierarchical conditions (e.g., verifying if a user is logged in, then checking if they have admin permissions, then checking if the resource is public), deep nesting leads to the 'Arrow Anti-Pattern', where code slants heavily to the right, making it difficult to read and maintain. Deeply nested blocks increase cognitive complexity and make testing all logical paths challenging. To avoid nesting issues, developers use guard clauses (returning early when preconditions fail), combine conditions using logical operators, or extract complex validation paths into separate functions.",
    'Boolean Operators & logic': "Boolean operators (AND, OR, NOT) are the building blocks of logical expressions, allowing programs to combine multiple boolean variables or comparisons into a single condition. The logical AND (&& or and) returns true only if all operands are true, while logical OR (|| or or) returns true if at least one operand is true. Logical NOT (! or not) inverts the boolean value. A critical optimization used by compilers and interpreters is short-circuit evaluation. In an AND expression, if the first operand is false, the entire expression is guaranteed to be false, so the second operand is not evaluated. Similarly, in an OR expression, if the first operand is true, evaluation stops immediately. Programmers can leverage short-circuiting to prevent runtime crashes, for example, by checking if an object is not null before accessing its properties in the same expression.",
    'Ternary Operator': "The ternary operator (often represented as condition ? expression1 : expression2) is a compact inline conditional operator that returns one of two values depending on a boolean condition. It is the only operator in most languages that takes three operands. The ternary operator is commonly used to replace simple, single-variable assignment if-else statements, making code more concise. For instance, assigning a default value if a variable is null can be done in a single line. However, overusing the ternary operator or nesting multiple ternary operators together quickly degrades readability, creating dense, unreadable code. In terms of performance, the ternary operator is equivalent to an if-else block, but in some compiled languages, it can help the compiler optimize assignments directly into registers.",
    'Loops: For & While': "Loops are control flow structures that execute a block of code repeatedly as long as a specified condition remains true. The while loop is condition-controlled, executing as long as its condition evaluates to true, making it ideal when the number of iterations is not known beforehand (e.g. reading until EOF). The for loop is count-controlled, typically encapsulating initialization, condition verification, and iteration step increment in a single line. This encapsulation makes for loops less prone to off-by-one errors and infinite loops caused by forgetting to increment loop counters. At the compiler level, loops are optimized using techniques like loop unrolling, which duplicates the loop body to reduce the instruction overhead of condition testing and jumping, maximizing pipeline efficiency.",
    'Nested Loops': "Nested loops occur when one loop is placed inside another loop, creating an inner-outer loop structure. For each iteration of the outer loop, the inner loop completes its entire cycle. Nested loops are commonly used to traverse multi-dimensional data structures, such as 2D arrays, matrices, or grids. However, nested loops have a significant impact on computational complexity. A single nested loop structure over an array of size N results in quadratic time complexity, O(N^2), meaning that if the data size doubles, the execution time quadruples. Deeply nested loops should be avoided or optimized whenever possible. Optimization strategies include loop tiling to improve cache locality, loop interchange to align with row-major or column-major memory layouts, or replacing nested loops with flat indexing.",
    'Do-While Loop Structure': "The do-while loop is a post-test loop structure that guarantees the loop body is executed at least once before the loop condition is evaluated. Unlike pre-test loops (for and while), which evaluate the condition first and may skip the body entirely, a do-while loop executes the body first, then checks the condition at the end of the iteration. This makes it perfect for scenarios where the loop condition depends on variables that are initialized or updated inside the loop itself, such as presenting a menu to a user, reading a command, and then repeating the menu if the command is invalid. In assembly, do-while loops are highly efficient because they translate to a single conditional jump instruction back to the start of the block, avoiding the initial jump over the loop body.",
    'Loop Control: break & continue': "Loop control statements, break and continue, alter the standard execution flow of loops. The break statement immediately terminates the loop, jumping to the first instruction following the loop block. It is commonly used to exit loops early when a target item is found or an error is detected. The continue statement skips the remainder of the current loop iteration, jumping directly to the loop's condition check (or increment step in a for loop) to start the next iteration. While these control statements provide flexibility, their excessive use can make control flow difficult to trace, violating structured programming principles. Developers should use them judiciously, ensuring they do not create unreachable code blocks or bypass variable updates.",
    'Infinite Loops and termination': "An infinite loop is a loop that never terminates because its exit condition is never met, either because the condition is hardcoded to true (e.g. while(true)) or due to a logical bug (such as failing to update a loop counter). Infinite loops consume CPU cycles, driving processor usage to 100% and causing applications to freeze or crash. While infinite loops are sometimes created intentionally (such as the main event loop in a server, game, or OS), they must contain an internal exit path, such as a break statement triggered by an event. Safely terminating loops requires defining clear boundary conditions, ensuring loop state updates on every iteration, and implementing timeouts or maximum iteration counts in critical systems.",
    'Introduction to Functions': "Functions, also known as procedures or methods, are self-contained blocks of code that perform a specific task and can be called from other parts of a program. Functions promote modularity, code reuse, and abstraction, allowing developers to break complex programs into smaller, manageable pieces. When a function is called, the current execution state is saved on the stack, parameters are passed, and control jumps to the function's code. Once completed, the function optionally returns a value, and execution resumes after the call point. Understanding functions requires mastering scope (local vs global variables), parameter passing mechanisms (pass-by-value vs pass-by-reference), and memory lifetime of local symbols.",
    'Introduction to Recursion': "Recursion is a programming technique where a function calls itself, directly or indirectly, to solve a problem by breaking it down into smaller sub-problems. A recursive function must define one or more base cases — conditions under which the recursion stops — and a recursive step that progresses towards the base case. Without a proper base case, recursion leads to infinite execution, resulting in stack overflow errors as the call stack runs out of memory. While recursion provides elegant solutions for tree traversals, parsing, and divide-and-conquer algorithms, it carries memory and CPU overhead due to stack frame allocations, making iteration more efficient for simple tasks.",
    'Introduction to Memory': "Memory management is the process of allocating, tracking, and freeing physical and virtual memory resources during program execution. Programs utilize different memory segments: the text segment (compiled code), the data and BSS segments (global/static variables), the stack (automatic variables and function frames), and the heap (dynamically allocated memory). In low-level languages like C/C++, developers manually manage the heap using pointer arithmetic, which is highly efficient but prone to memory leaks and pointer bugs. High-level languages use automated memory management, relying on Garbage Collectors or compiler-injected deallocation, sacrificing some performance for safety.",
    'Introduction to Debugging': "Debugging is the systematic process of identifying, isolating, and fixing bugs or anomalies in software. Debugging requires an understanding of program state and execution flow. Developers use debuggers to set breakpoints (pausing execution at specific lines), inspect variable values in memory, step through code line-by-line, and trace call stacks. Exceptional conditions and stack traces help locate the root cause of crashes. Good debugging practices also include writing assertions, utilizing logging libraries, and performing runtime analysis to detect memory leaks and performance bottlenecks.",
    'Introduction to Classes': "Classes are user-defined blueprints or templates used to create objects, representing the core concept of Object-Oriented Programming (OOP). A class encapsulates data (attributes or fields) and behavior (methods or functions) into a single logical entity. When an object is instantiated from a class, memory is allocated to hold its specific state. Classes enable data abstraction, allowing developers to hide internal details and expose a clean interface. Understanding classes involves learning member visibility (public, private, protected), constructor initialization, object lifecycles, and class vs instance scopes.",
    'Introduction to OOP Principles': "Object-Oriented Programming is built on four core principles: Encapsulation (bundling data and methods and restricting direct access), Inheritance (allowing classes to inherit state and behavior from base classes), Polymorphism (enabling objects of different classes to be treated as instances of a common superclass), and Abstraction (hiding implementation details and exposing essential features). These principles promote code reuse, modularity, and extensibility, making it easier to design and maintain complex software architectures.",
    'Introduction to OOP Relations': "Object relationships describe how classes interact and depend on each other in an OOP system. These relationships include Association (a general link between classes), Aggregation (a 'has-a' relationship where the child can exist independently of the parent), and Composition (a strong 'has-a' relationship where child lifetimes are tied to the parent). Properly defining these relationships prevents high coupling, improves modularity, and ensures proper resource cleanup during object destruction.",
    'Introduction to Design Patterns': "Design patterns are reusable, templated solutions to common software design problems encountered during development. Categorized into Creational (e.g. Singleton, Factory), Structural (e.g. Adapter, Decorator), and Behavioral (e.g. Observer, Strategy) patterns, they provide established best practices for structuring code. Applying design patterns improves maintainability, decoupling, and code readability, helping developers write scalable, clean architectures.",
    'Introduction to Real-World SWE': "Real-World Software Engineering extends beyond writing code, encompassing version control (Git), team collaboration, code reviews, testing strategies (unit, integration, E2E), continuous integration and deployment (CI/CD), documentation, and codebase maintenance. Successful software engineering requires balancing performance, security, clean code practices, and rapid delivery, adhering to strict coding standards to ensure long-term codebase health."
  };

  const cleanTitle = title.trim();
  const conceptualFoundation = TOPIC_DETAILS[cleanTitle] || 
    TOPIC_DETAILS[Object.keys(TOPIC_DETAILS).find(k => k.toLowerCase() === cleanTitle.toLowerCase()) || ''] || 
    `Detailed concepts regarding ${title} inside the software engineering curriculum.`;

  const executionModel = LANGUAGE_DETAILS[lang] || `Standard execution and memory allocation structures in the ${lang} environment.`;

  // 1. Introduction Paragraph (~200 words)
  const introduction = `Welcome to the comprehensive, in-depth guide on ${title} specifically tailored for the ${lang} programming language track. In this lesson, we will explore the underlying concepts, execution models, and compiler/interpreter behaviors that dictate how ${title.toLowerCase()} behaves in production-grade systems and application architectures. Software engineers must understand these mechanics to design robust, clean, secure, and highly performant applications. As code grows in size and complexity, simple high-level logical abstractions translate into complex machine instructions, register changes, memory bus signals, and virtual memory allocations. In the context of ${lang}, this requires developer awareness of language specifications, compilation/interpretation phases, linkers, assemblers, and run-time environment overheads. We will dive deep into standard syntax structures, memory segment allocations, and runtime execution contexts. By the end of this module, you will be equipped to apply this concept with extreme precision, avoiding common pitfalls and maximizing code execution speed.`;

  // 2. Conceptual Deep Dive Paragraph (~150 words)
  const conceptualDeepDive = `A conceptual deep dive into ${title} reveals that it is not merely a syntactic feature of ${lang}, but a fundamental construct of software engineering. When writing applications, the choice of how to represent, partition, and execute ${title.toLowerCase()} has long-term implications for the scalability and maintainability of the codebase. Dynamic analysis tools, profiling utilities, and compiler output logs are used to verify how these constructs behave under pressure. We must ensure that we align our logic with the underlying architecture of ${lang}. This involves verifying that type boundaries are respected, variable scoping is clean and localized, memory access patterns are linear, and code paths are deterministic. By focusing on these principles, we build a solid foundation for advanced programming structures, OOP patterns, and data engineering pipelines.`;

  // 3. Technical Breakdown Paragraph (~250 words)
  const technicalBreakdown = `To write production-ready implementations of ${title} in ${lang}, we must dissect the grammar, keywords, and type boundaries associated with it. Unlike basic examples, realistic enterprise systems deal with complex edge cases, scoping rules, and compiler optimization flags. For example, during execution, the processor relies on instructions like conditional jumps, memory stores, load operations, and arithmetic registers. The compiler or interpreter maps your high-level code structure into machine bytecode or binary, laying out symbols in memory segments like the stack, heap, BSS, or data segments. This segment covers how variables are resolved, scopes are enforced, and expressions are evaluated. We will look at proper scoping constraints, avoiding variable shadowing or scope leakage, and using typing keywords (such as static, const, let, final, or var) to declare intent to the compiler. Standard library utilities or built-in keywords are evaluated to ensure data integrity and type safety at runtime, preventing memory corruption or buffer overflows.`;

  // 4. Optimization and cache guide (~250 words)
  const optimizationGuide = `Optimization is the next frontier of mastering ${title} in the ${lang} track. In modern computer architecture, memory hierarchy represents the bottleneck of execution performance. CPU registers, L1/L2/L3 caches, and RAM form a hierarchical memory structure. To minimize cache misses, data should be stored contiguously in memory, leveraging spatial and temporal locality. When executing code blocks related to ${title}, developers must minimize unnecessary heap allocations, which trigger garbage collection cycles or dynamic memory deallocation search overheads. Pre-allocating stack frames or buffers, avoiding reference boxing/unboxing, and designing cache-aligned data structures directly impacts throughput. Furthermore, modern compilers leverage branch prediction and loop-invariant code motion to optimize decision paths. Writing clear, non-shadowed logical branches assists the CPU's branch prediction unit, preventing pipeline flushes and instruction stalls, resulting in significant runtime execution speedups.`;

  // 5. Summary (~100 words)
  const summaryText = `In summary, mastering ${title} in ${lang} involves a blend of syntactic knowledge, execution understanding, and engineering discipline. Understanding the boundaries of virtual memory, compiler optimization flags, and spatial locality allows you to write software that is not only correct but also extremely efficient under heavy workloads. In the next steps, we will practice these concepts in code challenges and apply them directly within our game simulation exercises. Keep these principles in mind to write clean, maintainable code.`;

  // 6. Code sample
  const codeSample = getCodeSample(title, lang);

  // 7. Concept checks by world
  let qText = "Which of the following describes best practices for resource and memory optimization?";
  let qOpts = ["Allocate all variables on the global scope", "Avoid optimizing memory footprint at all costs", "Maintain reference lifetimes as short as possible and utilize cache-friendly contiguous allocations", "Deeply nest code blocks to maximize variable visibility scope"];
  let qAns = "Maintain reference lifetimes as short as possible and utilize cache-friendly contiguous allocations";
  let qExpl = "Keeping variable scopes narrow and data contiguous in memory maximizes L1/L2 cache utilization and minimizes cache misses, leading to faster execution.";

  if (worldSlug === 'variables-operators') {
    qText = "Which memory segment is primarily used for auto-variables (local variables) allocated at runtime?";
    qOpts = ["The Heap segment", "The Stack segment", "The Data segment (BSS)", "CPU registers only"];
    qAns = "The Stack segment";
    qExpl = "Local variables are automatically allocated on the function's stack frame (Stack segment) and are deallocated when the function returns.";
  } else if (worldSlug === 'io-program-flow') {
    qText = "What is the purpose of line-buffering in standard console output streams?";
    qOpts = ["To encrypt console output data", "To write characters to the screen only when a newline character is encountered, reducing system calls", "To read user input character-by-character", "To bypass the OS terminal drivers entirely"];
    qAns = "To write characters to the screen only when a newline character is encountered, reducing system calls";
    qExpl = "Standard output is typically line-buffered to optimize performance by grouping writes until a newline is found, reducing expensive system calls.";
  } else if (worldSlug === 'decision-making') {
    qText = "What optimization does a compiler typically apply to a switch-case statement with contiguous integer values?";
    qOpts = ["Converts it into a loop", "Builds a jump table for constant-time lookups", "Moves the switch statement to the heap", "Forces short-circuit evaluation"];
    qAns = "Builds a jump table for constant-time lookups";
    qExpl = "For contiguous integers, the compiler can generate a jump table, turning a series of comparisons into a single indirect branch instruction (O(1) time).";
  } else if (worldSlug === 'loops-iteration') {
    qText = "What does the 'loop unrolling' compiler optimization accomplish?";
    qOpts = ["It changes all 'for' loops into 'while' loops", "It duplicates the loop body to reduce condition testing and jump overhead", "It prevents loop variables from overflowing", "It moves variables from the stack to the heap"];
    qAns = "It duplicates the loop body to reduce condition testing and jump overhead";
    qExpl = "Loop unrolling reduces instruction overhead by executing multiple iterations per loop cycle, minimizing branch checks.";
  } else if (worldSlug === 'functions-modular') {
    qText = "What is stored in a function's execution stack frame (activation record)?";
    qOpts = ["Global constants and static variables", "The function's bytecode only", "Local variables, parameters, and the return address", "Dynamic heap allocations"];
    qAns = "Local variables, parameters, and the return address";
    qExpl = "Each function call pushes an activation record onto the stack containing its arguments, local variables, and the return address to resume execution.";
  } else if (worldSlug === 'recursion-advanced') {
    qText = "What occurs if a recursive function does not reach or define a base case?";
    qOpts = ["The compiler automatically optimizes it into a loop", "It executes once and exits normally", "It consumes all stack memory, causing a stack overflow crash", "It allocates memory on the heap indefinitely"];
    qAns = "It consumes all stack memory, causing a stack overflow crash";
    qExpl = "Without a base case, recursion continues infinitely, pushing stack frames until stack memory limit is exceeded, crashing the program.";
  } else if (worldSlug === 'memory-internals') {
    qText = "Which of the following is a key difference between stack and heap memory allocation?";
    qOpts = ["Stack is manual; heap is automatic", "Stack is fast and managed automatically; heap is slower and managed manually or by garbage collection", "Stack is stored on disk; heap is in RAM", "Stack memory survives program termination; heap is cleared instantly"];
    qAns = "Stack is fast and managed automatically; heap is slower and managed manually or by garbage collection";
    qExpl = "Stack allocations are extremely fast as they just shift the stack pointer, whereas heap allocation requires searching for free blocks and manages fragmentation.";
  } else if (worldSlug === 'debugging-testing') {
    qText = "What is the primary purpose of a symbol table when debugging compiled code?";
    qOpts = ["To compress the size of the executable", "To map binary memory addresses back to human-readable source code names (variables/functions)", "To execute test cases in parallel", "To prevent exceptions from crashing the app"];
    qAns = "To map binary memory addresses back to human-readable source code names (variables/functions)";
    qExpl = "Debuggers use symbol tables (generated with -g flag) to translate memory addresses back to source code lines, functions, and variable names.";
  } else if (worldSlug === 'classes-objects') {
    qText = "Where are the instance variables (fields) of a class object stored in memory upon instantiation?";
    qOpts = ["In the Text segment", "Contiguously inside the allocated space for the object (on stack or heap)", "In the global static namespace", "In the class's vtable"];
    qAns = "Contiguously inside the allocated space for the object (on stack or heap)";
    qExpl = "When an object is instantiated, the system allocates memory for its instance fields contiguously so they can be accessed via offsets from the object's base address.";
  } else if (worldSlug === 'core-oop-principles') {
     qText = "How does runtime polymorphism select the correct method implementation for an overridden virtual method?";
     qOpts = ["Through static type-casting at compile time", "By looking up the method address in the object's virtual method table (vtable) at runtime", "By scanning the source files dynamically", "Through checking global registry namespaces"];
     qAns = "By looking up the method address in the object's virtual method table (vtable) at runtime";
     qExpl = "Classes with virtual methods have a vptr pointing to a vtable. At runtime, the method call retrieves the function pointer from the vtable to invoke the correct subclass method.";
  }

  return {
    title: `${title} (${lang})`,
    subtitle: `Master the concepts of ${title.toLowerCase()} with ${lang} track.`,
    language_track: lang,
    sections: [
      { type: 'heading', content: `Introduction to ${title}` },
      { type: 'paragraph', content: introduction },
      { type: 'heading', content: 'Core Mechanics & Memory Layout' },
      { type: 'paragraph', content: conceptualFoundation },
      { type: 'diagram', content: '[Memory Layout Diagram: Stack vs Heap allocation for ' + title + ']' },
      { type: 'heading', content: 'Conceptual Deep Dive' },
      { type: 'paragraph', content: conceptualDeepDive },
      { type: 'heading', content: 'Deep Technical Analysis' },
      { type: 'paragraph', content: executionModel },
      { type: 'paragraph', content: technicalBreakdown },
      { type: 'code', content: codeSample },
      { type: 'heading', content: 'Best Practices & Real-World Application' },
      { type: 'paragraph', content: optimizationGuide },
      { type: 'heading', content: 'Summary & Next Steps' },
      { type: 'paragraph', content: summaryText }
    ],
    concept_check: [
      {
        question: qText,
        options: qOpts,
        answer: qAns,
        explanation: qExpl
      }
    ],
    key_takeaways: [
      `Understanding the runtime execution stack and heap boundaries for ${title}.`,
      `Leveraging compiler directives and keywords to enforce immutability and memory optimization.`,
      `Structuring data variables contiguously to maximize temporal and spatial locality in CPU caches.`
    ],
    common_mistakes: [
      `Neglecting block-scoping or variable shadowing, leading to difficult-to-trace bugs.`,
      `Leaving variables uninitialized or allowing pointers/references to leak memory on the heap.`
    ],
    related_game_id: 'logic_builder',
    estimated_minutes: 15
  };
}

function getCodeSample(title: string, lang: string): string {
  const lowerTitle = title.toLowerCase();
  if (lang === 'C') {
    if (lowerTitle.includes('variable') || lowerTitle.includes('type')) {
      return `#include <stdio.h>\n\nint main() {\n    // Declaring and initializing variables of different primitive types\n    int age = 21;\n    double salary = 75000.50;\n    char grade = 'A';\n    \n    printf("Age: %d\\n", age);\n    printf("Salary: %.2f\\n", salary);\n    printf("Grade: %c\\n", grade);\n    \n    return 0;\n}`;
    } else if (lowerTitle.includes('input') || lowerTitle.includes('output') || lowerTitle.includes('stream') || lowerTitle.includes('lifecycle')) {
      return `#include <stdio.h>\n\nint main() {\n    int number;\n    printf("Enter an integer: ");\n    if (scanf("%d", &number) == 1) {\n        printf("You entered: %d\\n", number);\n    } else {\n        printf("Invalid input error.\\n");\n    }\n    return 0;\n}`;
    } else if (lowerTitle.includes('conditional') || lowerTitle.includes('if') || lowerTitle.includes('decision') || lowerTitle.includes('switch') || lowerTitle.includes('ternary') || lowerTitle.includes('logic')) {
      return `#include <stdio.h>\n\nint main() {\n    int score = 85;\n    if (score >= 90) {\n        printf("Grade: A\\n");\n    } else if (score >= 80) {\n        printf("Grade: B\\n");\n    } else {\n        printf("Grade: C\\n");\n    }\n    return 0;\n}`;
    } else if (lowerTitle.includes('loop') || lowerTitle.includes('iteration') || lowerTitle.includes('break') || lowerTitle.includes('continue')) {
      return `#include <stdio.h>\n\nint main() {\n    printf("For loop iteration:\\n");\n    for (int i = 1; i <= 5; i++) {\n        if (i == 4) continue;\n        printf("Value: %d\\n", i);\n    }\n    return 0;\n}`;
    } else {
      return `#include <stdio.h>\n\n// Demonstrating ${title} in C\nint main() {\n    printf("Executing demonstration for ${title}\\n");\n    return 0;\n}`;
    }
  } else if (lang === 'CPP') {
    if (lowerTitle.includes('variable') || lowerTitle.includes('type')) {
      return `#include <iostream>\n\nint main() {\n    // C++ variables and scope\n    int age = 21;\n    double salary = 75000.50;\n    char grade = 'A';\n    \n    std::cout << "Age: " << age << std::endl;\n    std::cout << "Salary: " << salary << std::endl;\n    std::cout << "Grade: " << grade << std::endl;\n    \n    return 0;\n}`;
    } else if (lowerTitle.includes('input') || lowerTitle.includes('output') || lowerTitle.includes('stream') || lowerTitle.includes('lifecycle')) {
      return `#include <iostream>\n\nint main() {\n    int number;\n    std::cout << "Enter an integer: ";\n    if (std::cin >> number) {\n        std::cout << "You entered: " << number << std::endl;\n    } else {\n        std::cout << "Invalid input stream error." << std::endl;\n    }\n    return 0;\n}`;
    } else if (lowerTitle.includes('conditional') || lowerTitle.includes('if') || lowerTitle.includes('decision') || lowerTitle.includes('switch') || lowerTitle.includes('ternary') || lowerTitle.includes('logic')) {
      return `#include <iostream>\n\nint main() {\n    int score = 85;\n    if (score >= 90) {\n        std::cout << "Grade: A" << std::endl;\n    } else if (score >= 80) {\n        std::cout << "Grade: B" << std::endl;\n    } else {\n        std::cout << "Grade: C" << std::endl;\n    }\n    return 0;\n}`;
    } else if (lowerTitle.includes('loop') || lowerTitle.includes('iteration') || lowerTitle.includes('break') || lowerTitle.includes('continue')) {
      return `#include <iostream>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        if (i == 4) continue;\n        std::cout << "Value: " << i << std::endl;\n    }\n    return 0;\n}`;
    } else {
      return `#include <iostream>\n\n// Demonstrating ${title} in C++\nint main() {\n    std::cout << "Executing demonstration for ${title}" << std::endl;\n    return 0;\n}`;
    }
  } else if (lang === 'JAVA') {
    if (lowerTitle.includes('variable') || lowerTitle.includes('type')) {
      return `public class Main {\n    public static void main(String[] args) {\n        int age = 21;\n        double salary = 75000.50;\n        char grade = 'A';\n        \n        System.out.println("Age: " + age);\n        System.out.println("Salary: " + salary);\n        System.out.println("Grade: " + grade);\n    }\n}`;
    } else if (lowerTitle.includes('input') || lowerTitle.includes('output') || lowerTitle.includes('stream') || lowerTitle.includes('lifecycle')) {
      return `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter an integer: ");\n        if (scanner.hasNextInt()) {\n            int number = scanner.nextInt();\n            System.out.println("You entered: " + number);\n        } else {\n            System.out.println("Invalid input stream error.");\n        }\n    }\n}`;
    } else if (lowerTitle.includes('conditional') || lowerTitle.includes('if') || lowerTitle.includes('decision') || lowerTitle.includes('switch') || lowerTitle.includes('ternary') || lowerTitle.includes('logic')) {
      return `public class Main {\n    public static void main(String[] args) {\n        int score = 85;\n        if (score >= 90) {\n            System.out.println("Grade: A");\n        } else if (score >= 80) {\n            System.out.println("Grade: B");\n        } else {\n            System.out.println("Grade: C");\n        }\n    }\n}`;
    } else if (lowerTitle.includes('loop') || lowerTitle.includes('iteration') || lowerTitle.includes('break') || lowerTitle.includes('continue')) {
      return `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            if (i == 4) continue;\n            System.out.println("Value: " + i);\n        }\n    }\n}`;
    } else {
      return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Executing demonstration for ${title}");\n    }\n}`;
    }
  } else if (lang === 'PYTHON') {
    if (lowerTitle.includes('variable') || lowerTitle.includes('type')) {
      return `# Python dynamic variables\nage = 21\nsalary = 75000.50\ngrade = 'A'\n\nprint(f"Age: {age}")\nprint(f"Salary: {salary}")\nprint(f"Grade: {grade}")`;
    } else if (lowerTitle.includes('input') || lowerTitle.includes('output') || lowerTitle.includes('stream') || lowerTitle.includes('lifecycle')) {
      return `# Reading user input from standard input\ntry:\n    val = input("Enter an integer: ")\n    number = int(val)\n    print(f"You entered: {number}")\nexcept ValueError:\n    print("Invalid input stream error.")`;
    } else if (lowerTitle.includes('conditional') || lowerTitle.includes('if') || lowerTitle.includes('decision') || lowerTitle.includes('switch') || lowerTitle.includes('ternary') || lowerTitle.includes('logic')) {
      return `# Python conditional flow\nscore = 85\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelse:\n    print("Grade: C")`;
    } else if (lowerTitle.includes('loop') || lowerTitle.includes('iteration') || lowerTitle.includes('break') || lowerTitle.includes('continue')) {
      return `# Python loops\nfor i in range(1, 6):\n    if i == 4:\n        continue\n    print(f"Value: {i}")`;
    } else {
      return `# Demonstrating ${title}\ndef main():\n    print("Executing demonstration for ${title}")\n\nif __name__ == '__main__':\n    main()`;
    }
  } else {
    // JavaScript
    if (lowerTitle.includes('variable') || lowerTitle.includes('type')) {
      return `// JavaScript variables and scope\nlet age = 21;\nconst salary = 75000.50;\nlet grade = 'A';\n\nconsole.log(\`Age: \${age}\`);\nconsole.log(\`Salary: \${salary}\`);\nconsole.log(\`Grade: \${grade}\`);`;
    } else if (lowerTitle.includes('input') || lowerTitle.includes('output') || lowerTitle.includes('stream') || lowerTitle.includes('lifecycle')) {
      return `// Console logging and streams\nconsole.log("Writing to standard output stream.");\nconsole.error("Writing to standard error stream.");`;
    } else if (lowerTitle.includes('conditional') || lowerTitle.includes('if') || lowerTitle.includes('decision') || lowerTitle.includes('switch') || lowerTitle.includes('ternary') || lowerTitle.includes('logic')) {
      return `// JavaScript conditional execution\nconst score = 85;\nif (score >= 90) {\n    console.log("Grade: A");\n} else if (score >= 80) {\n    console.log("Grade: B");\n} else {\n    console.log("Grade: C");\n}`;
    } else if (lowerTitle.includes('loop') || lowerTitle.includes('iteration') || lowerTitle.includes('break') || lowerTitle.includes('continue')) {
      return `// JavaScript iteration\nfor (let i = 1; i <= 5; i++) {\n    if (i == 4) continue;\n    console.log(\`Value: \${i}\`);\n}`;
    } else {
      return `// Demonstrating ${title}\nfunction main() {\n    console.log("Executing demonstration for ${title}");\n}\nmain();`;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
