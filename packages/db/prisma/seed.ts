import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with learning content...');

  // 1. Clean existing content
  await prisma.userBadge.deleteMany({});
  await prisma.bossAttempt.deleteMany({});
  await prisma.gameAttempt.deleteMany({});
  await prisma.userWorldProgress.deleteMany({});
  await prisma.bossBattle.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.lesson.deleteMany({});
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

  console.log('Seeded Badges.');

  // 3. Seed Worlds
  // World 1: Variables Kingdom
  const variablesWorld = await prisma.world.create({
    data: {
      name: 'Variables Kingdom',
      slug: 'variables-kingdom',
      description: 'Enter the realm of data storage and learn how variables, declarations, and types hold the key to code execution.',
      orderIndex: 1,
      status: 'published',
      xpReward: 200,
      unlockCriteria: {}, // First world, unlocked by default
    },
  });

  // World 2: Conditions Valley
  const conditionsWorld = await prisma.world.create({
    data: {
      name: 'Conditions Valley',
      slug: 'conditions-valley',
      description: 'Navigate the branching decisions of logic using If-Else statements and Switch blocks to direct execution flow.',
      orderIndex: 2,
      status: 'published',
      xpReward: 300,
      unlockCriteria: {
        topicPrerequisites: ['variables'],
        masteryThreshold: 0.6,
      },
    },
  });

  // World 3: Loop Forest
  const loopsWorld = await prisma.world.create({
    data: {
      name: 'Loop Forest',
      slug: 'loop-forest',
      description: 'Confront the repetitive tasks of coding. Master For and While loops to traverse directories and perform computations.',
      orderIndex: 3,
      status: 'published',
      xpReward: 400,
      unlockCriteria: {
        topicPrerequisites: ['conditionals'],
        masteryThreshold: 0.6,
      },
    },
  });

  console.log('Seeded Worlds.');

  // 4. Seed Lessons
  // Variables Kingdom Lessons
  await prisma.lesson.createMany({
    data: [
      {
        worldId: variablesWorld.id,
        title: 'Introduction to Variables',
        orderIndex: 1,
        estimatedMinutes: 8,
        topicTags: ['variables', 'data-types'],
        status: 'published',
        content: {
          blocks: [
            { type: 'header', content: 'What is a Variable?' },
            { type: 'paragraph', content: 'A variable is a container for storing data values. Think of it as a labeled box in your computer\'s memory where you can store integers, text, or complex objects.' },
            { type: 'code', content: 'let username = "SkillForgeCoder";\nconst port = 3001;' },
          ],
        },
      },
      {
        worldId: variablesWorld.id,
        title: 'Primitive Data Types',
        orderIndex: 2,
        estimatedMinutes: 10,
        topicTags: ['data-types'],
        status: 'published',
        content: {
          blocks: [
            { type: 'header', content: 'Strings, Numbers, and Booleans' },
            { type: 'paragraph', content: 'Programming languages categorize data values into types. Crucial types include String (text), Number (integers and decimals), and Boolean (true or false).' },
            { type: 'code', content: 'let active = true;\nlet score = 98.5;' },
          ],
        },
      },
    ],
  });

  // Conditions Valley Lessons
  await prisma.lesson.createMany({
    data: [
      {
        worldId: conditionsWorld.id,
        title: 'Decision Making with If-Else',
        orderIndex: 1,
        estimatedMinutes: 10,
        topicTags: ['conditionals'],
        status: 'published',
        content: {
          blocks: [
            { type: 'header', content: 'Branching Code Flow' },
            { type: 'paragraph', content: 'An if-else statement runs a block of code only if its condition evaluates to true. If false, it defaults to the else block.' },
            { type: 'code', content: 'if (score >= 60) {\n  console.log("Passed!");\n} else {\n  console.log("Try Again!");\n}' },
          ],
        },
      },
      {
        worldId: conditionsWorld.id,
        title: 'The Switch Statement',
        orderIndex: 2,
        estimatedMinutes: 8,
        topicTags: ['conditionals'],
        status: 'published',
        content: {
          blocks: [
            { type: 'header', content: 'Selecting Multi-branch Options' },
            { type: 'paragraph', content: 'For multiple clean branches, a switch statement compares a value against multiple cases.' },
            { type: 'code', content: 'switch (role) {\n  case "admin":\n    grantAccess();\n    break;\n  default:\n    denyAccess();\n}' },
          ],
        },
      },
    ],
  });

  // Loop Forest Lessons
  await prisma.lesson.createMany({
    data: [
      {
        worldId: loopsWorld.id,
        title: 'Loops: For & While',
        orderIndex: 1,
        estimatedMinutes: 12,
        topicTags: ['loops'],
        status: 'published',
        content: {
          blocks: [
            { type: 'header', content: 'Repetition in Code' },
            { type: 'paragraph', content: 'Loops repeat a section of code while a condition holds. A For loop is ideal for iterating a specific number of times. A While loop repeats while a condition stays true.' },
            { type: 'code', content: 'for (let i = 0; i < 5; i++) {\n  console.log("Repetition " + i);\n}' },
          ],
        },
      },
    ],
  });

  console.log('Seeded Lessons.');

  // 5. Seed Games
  // Variables Kingdom Game
  await prisma.game.create({
    data: {
      worldId: variablesWorld.id,
      name: 'Logic Builder: Variable Assignment',
      gameType: 'logic_builder',
      orderIndex: 1,
      masteryContribution: 0.3,
      xpReward: 60,
      tier: 'free',
      topicTags: ['variables'],
      config: {
        puzzles: [
          {
            id: 'v_puzzle_1',
            question: 'Assign the integer 42 to the variable age.',
            template: 'let age = ?;',
            answer: '42',
          },
          {
            id: 'v_puzzle_2',
            question: 'Declare a constant serverURL and assign the string "https://api.skillforge.app".',
            template: 'const serverURL = ?;',
            answer: '"https://api.skillforge.app"',
          },
        ],
      },
    },
  });

  // Conditions Valley Game
  await prisma.game.create({
    data: {
      worldId: conditionsWorld.id,
      name: 'If-Else Constructor: Simple Decisions',
      gameType: 'ifelse_constructor',
      orderIndex: 1,
      masteryContribution: 0.3,
      xpReward: 80,
      tier: 'free',
      topicTags: ['conditionals'],
      config: {
        puzzles: [
          {
            id: 'c_puzzle_1',
            question: 'Construct an if-else check that prints "Warm" if temperature > 25, else prints "Cold".',
            template: 'if (temp > 25) { ? } else { ? }',
            answer: ['print("Warm")', 'print("Cold")'],
          },
        ],
      },
    },
  });

  // Loop Forest Games (3 games)
  await prisma.game.createMany({
    data: [
      {
        worldId: loopsWorld.id,
        name: 'Loop Builder: Count to 10',
        gameType: 'loop_builder',
        orderIndex: 1,
        masteryContribution: 0.3,
        xpReward: 80,
        tier: 'free',
        topicTags: ['loops'],
        config: {
          puzzles: [
            {
              id: 'l_puzzle_1',
              question: 'Complete the loop configuration to execute exactly 10 times (from 0 to 9).',
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
        tier: 'premium',
        topicTags: ['loops', 'graphs'],
        config: {
          puzzles: [
            {
              id: 'bfs_puzzle_1',
              question: 'Which queue operation is executed first in a standard BFS traversal?',
              template: 'queue.?()',
              answer: 'enqueue',
            },
          ],
        },
      },
      {
        worldId: loopsWorld.id,
        name: 'Recursion Maze: Factorial Escape',
        gameType: 'recursion_maze',
        orderIndex: 3,
        masteryContribution: 0.4,
        xpReward: 100,
        tier: 'premium',
        topicTags: ['loops', 'recursion'],
        config: {
          puzzles: [
            {
              id: 'rec_puzzle_1',
              question: 'Complete the base case for factorial recursion (factorial of 0 returns 1).',
              template: 'if (n === 0) return ?;',
              answer: '1',
            },
          ],
        },
      },
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
