import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, ExamType } from '@skillforge/db';
import { DltWorkerService } from '../dlt/dlt-worker.service';

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // Easy Questions (Weight 1.0)
  {
    id: 'e1',
    text: 'What is the worst-case time complexity of searching for an element in an unsorted array of size n?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctAnswer: 'O(n)',
    difficulty: 'easy',
    topic: 'Arrays',
  },
  {
    id: 'e2',
    text: 'Which data structure operates on a Last-In, First-Out (LIFO) basis?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswer: 'Stack',
    difficulty: 'easy',
    topic: 'Stacks',
  },
  {
    id: 'e3',
    text: 'What is the time complexity of inserting an item at the beginning of a singly linked list (given head pointer)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 'O(1)',
    difficulty: 'easy',
    topic: 'Linked Lists',
  },
  {
    id: 'e4',
    text: 'Which data structure is typically used to implement Breadth-First Search (BFS)?',
    options: ['Stack', 'Queue', 'Heap', 'BST'],
    correctAnswer: 'Queue',
    difficulty: 'easy',
    topic: 'Graphs',
  },
  // Medium Questions (Weight 1.5)
  {
    id: 'm1',
    text: 'Which of the following sorting algorithms has a guaranteed O(n log n) worst-case time complexity?',
    options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],
    correctAnswer: 'Merge Sort',
    difficulty: 'medium',
    topic: 'Sorting',
  },
  {
    id: 'm2',
    text: 'What is the time complexity of searching for a node in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    difficulty: 'medium',
    topic: 'Trees',
  },
  {
    id: 'm3',
    text: 'Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights?',
    options: ['Kruskal\'s Algorithm', 'Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Prim\'s Algorithm'],
    correctAnswer: 'Dijkstra\'s Algorithm',
    difficulty: 'medium',
    topic: 'Graphs',
  },
  // Hard Questions (Weight 2.0)
  {
    id: 'h1',
    text: 'What is the worst-case space complexity of the Floyd-Warshall algorithm?',
    options: ['O(V)', 'O(V^2)', 'O(E)', 'O(V * E)'],
    correctAnswer: 'O(V^2)',
    difficulty: 'hard',
    topic: 'Graphs',
  },
  {
    id: 'h2',
    text: 'In a 0/1 Knapsack Dynamic Programming formulation, what is the recursive transition state?',
    options: [
      'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i-1]] + val[i-1])',
      'dp[i][w] = dp[i-1][w] + dp[i][w-wt[i]]',
      'dp[i] = dp[i-1] + val[i]',
      'dp[i] = max(dp[j] for j < i)'
    ],
    correctAnswer: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i-1]] + val[i-1])',
    difficulty: 'hard',
    topic: 'Dynamic Programming',
  },
  {
    id: 'h3',
    text: 'What is the time complexity of building a binary heap of size n from an arbitrary unsorted array?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
    correctAnswer: 'O(n)',
    difficulty: 'hard',
    topic: 'Heaps',
  },
];

@Injectable()
export class ExamsService {
  constructor(private readonly dltWorkerService: DltWorkerService) {}

