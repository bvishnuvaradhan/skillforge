import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { prisma, InterviewType, InterviewStatus, MentorRecommendation } from '@skillforge/db';
import { RedisService } from '../auth/redis.service';
import { DltWorkerService } from '../dlt/dlt-worker.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  code?: string;
  timestamp: string;
}

@Injectable()
export class AiInterviewService {
  private readonly logger = new Logger(AiInterviewService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly dltWorkerService: DltWorkerService,
  ) {}

  /**
   * Start a new AI interview session
   */
  async startSession(userId: string, interviewType: InterviewType, targetCompany?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, primaryGoal: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Retrieve mastery scores to identify weak topics (mastery < 0.75)
    const masteries = await prisma.masteryScore.findMany({
      where: { userId },
    });
    const weakTopics = masteries
      .filter((m) => m.score < 0.75)
      .map((m) => m.topicId);

    const weakTopicsStr = weakTopics.length > 0 ? weakTopics.join(', ') : 'general data structures and algorithms';

    // Create session in DB
    const session = await prisma.interviewSession.create({
      data: {
        studentId: userId,
        type: 'ai',
        interviewType,
        targetCompany: targetCompany ?? null,
        status: InterviewStatus.in_progress,
        startedAt: new Date(),
      },
    });

    // Generate initial greeting and question
    const systemPrompt = `You are a professional, helpful, but rigorous AI Technical Interviewer at SkillForge.
The candidate's name is ${user.name}.
Their primary learning goal is: ${user.primaryGoal ?? 'Software Engineering Placement'}.
Their focus areas/weak topics: ${weakTopicsStr}.
Target Company: ${targetCompany ?? 'Top Tech Companies'}.
Type of Interview: ${interviewType}.

Greet the candidate warmly, introduce yourself, and ask one initial technical question or coding problem related to their focus areas. Ask them to write code or explain their logic.
Keep your response professional and limit it to under 150 words.`;

    const initialGreeting = await this.callLLM(
      systemPrompt,
      'Let the interview begin. Introduce yourself and ask the first question.',
      [],
    );

    // Save initial message to chat history in Redis
    const history: ChatMessage[] = [
      {
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toISOString(),
      },
    ];
    await this.redisService.set(`interview_history:${session.id}`, JSON.stringify(history), 7200); // 2 hours expiration

    return {
      session,
      message: initialGreeting,
    };
  }

