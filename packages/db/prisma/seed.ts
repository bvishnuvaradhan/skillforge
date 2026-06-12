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

  // 2. Seed Badges
  const varBadge = await prisma.badge.create({
    data: {
      name: 'Variables Mastery Badge',
      description: 'Defeated the Variables Overlord and mastered data storage.',
      imageUrl: 'https://skillforge.app/badges/variables.png',
      rarity: 'common',
    },
  });

  const condBadge = await prisma.badge.create({
    data: {
      name: 'Conditions Valley Insignia',
      description: 'Defeated the Valley Arbitrator and mastered conditional structures.',
      imageUrl: 'https://skillforge.app/badges/conditions.png',
      rarity: 'common',
    },
  });

  const loopBadge = await prisma.badge.create({
    data: {
      name: 'Loop Forest Medallion',
      description: 'Defeated the Forest Sentinel and mastered loop structures.',
      imageUrl: 'https://skillforge.app/badges/loops.png',
      rarity: 'rare',
    },
  });

  const arrayBadge = await prisma.badge.create({
    data: {
      name: 'Array Colosseum Badge',
      description: 'Defeated the Array Champion and mastered contiguous sequences.',
      imageUrl: 'https://skillforge.app/badges/arrays.png',
      rarity: 'rare',
    },
  });

  const funcBadge = await prisma.badge.create({
    data: {
      name: 'Function Fortress Crest',
      description: 'Defeated the Function Lord and mastered code modularity.',
      imageUrl: 'https://skillforge.app/badges/functions.png',
      rarity: 'rare',
    },
  });

  const recBadge = await prisma.badge.create({
    data: {
      name: 'Recursion Caverns Relic',
      description: 'Defeated the Ghost of the Stack and mastered recursive calls.',
      imageUrl: 'https://skillforge.app/badges/recursion.png',
      rarity: 'epic',
    },
  });

  // 3. Seed Worlds
  const variablesWorld = await prisma.world.create({
    data: {
      name: 'Variables Kingdom',
      slug: 'variables-kingdom',
      description: 'Begin your programming journey by mastering variable declarations, memory concepts, and types.',
      orderIndex: 1,
      status: 'published',
      xpReward: 200,
      unlockCriteria: {},
    },
  });

  const conditionsWorld = await prisma.world.create({
    data: {
      name: 'Conditions Valley',
      slug: 'conditions-valley',
      description: 'Navigate code execution branches using if-else conditions, switch cases, and boolean logic.',
      orderIndex: 2,
      status: 'published',
      xpReward: 300,
      unlockCriteria: {
        required_topics: [
          { topic_id: 'variables', min_mastery: 0.6 }
        ]
      },
    },
  });

  const loopsWorld = await prisma.world.create({
    data: {
      name: 'Loop Forest',
      slug: 'loop-forest',
      description: 'Harness the power of repetitive execution using for, while, and do-while loops.',
      orderIndex: 3,
      status: 'published',
      xpReward: 400,
      unlockCriteria: {
        required_topics: [
          { topic_id: 'conditionals', min_mastery: 0.6 }
        ]
      },
    },
  });

  const arraysWorld = await prisma.world.create({
    data: {
      name: 'Array Arena',
      slug: 'array-arena',
      description: 'Master list storage, operations, and traversals inside the array colosseum.',
      orderIndex: 4,
      status: 'published',
      xpReward: 500,
      unlockCriteria: {
        required_topics: [
          { topic_id: 'loops', min_mastery: 0.6 }
        ]
      },
    },
  });

  const functionsWorld = await prisma.world.create({
    data: {
      name: 'Function Fortress',
      slug: 'function-fortress',
      description: 'Explore code reusability, function scopes, parameters, and return statements.',
      orderIndex: 5,
      status: 'published',
      xpReward: 500,
      unlockCriteria: {
        required_topics: [
          { topic_id: 'variables', min_mastery: 0.6 }
        ]
      },
    },
  });

  const recursionWorld = await prisma.world.create({
    data: {
      name: 'Recursion Caverns',
      slug: 'recursion-caverns',
      description: 'Descend into nested loops of calling functions and call stacks.',
      orderIndex: 6,
      status: 'published',
      xpReward: 600,
      unlockCriteria: {
        required_topics: [
          { topic_id: 'functions', min_mastery: 0.6 }
        ]
      },
    },
  });

  console.log('Seeded Worlds:', variablesWorld.name, conditionsWorld.name, loopsWorld.name, arraysWorld.name, functionsWorld.name, recursionWorld.name);

  // 4. Seed Lessons (Programmatic loop for all 4 language tracks)
  const languages: ('CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT')[] = ['CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT'];
  
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
      world: arraysWorld,
      lessons: [
        { title: 'Introduction to Arrays', topicTags: ['arrays'] },
        { title: 'Array Traversals', topicTags: ['arrays', 'loops'] },
        { title: 'Multi-dimensional Arrays', topicTags: ['arrays'] },
        { title: 'Dynamic Arrays', topicTags: ['arrays'] },
        { title: 'Common Array Operations', topicTags: ['arrays'] },
      ]
    },
    {
      world: functionsWorld,
      lessons: [
        { title: 'Introduction to Functions', topicTags: ['functions'] },
        { title: 'Parameters & Arguments', topicTags: ['functions'] },
        { title: 'Return Statements', topicTags: ['functions'] },
        { title: 'Scope & Shadowing', topicTags: ['functions', 'scope'] },
        { title: 'Function Overloading', topicTags: ['functions'] },
      ]
    },
    {
      world: recursionWorld,
      lessons: [
        { title: 'Introduction to Recursion', topicTags: ['recursion'] },
        { title: 'Base Cases', topicTags: ['recursion'] },
        { title: 'Call Stacks', topicTags: ['recursion'] },
        { title: 'Tree Recursion', topicTags: ['recursion'] },
        { title: 'Tail Recursion', topicTags: ['recursion'] },
      ]
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

  // 5. Seed Games (2+ per world)
  await prisma.game.createMany({
    data: [
      // Variables Kingdom
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
        name: 'Variables Constructor',
        gameType: 'ifelse_constructor',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 60,
        tier: 'free',
        topicTags: ['variables'],
        config: {
          puzzles: [
            { id: 'v_puz_1', question: 'Declare constant standard port', template: 'const port = ?', answer: '3001' }
          ]
        }
      },

      // Conditions Valley
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
        name: 'Valley Logic Builder',
        gameType: 'logic_builder',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['conditionals'],
        config: {
          available_blocks: ['if_condition', 'print_output', 'end_if']
        }
      },

      // Loop Forest
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
        name: 'BFS Explorer: Grid Traversal',
        gameType: 'bfs_explorer',
        orderIndex: 2,
        masteryContribution: 0.4,
        xpReward: 100,
        tier: 'free',
        topicTags: ['loops', 'graphs'],
        config: {},
      },

      // Array Arena
      {
        worldId: arraysWorld.id,
        name: 'Sliding Window Arena',
        gameType: 'sliding_window',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['arrays', 'sliding-window'],
        config: {
          puzzles: [
            { id: 'slide_1', question: 'Max sum of size 2 in [1, 2, 3, 4]', answer: '7' }
          ]
        }
      },
      {
        worldId: arraysWorld.id,
        name: 'Array Logic Builder',
        gameType: 'logic_builder',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['arrays'],
        config: {
          available_blocks: ['declare_variable', 'assign_value', 'print_output']
        }
      },

      // Function Fortress
      {
        worldId: functionsWorld.id,
        name: 'Function Workshop Castle',
        gameType: 'function_workshop',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['functions'],
        config: {
          puzzles: [
            { id: 'func_1', question: 'Provide parameter for sum(a, b)', answer: 'b' }
          ]
        }
      },
      {
        worldId: functionsWorld.id,
        name: 'Function Logic Builder',
        gameType: 'logic_builder',
        orderIndex: 2,
        masteryContribution: 0.3,
        xpReward: 70,
        tier: 'free',
        topicTags: ['functions'],
        config: {
          available_blocks: ['declare_variable', 'print_output']
        }
      },

      // Recursion Caverns
      {
        worldId: recursionWorld.id,
        name: 'Recursion Maze: Factorial Cavern',
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
        }
      },
      {
        worldId: recursionWorld.id,
        name: 'DFS Adventure: Deep Tunnel',
        gameType: 'dfs_adventure',
        orderIndex: 2,
        masteryContribution: 0.4,
        xpReward: 100,
        tier: 'free',
        topicTags: ['recursion', 'graphs'],
        config: {}
      }
    ],
  });

  console.log('Seeded Games.');

  // 6. Seed Boss Battles
  // Variables Kingdom Boss
  await prisma.bossBattle.create({
    data: {
      worldId: variablesWorld.id,
      name: 'Variables Overlord',
      level: 'mini',
      passThreshold: 0.8,
      xpReward: 120,
      badgeId: varBadge.id,
      questions: [
        {
          id: 'v_boss_q1',
          text: 'Which keyword defines a variable that cannot be reassigned?',
          options: ['let', 'var', 'const', 'set'],
          correctAnswer: 'const',
        },
        {
          id: 'v_boss_q2',
          text: 'What type is the value "100" in JavaScript?',
          options: ['Number', 'String', 'Boolean', 'Object'],
          correctAnswer: 'String',
        },
      ],
    },
  });

  // Conditions Valley Boss
  await prisma.bossBattle.create({
    data: {
      worldId: conditionsWorld.id,
      name: 'Valley Arbitrator',
      level: 'mini',
      passThreshold: 0.8,
      xpReward: 150,
      badgeId: condBadge.id,
      questions: [
        {
          id: 'c_boss_q1',
          text: 'What is the output of: if (false || true) { print("Yes") } else { print("No") }?',
          options: ['Yes', 'No', 'None', 'Error'],
          correctAnswer: 'Yes',
        },
        {
          id: 'c_boss_q2',
          text: 'Which statement ends execution of a switch case and prevents fallthrough?',
          options: ['return', 'break', 'exit', 'stop'],
          correctAnswer: 'break',
        },
      ],
    },
  });

  // Loop Forest Boss
  await prisma.bossBattle.create({
    data: {
      worldId: loopsWorld.id,
      name: 'Forest Sentinel',
      level: 'world',
      passThreshold: 0.8,
      xpReward: 200,
      badgeId: loopBadge.id,
      questions: [
        {
          id: 'l_boss_q1',
          text: 'Which loop is guaranteed to execute at least once?',
          options: ['for', 'while', 'do-while', 'foreach'],
          correctAnswer: 'do-while',
        },
        {
          id: 'l_boss_q2',
          text: 'What happens when a loop has no update expression or terminating condition?',
          options: ['It crashes the compiler', 'It creates an infinite loop', 'It runs exactly once', 'It pops stack calls'],
          correctAnswer: 'It creates an infinite loop',
        },
      ],
    },
  });

  // Array Arena Boss
  await prisma.bossBattle.create({
    data: {
      worldId: arraysWorld.id,
      name: 'Array Champion',
      level: 'world',
      passThreshold: 0.8,
      xpReward: 200,
      badgeId: arrayBadge.id,
      questions: [
        {
          id: 'a_boss_q1',
          text: 'What is the index of the first element in an array?',
          options: ['-1', '0', '1', 'Depends on language'],
          correctAnswer: '0',
        },
        {
          id: 'a_boss_q2',
          text: 'What is the time complexity to retrieve an element by index from a contiguous array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctAnswer: 'O(1)',
        },
      ],
    },
  });

  // Function Fortress Boss
  await prisma.bossBattle.create({
    data: {
      worldId: functionsWorld.id,
      name: 'Fortress Lord',
      level: 'world',
      passThreshold: 0.8,
      xpReward: 200,
      badgeId: funcBadge.id,
      questions: [
        {
          id: 'f_boss_q1',
          text: 'What is the main benefit of writing reusable functions?',
          options: ['Faster runtime', 'Avoid code duplication', 'Saves disk space', 'Secures memory'],
          correctAnswer: 'Avoid code duplication',
        },
        {
          id: 'f_boss_q2',
          text: 'What keyword sends a value back from a function to its caller?',
          options: ['send', 'output', 'return', 'give'],
          correctAnswer: 'return',
        },
      ],
    },
  });

  // Recursion Caverns Boss
  await prisma.bossBattle.create({
    data: {
      worldId: recursionWorld.id,
      name: 'Caverns Specter',
      level: 'world',
      passThreshold: 0.8,
      xpReward: 250,
      badgeId: recBadge.id,
      questions: [
        {
          id: 'r_boss_q1',
          text: 'What is the terminating condition in a recursive function called?',
          options: ['Stop limit', 'Base case', 'Break point', 'Static anchor'],
          correctAnswer: 'Base case',
        },
        {
          id: 'r_boss_q2',
          text: 'What exception occurs if a recursive function lacks a base case?',
          options: ['NullPointerException', 'StackOverflowError', 'OutOfMemoryError', 'SyntaxError'],
          correctAnswer: 'StackOverflowError',
        },
      ],
    },
  });

  console.log('Seeded Boss Battles.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function generateLessonContent(title: string, lang: string, worldSlug: string) {
  const introduction = `Welcome to the comprehensive, in-depth guide on ${title} specifically tailored for the ${lang} programming language. In this lesson, we will explore the underlying concepts, execution models, and compiler/interpreter behaviors that dictate how ${title.toLowerCase()} behaves in production-grade environments. Mastering this is crucial for software engineers, systems design, and competitive programming because it forms the foundational building block for constructing complex logic structures, optimization algorithms, and efficient data flows. As we advance through the material, pay close attention to the language-specific nuances, memory implications, and standard practices that differentiate ${lang} from other paradigms. This lesson is carefully structured to move you from a basic syntactic understanding to an advanced, systems-level mastery. We will cover the memory allocation strategies, scope resolution, lifetime states, and runtime optimizations that modern compilers perform under the hood. By the end of this module, you will not only be able to write correct code utilizing these constructs, but also reason about their runtime performance, CPU cache characteristics, and assembly or bytecode level representation. Let's begin our journey by analyzing the basic definitions and building a rock-solid conceptual mental model.`;

  const detailedExplanation = `To truly understand ${title}, we must dissect its core mechanics. Under the hood, the runtime environment manages resources in a specific way. For instance, in ${lang}, execution flow and memory layout play vital roles. If you are developing high-frequency trading systems, game engines, or highly scalable microservices, understanding these constraints allows you to optimize CPU cache lines, reduce overhead, and minimize memory footprint. We will examine the exact memory boundaries, scoping rules, and lifecycle phases. By analyzing assembly/bytecode equivalents and memory layout, we transition from high-level syntax awareness to low-level engineering intuition. Scoping determines the accessibility of variables and symbols at different points in your code. In block-scoped environments, variables reside within a strictly defined lexical environment, meaning they are pushed onto the execution stack frame when the block is entered and automatically popped off when execution leaves the block. Understanding this lifecycle is crucial for preventing memory leaks, variable shadowing bugs, and unexpected side effects in asynchronous operations. In heap-allocated paradigms, objects outlive the execution frame that created them, relying on garbage collectors or manual delete operations to reclaim memory. We will dive deep into these differences to ensure your code is both safe and performant.`;

  const deepDive = `Let's take a deep dive into the technical details. When a program runs, the execution stack and heap are managed dynamically. In ${lang}, this involves stack allocation, variable lifetimes, and reference handling. Specifically, for ${title}, the environment utilizes specialized registers or system-level APIs to achieve concurrency or data integrity. We must also analyze the algorithmic complexity: both time complexity (Big O notation) and space complexity of utilizing these primitives. Throughout this section, we will walk through diagrams representing memory state changes and register transitions, ensuring that your mental model aligns perfectly with the actual execution of the CPU. For instance, when a function call is executed, a new activation record (or stack frame) is pushed onto the call stack. This record contains the function's parameters, local variables, and the return address. In recursion, consecutive function calls continue to push stack frames, which can lead to stack overflow errors if a base case is not met or if the depth of recursion exceeds the stack size limit. Modern runtimes optimize tail calls to reuse stack frames, but this is highly compiler-dependent. We will look at how this behaves in ${lang} and explore compiler flags or optimization strategies to bypass physical limitations.`;

  const advancedConcepts = `Applying these concepts to real-world scenarios requires an understanding of edge cases and design patterns. For instance, handling null pointers, checking boundary conditions, and preventing buffer overflows or race conditions. In ${lang}, developers use standard libraries or built-in keywords to enforce compile-time safety or thread safety. We will look at how modern design principles like SOLID, clean code practices, and DRY (Don't Repeat Yourself) apply to ${title.toLowerCase()} implementations. This ensures not only that your code runs fast, but also that it remains maintainable, scalable, and readable for other developers in a team environment. In enterprise development, code is read far more often than it is written. Therefore, writing self-documenting code with clear variable names, logical structure, and comprehensive unit test coverage is a primary requirement. We will explore how to write robust unit tests for our ${title.toLowerCase()} structures, mocking external dependencies, and validating boundary inputs to prevent runtime failures. Furthermore, we will discuss design patterns such as the Singleton, Factory, and Strategy patterns, showing how they leverage these core primitives to solve common software engineering architectural challenges with elegance and simplicity.`;

  const optimization = `Optimization is the next frontier of mastering ${title}. In modern computing, CPU registers, L1/L2/L3 caches, and RAM form a hierarchical memory structure. To minimize cache misses, data should be stored contiguously in memory. We will discuss how ${lang} handles memory layout for arrays, objects, and structures, and how cache-friendly code can lead to orders of magnitude performance improvements. Furthermore, compiler optimization levels (such as -O2 or -O3 in compiled languages) can completely reorganize your code, unrolling loops, inlining functions, and eliminating dead code. We will inspect how write patterns affect the optimizer's ability to vectorize instructions, enabling SIMD (Single Instruction Multiple Data) execution. This section will empower you to write code that aligns harmoniously with hardware execution paths.`;

  const summary = `In summary, mastering ${title} in ${lang} involves a blend of syntactic knowledge, execution understanding, and engineering discipline. As you practice building programs in this language track, focus on writing clean, self-documenting code that adheres to standard style guides. Remember that local optimizations should never precede proper architectural decisions, but once a solid architecture is in place, understanding compiler behavior can give you that extra edge. Take the key takeaways to heart and review the common mistakes to avoid debugging headaches down the line. Continuous learning and regular code reviews are the keys to refining your engineering skills. By applying these guidelines, you will elevate your coding capabilities to build robust, scalable, and highly efficient software systems that stand the test of time and scale.`;

  // Code samples per language
  let codeSample = '';
  if (lang === 'CPP') {
    codeSample = `#include <iostream>\n#include <vector>\n#include <memory>\n\n// Demonstrating ${title} in C++\nint main() {\n    std::cout << "Starting execution for ${title}" << std::endl;\n    // Core logic goes here\n    int value = 42;\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    for(int num : numbers) {\n        std::cout << "Processing: " << num * value << std::endl;\n    }\n    return 0;\n}`;
  } else if (lang === 'JAVA') {
    codeSample = `import java.util.*;\n\npublic class ${title.replace(/[^a-zA-Z0-9]/g, '')}Demo {\n    public static void main(String[] args) {\n        System.out.println("Executing ${title} in Java");\n        int value = 42;\n        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);\n        for(int num : list) {\n            System.out.println("Processing: " + (num * value));\n        }\n    }\n}`;
  } else if (lang === 'PYTHON') {
    codeSample = `# Demonstrating ${title} in Python\ndef main():\n    print("Executing ${title} in Python")\n    value = 42\n    numbers = [1, 2, 3, 4, 5]\n    for num in numbers:\n        print(f"Processing: {num * value}")\n\nif __name__ == '__main__':\n    main()`;
  } else {
    codeSample = `// Demonstrating ${title} in JavaScript\nfunction main() {\n    console.log("Executing ${title} in JavaScript");\n    const value = 42;\n    const numbers = [1, 2, 3, 4, 5];\n    numbers.forEach(num => {\n        console.log(\`Processing: \${num * value}\`);\n    });\n}\nmain();`;
  }

  // Related games mapping
  let gameId = 'logic_builder';
  if (worldSlug === 'conditionals-pass') {
    gameId = 'ifelse_constructor';
  } else if (worldSlug === 'loops-valley') {
    gameId = 'loop_builder';
  } else if (worldSlug === 'arrays-arena') {
    gameId = 'sliding_window';
  } else if (worldSlug === 'recursion-caverns') {
    gameId = 'recursion_maze';
  }

  return {
    title: `${title} (${lang})`,
    subtitle: `Master the concepts of ${title.toLowerCase()} with ${lang} track.`,
    language_track: lang,
    sections: [
      { type: 'heading', content: `Introduction to ${title}` },
      { type: 'paragraph', content: introduction },
      { type: 'heading', content: 'Core Mechanics & Memory Layout' },
      { type: 'paragraph', content: detailedExplanation },
      { type: 'diagram', content: '[Memory Layout Diagram: Stack vs Heap allocation for ' + title + ']' },
      { type: 'heading', content: 'Deep Technical Analysis' },
      { type: 'paragraph', content: deepDive },
      { type: 'code', content: codeSample },
      { type: 'heading', content: 'Best Practices & Real-World Application' },
      { type: 'paragraph', content: advancedConcepts },
      { type: 'heading', content: 'Optimization & Hierarchy' },
      { type: 'paragraph', content: optimization },
      { type: 'heading', content: 'Summary & Next Steps' },
      { type: 'paragraph', content: summary }
    ],
    concept_check: [
      {
        question: `Which of the following is true about ${title} in ${lang}?`,
        options: [
          'It is allocated entirely on the registers.',
          'It follows standard scoping and lifecycle rules of ' + lang + '.',
          'It has no impact on execution complexity.',
          'It is deprecating in modern standards.'
        ],
        answer: 'It follows standard scoping and lifecycle rules of ' + lang + '.',
        explanation: `In ${lang}, ${title} adheres to the scoping rules (e.g. block scope, lexical scope) and lifecycle dynamics of the underlying runtime/compiler.`
      },
      {
        question: `What is the primary memory location for local primitives within ${title}?`,
        options: [
          'The Stack frame',
          'The Global heap',
          'Shared hardware registers only',
          'Secondary storage memory'
        ],
        answer: 'The Stack frame',
        explanation: 'Local variables and primitives created within function blocks are allocated on the thread stack frame for rapid access and automated cleanup on return.'
      },
      {
        question: `How does understanding ${title} contribute to better code execution?`,
        options: [
          'It guarantees absolute zero memory footprint.',
          'It helps developers optimize performance bottlenecks, prevent memory leaks, and write thread-safe logic.',
          'It renders testing and debugging completely obsolete.',
          'It shifts compiling tasks entirely to the client browser.'
        ],
        answer: 'It helps developers optimize performance bottlenecks, prevent memory leaks, and write thread-safe logic.',
        explanation: 'By understanding the memory and runtime characteristics, you write code that leverages compiler optimizations, prevents race conditions, and controls allocations.'
      }
    ],
    key_takeaways: [
      `Understanding the runtime execution stack and heap boundaries for ${title}.`,
      `Leveraging ${lang} language primitives to enforce compile-time safety and optimal clean execution.`,
      `Adhering to standard software patterns to ensure maintainability and readability.`,
      `Applying proper asymptotic analysis to evaluate performance profiles.`
    ],
    common_mistakes: [
      `Neglecting block-scoping or variable shadowing, leading to difficult-to-trace bugs.`,
      `Prematurely optimizing micro-logic instead of structuring scalable architecture.`,
      `Failing to validate inputs, leading to null pointer exceptions or stack overflows.`
    ],
    related_game_id: gameId,
    estimated_minutes: 15
  };
}