  /**
   * List available mock exams
   */
  async listExams() {
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Adaptive Performance Exam',
        description: 'Dynamically adapts question difficulty based on your answers. Weight-based grading.',
        category: 'adaptive',
        durationMinutes: 30,
        totalQuestions: 6,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Full DSA Mock Exam',
        description: 'Comprehensive evaluation of Arrays, Linked Lists, Stacks, Trees, and Graphs.',
        category: 'full_dsa',
        durationMinutes: 30,
        totalQuestions: 6,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Competitive Programming Prep',
        description: 'Advanced dynamic programming, game theory, and network flows challenges.',
        category: 'competitive',
        durationMinutes: 30,
        totalQuestions: 6,
      },
    ];
  }

  /**
   * Start a new exam attempt
   */
  async startAttempt(userId: string, examId: string) {
    const exams = await this.listExams();
    const exam = exams.find((e) => e.id === examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const typeMapping: Record<string, ExamType> = {
      adaptive: ExamType.adaptive,
      full_dsa: ExamType.full_dsa,
      competitive: ExamType.competitive,
    };

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId,
        examType: typeMapping[exam.category] ?? ExamType.topic,
        answers: [],
        startedAt: new Date(),
        passed: false,
      },
    });

    // For adaptive exam, return the first easy question
    let question: ExamQuestion | null = null;
    if (exam.category === 'adaptive') {
      question = EXAM_QUESTIONS.find((q) => q.difficulty === 'easy') ?? null;
    } else {
      // For regular exams, return the first question (can be random or default)
      question = EXAM_QUESTIONS[0] ?? null;
    }

    return {
      attemptId: attempt.id,
      examType: attempt.examType,
      firstQuestion: question ? {
        id: question.id,
        text: question.text,
        options: question.options,
        topic: question.topic,
      } : null,
    };
  }

  /**
   * Submit an answer during adaptive assessment
   */
  async submitAnswer(attemptId: string, questionId: string, selectedAnswer: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.score !== null) {
      throw new BadRequestException('Exam attempt already submitted');
    }

    const question = EXAM_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      throw new BadRequestException('Question not found');
    }

    const correct = selectedAnswer === question.correctAnswer;
    const currentAnswers = attempt.answers as Array<{
      questionId: string;
      selectedAnswer: string;
      correct: boolean;
      difficulty: 'easy' | 'medium' | 'hard';
      topic: string;
    }>;

    // Avoid double answering the same question
    if (currentAnswers.some((a) => a.questionId === questionId)) {
      throw new BadRequestException('Question already answered');
    }

    // Save answer
    currentAnswers.push({
      questionId,
      selectedAnswer,
      correct,
      difficulty: question.difficulty,
      topic: question.topic,
    });

    // Determine target difficulty for next question
    let nextDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (attempt.examType === ExamType.adaptive) {
      if (correct) {
        if (question.difficulty === 'easy') nextDifficulty = 'medium';
        else if (question.difficulty === 'medium') nextDifficulty = 'hard';
        else nextDifficulty = 'hard';
      } else {
        if (question.difficulty === 'hard') nextDifficulty = 'medium';
        else if (question.difficulty === 'medium') nextDifficulty = 'easy';
        else nextDifficulty = 'easy';
      }
    } else {
      // Non-adaptive exams step through linearly
      const idx = EXAM_QUESTIONS.findIndex((q) => q.id === questionId);
      if (idx !== -1 && idx + 1 < EXAM_QUESTIONS.length) {
        nextDifficulty = EXAM_QUESTIONS[idx + 1]?.difficulty ?? 'easy';
      }
    }

    // Limit of 6 questions per exam
    const isFinished = currentAnswers.length >= 6;

    if (isFinished) {
      // 1. Calculate final adaptive score
      // Score = sum(correct * weight) / sum(total * weight)
      // Weights: easy = 1.0, medium = 1.5, hard = 2.0
      const difficultyWeights = { easy: 1.0, medium: 1.5, hard: 2.0 };
      
      let numerator = 0;
      let denominator = 0;

      for (const ans of currentAnswers) {
        const wt = difficultyWeights[ans.difficulty];
        denominator += wt;
        if (ans.correct) {
          numerator += wt;
        }
      }

      const finalScore = denominator > 0 ? numerator / denominator : 0.0;
      const passed = finalScore >= 0.60; // 60% passing threshold
      const timeTaken = attempt.startedAt 
        ? Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000) 
        : 60;

      // 2. XP Scales linearly: base (120 XP) * score
      const xpEarned = Math.round(120 * finalScore);

      const updated = await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          answers: currentAnswers,
          score: finalScore,
          maxScore: 1.0,
          passed,
          timeSeconds: timeTaken,
          submittedAt: new Date(),
        },
      });

      // 3. Queue DLT update
      const topicTags = Array.from(new Set(currentAnswers.map((a) => a.topic)));
      await this.dltWorkerService.enqueueDltUpdate({
        userId: attempt.userId,
        eventType: 'exam_attempt',
        topicTags: topicTags.length > 0 ? topicTags : ['Arrays', 'Stacks', 'Recursion'],
        score: finalScore,
        xpEarned,
      });

      return {
        correct,
        nextQuestion: null,
        completed: true,
        score: finalScore,
        xpEarned,
        attempt: updated,
      };
    }

    // Find next unanswered question matching target difficulty
    let nextQuestion = EXAM_QUESTIONS.find(
      (q) => q.difficulty === nextDifficulty && !currentAnswers.some((a) => a.questionId === q.id),
    );

    // Fallback if no matching difficulty question is left
    if (!nextQuestion) {
      nextQuestion = EXAM_QUESTIONS.find(
        (q) => !currentAnswers.some((a) => a.questionId === q.id),
      );
    }

    // Update database session answers array
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: currentAnswers,
      },
    });

    return {
      correct,
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        text: nextQuestion.text,
        options: nextQuestion.options,
        topic: nextQuestion.topic,
      } : null,
      completed: false,
    };
  }

  /**
   * Submit whole answers array (for non-adaptive exams)
   */
  async submitRegularExam(attemptId: string, answers: Array<{ questionId: string; selectedAnswer: string }>) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.score !== null) {
      throw new BadRequestException('Exam attempt already graded');
    }

    const gradedAnswers: any[] = [];
    let correctCount = 0;
    const difficultyWeights = { easy: 1.0, medium: 1.5, hard: 2.0 };
    let numerator = 0;
    let denominator = 0;

    for (const ans of answers) {
      const question = EXAM_QUESTIONS.find((q) => q.id === ans.questionId);
      if (!question) continue;

      const correct = ans.selectedAnswer === question.correctAnswer;
      if (correct) correctCount++;

      const wt = difficultyWeights[question.difficulty];
      denominator += wt;
      if (correct) {
        numerator += wt;
      }

      gradedAnswers.push({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        correct,
        difficulty: question.difficulty,
        topic: question.topic,
      });
    }

    const finalScore = denominator > 0 ? numerator / denominator : 0.0;
    const passed = finalScore >= 0.60;
    const timeTaken = attempt.startedAt 
      ? Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000) 
      : 120;

    const xpEarned = Math.round(120 * finalScore);

    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: gradedAnswers,
        score: finalScore,
        maxScore: 1.0,
        passed,
        timeSeconds: timeTaken,
        submittedAt: new Date(),
      },
    });

    const topicTags = Array.from(new Set(gradedAnswers.map((a) => a.topic)));
    await this.dltWorkerService.enqueueDltUpdate({
      userId: attempt.userId,
      eventType: 'exam_attempt',
      topicTags: topicTags.length > 0 ? topicTags : ['Arrays', 'Stacks', 'Recursion'],
      score: finalScore,
      xpEarned,
    });

    return {
      success: true,
      score: finalScore,
      xpEarned,
      attempt: updated,
    };
  }
}