  /**
   * Handle user response message
   */
  async submitMessage(userId: string, sessionId: string, message: string, code?: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.studentId !== userId) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.status !== InterviewStatus.in_progress) {
      throw new BadRequestException('Interview is not in progress');
    }

    // Load history
    const historyRaw = await this.redisService.get(`interview_history:${sessionId}`);
    const history: ChatMessage[] = historyRaw ? JSON.parse(historyRaw) : [];

    // Append user message
    history.push({
      role: 'user',
      content: message,
      code,
      timestamp: new Date().toISOString(),
    });

    // Determine system prompt
    const systemPrompt = `You are a professional AI Technical Interviewer at SkillForge conducting a ${session.interviewType} interview.
Candidate target company: ${session.targetCompany ?? 'Top Tech'}.
Analyze the user's message and their code (if provided).
Provide constructive guidance, point out potential edge cases without giving away the direct answer immediately, and prompt them to finish or move to the next step.
Be encouraging but maintain high technical standards. Keep your feedback and next questions under 200 words.`;

    const nextResponse = await this.callLLM(
      systemPrompt,
      code ? `[Code Submission]:\n\`\`\`\n${code}\n\`\`\`\nUser message: ${message}` : message,
      history.slice(0, -1), // pass previous turns
    );

    // Append assistant response
    history.push({
      role: 'assistant',
      content: nextResponse,
      timestamp: new Date().toISOString(),
    });

    // Update history in Redis
    await this.redisService.set(`interview_history:${sessionId}`, JSON.stringify(history), 7200);

    return {
      message: nextResponse,
    };
  }

  /**
   * Complete interview and run DLT updates
   */
  async completeSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.studentId !== userId) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.status !== InterviewStatus.in_progress) {
      throw new BadRequestException('Interview session is not in progress');
    }

    // Load history
    const historyRaw = await this.redisService.get(`interview_history:${sessionId}`);
    const history: ChatMessage[] = historyRaw ? JSON.parse(historyRaw) : [];

    if (history.length < 2) {
      throw new BadRequestException('Cannot complete an empty interview session');
    }

    // Formulate prompt to grade
    const evaluationPrompt = `You are an expert technical interviewer evaluator. Analyze the technical interview transcript below and evaluate the candidate across 4 dimensions:
1. technicalScore: depth of technical knowledge, correctness of code.
2. problemSolvingScore: how they split the problem, algorithmic approach.
3. communicationScore: articulation, explanation of code, responsiveness to hints.
4. confidenceScore: composure, confidence in coding.

Scores must be floats between 0.0 and 1.0.
Output EXACTLY a JSON object in this format (no other text or markdown):
{
  "technicalScore": 0.8,
  "problemSolvingScore": 0.75,
  "communicationScore": 0.9,
  "confidenceScore": 0.85,
  "overallScore": 0.825,
  "strengths": "Provide a brief summary of their strengths",
  "improvements": "Provide a brief summary of what they can improve",
  "nextSteps": "Provide recommended next practice steps",
  "recommendation": "ready"
}
Note: recommendation must be one of: "ready", "needs_prep", "strong_candidate".

Transcript:
${history.map((h) => `${h.role.toUpperCase()}: ${h.content} ${h.code ? `\nCode:\n${h.code}` : ''}`).join('\n\n')}`;

    const scoreResponse = await this.callLLM(
      'You are a JSON evaluator. Respond ONLY with raw valid JSON matching the schema.',
      evaluationPrompt,
      [],
    );

    let parsedResult: {
      technicalScore: number;
      problemSolvingScore: number;
      communicationScore: number;
      confidenceScore: number;
      overallScore: number;
      strengths: string;
      improvements: string;
      nextSteps: string;
      recommendation: MentorRecommendation;
    } = {
      technicalScore: 0.70,
      problemSolvingScore: 0.70,
      communicationScore: 0.70,
      confidenceScore: 0.70,
      overallScore: 0.70,
      strengths: 'Completed practice session.',
      improvements: 'Review more edge cases.',
      nextSteps: 'Practice similar exercises on the practice board.',
      recommendation: MentorRecommendation.needs_prep,
    };

    try {
      // Strip markdown code block wrappers if any
      const cleaned = scoreResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.technicalScore === 'number') {
        parsedResult = {
          technicalScore: Math.min(1.0, Math.max(0, parsed.technicalScore)),
          problemSolvingScore: Math.min(1.0, Math.max(0, parsed.problemSolvingScore ?? 0.7)),
          communicationScore: Math.min(1.0, Math.max(0, parsed.communicationScore ?? 0.7)),
          confidenceScore: Math.min(1.0, Math.max(0, parsed.confidenceScore ?? 0.7)),
          overallScore: Math.min(1.0, Math.max(0, parsed.overallScore ?? 0.7)),
          strengths: parsed.strengths ?? 'Demonstrated coding skills.',
          improvements: parsed.improvements ?? 'Optimize execution time.',
          nextSteps: parsed.nextSteps ?? 'Keep practicing interview topics.',
          recommendation: parsed.recommendation as MentorRecommendation ?? MentorRecommendation.needs_prep,
        };
      }
    } catch (err) {
      this.logger.error('Failed to parse interview evaluation JSON response:', err);
    }

    // Save Feedback in DB
    const feedback = await prisma.interviewFeedback.create({
      data: {
        sessionId,
        evaluatorId: userId,
        technicalScore: parsedResult.technicalScore,
        problemSolvingScore: parsedResult.problemSolvingScore,
        communicationScore: parsedResult.communicationScore,
        confidenceScore: parsedResult.confidenceScore,
        overallScore: parsedResult.overallScore,
        strengths: parsedResult.strengths,
        improvements: parsedResult.improvements,
        nextSteps: parsedResult.nextSteps,
        recommendation: parsedResult.recommendation,
      },
    });

    // Update Session
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: InterviewStatus.completed,
        endedAt: new Date(),
      },
    });

    // Determine topic tags for DLT updates
    const topicTags = ['Arrays', 'Recursion', 'Sorting']; // Default interview categories
    
    // Enqueue DLT update
    // XP model resolution: flat 100 XP completion reward
    await this.dltWorkerService.enqueueDltUpdate({
      userId,
      eventType: 'interview_attempt',
      topicTags,
      score: parsedResult.overallScore,
      xpEarned: 100,
    });

    return {
      success: true,
      feedback,
    };
  }

  /**
   * Help call LLM (fetch to OpenAI/Claude)
   */
  private async callLLM(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    const isTest = process.env.NODE_ENV === 'test';
    
    if (isTest || (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)) {
      this.logger.log('[LLM MOCK] Generating mock response for AI interview');
      
      // If it looks like we are asking for scores (evaluation), return mock JSON
      if (userMessage.includes('technicalScore') || systemPrompt.includes('JSON')) {
        return JSON.stringify({
          technicalScore: 0.85,
          problemSolvingScore: 0.80,
          communicationScore: 0.90,
          confidenceScore: 0.85,
          overallScore: 0.85,
          strengths: 'Excellent algorithmic structure and clear communication.',
          improvements: 'Consider edge cases like null inputs and very large integer boundaries.',
          nextSteps: 'Practice Graph search algorithms and complexity analysis.',
          recommendation: 'strong_candidate',
        });
      }

      return `[Mock AI Interviewer]: Interesting response! Let's drill down into optimization. How would you solve this problem with O(N) time and O(1) space complexity?`;
    }

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey ?? ''}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map((h) => ({ role: h.role, content: h.content })),
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API returned status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content ?? 'Could you repeat that?';
    } catch (error) {
      this.logger.error('Error in callLLM:', error);
      return 'I had trouble processing that. Could you please clarify your answer?';
    }
  }
}
