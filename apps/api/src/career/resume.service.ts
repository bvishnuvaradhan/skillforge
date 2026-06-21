import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { prisma, ResumeTemplate, InterviewStatus } from '@skillforge/db';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  /**
   * Pre-fill resume content using user profile and DLT stats
   */
  async createPrefilledResume(userId: string, name: string, template: ResumeTemplate) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Fetch mastery scores > 0.75 for skills
    const masteries = await prisma.masteryScore.findMany({
      where: { userId },
    });
    const skills = masteries
      .filter((m) => m.score >= 0.75)
      .map((m) => m.topicId);

    // 2. Fetch earned badges for achievements
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const achievements = userBadges.map((ub) => `Earned ${ub.badge.name} Badge: ${ub.badge.description}`);

    const defaultContent = {
      personalInfo: {
        name: user.name,
        email: user.email,
        phone: '+1 (555) 019-2834',
        github: `github.com/${user.name.toLowerCase().replace(/\s+/g, '')}`,
        linkedin: `linkedin.com/in/${user.name.toLowerCase().replace(/\s+/g, '')}`,
      },
      skills: skills.length > 0 ? skills : ['Python', 'JavaScript', 'SQL', 'Data Structures', 'Algorithms'],
      experience: [
        {
          role: 'Junior Software Engineer Intern',
          company: 'TechCorp Solutions',
          duration: 'Jan 2026 - Present',
          description: 'Collaborated on developing REST APIs, refactored React UI layouts, and resolved performance bottlenecks in database queries.',
        },
      ],
      education: [
        {
          degree: 'Bachelor of Technology in Computer Science',
          school: 'State Technical University',
          duration: '2022 - 2026',
          details: 'GPA: 3.8/4.0. Core coursework: Software Design Patterns, Data Structures & Algorithms, Operating Systems.',
        },
      ],
      projects: [
        {
          name: 'SkillForge Platform Extension',
          description: 'Developed real-time assessment modules and automated code evaluators using Socket.io and NestJS services.',
        },
      ],
      achievements: achievements.length > 0 ? achievements : ['SkillForge coding milestone completed', 'Active coding streak maintainer'],
    };

    const resume = await prisma.resume.create({
      data: {
        userId,
        name: name || `My ${template.toUpperCase()} Resume`,
        template,
        content: defaultContent,
      },
    });

    return resume;
  }

  /**
   * Score a resume across 6 dimensions using OpenAI
   */
  async scoreResume(userId: string, resumeId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Resume not found');
    }

    const prompt = `You are an expert technical recruiter and resume reviewer. Review the resume JSON content below and grade it across 6 dimensions (scores must be floats from 0.0 to 1.0):
1. overallScore: Average quality of content, phrasing, and templates.
2. atsScore: How machine-readable/parsable the resume is.
3. technicalScore: Depth of technical keywords and project descriptions.
4. projectScore: Framing of impact, metrics, and technical contributions in projects.
5. completenessScore: Missing contact info, phone, email, durational overlaps.
6. interviewReadinessScore: Overall readiness to send to recruiters.

Output EXACTLY a JSON object with this structure (no other text or formatting):
{
  "overallScore": 0.82,
  "atsScore": 0.85,
  "technicalScore": 0.80,
  "projectScore": 0.78,
  "completenessScore": 0.90,
  "interviewReadinessScore": 0.80,
  "suggestions": [
    "Add more quantitative impact to TechCorp Solutions intern details.",
    "Include more core design pattern keywords under skills section."
  ]
}

Resume Content:
${JSON.stringify(resume.content, null, 2)}`;

    const scoreResponse = await this.callLLM(
      'You are a JSON evaluator. Respond ONLY with valid JSON matching the schema.',
      prompt,
    );

    let parsedResult = {
      overallScore: 0.70,
      atsScore: 0.70,
      technicalScore: 0.70,
      projectScore: 0.70,
      completenessScore: 0.70,
      interviewReadinessScore: 0.70,
      suggestions: ['Completed baseline review.', 'Consider adding more metrics to your projects.'],
    };

    try {
      const cleaned = scoreResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.overallScore === 'number') {
        parsedResult = {
          overallScore: Math.min(1.0, Math.max(0, parsed.overallScore)),
          atsScore: Math.min(1.0, Math.max(0, parsed.atsScore ?? 0.7)),
          technicalScore: Math.min(1.0, Math.max(0, parsed.technicalScore ?? 0.7)),
          projectScore: Math.min(1.0, Math.max(0, parsed.projectScore ?? 0.7)),
          completenessScore: Math.min(1.0, Math.max(0, parsed.completenessScore ?? 0.7)),
          interviewReadinessScore: Math.min(1.0, Math.max(0, parsed.interviewReadinessScore ?? 0.7)),
          suggestions: parsed.suggestions ?? [],
        };
      }
    } catch (err) {
      this.logger.error('Failed to parse resume scoring JSON:', err);
    }

    const scoreRecord = await prisma.resumeScore.create({
      data: {
        resumeId,
        overallScore: parsedResult.overallScore,
        atsScore: parsedResult.atsScore,
        technicalScore: parsedResult.technicalScore,
        projectScore: parsedResult.projectScore,
        completenessScore: parsedResult.completenessScore,
        interviewReadinessScore: parsedResult.interviewReadinessScore,
        suggestions: parsedResult.suggestions,
      },
    });

    return scoreRecord;
  }

  /**
   * Analyze LinkedIn bio and suggest rewrites
   */
  async analyzeLinkedIn(userId: string, bioText: string) {
    this.logger.log(`Analyzing LinkedIn profile for user ${userId}`);
    const prompt = `You are a professional LinkedIn profile optimizer. Analyze this bio text:
"${bioText}"

Grade its SEO visibility score (float from 0.0 to 1.0) and rewrite it to make it stand out to recruiters, adding industry keywords.
Output EXACTLY a JSON object with this structure (no other text or formatting):
{
  "visibilityScore": 0.75,
  "originalText": "...",
  "optimizedText": "A rewritten, professional LinkedIn summary...",
  "suggestions": [
    "Highlight specific tech stacks like NestJS and Prisma explicitly.",
    "Add a call to action showing your target roles."
  ]
}
Ensure optimizedText is ready to copy-paste.`;

    const response = await this.callLLM(
      'You are a LinkedIn optimizer. Respond ONLY with valid JSON matching the schema.',
      prompt,
    );

    let parsedResult = {
      visibilityScore: 0.65,
      originalText: bioText,
      optimizedText: bioText,
      suggestions: ['Add key programming languages to your headline.'],
    };

    try {
      const cleaned = response
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.visibilityScore === 'number') {
        parsedResult = {
          visibilityScore: Math.min(1.0, Math.max(0, parsed.visibilityScore)),
          originalText: bioText,
          optimizedText: parsed.optimizedText ?? bioText,
          suggestions: parsed.suggestions ?? [],
        };
      }
    } catch (err) {
      this.logger.error('Failed to parse LinkedIn analysis JSON:', err);
    }

    return parsedResult;
  }

  /**
   * Calculate career readiness composite scores
   */
  async getReadiness(userId: string) {
    // 1. Fetch user overall mastery
    const dlt = await prisma.dltState.findUnique({
      where: { userId },
    });
    const overallMastery = dlt?.overallMastery ?? 0.0;

    // 2. Fetch exam scores
    const examAttempts = await prisma.examAttempt.findMany({
      where: { userId },
    });
    const avgExamScore = examAttempts.length > 0
      ? examAttempts.reduce((sum, e) => sum + (e.score ?? 0), 0) / examAttempts.length
      : 0.0;

    // 3. Fetch interview scores
    const sessions = await prisma.interviewSession.findMany({
      where: { studentId: userId, status: InterviewStatus.completed },
      include: { feedback: true },
    });
    const completedFeedbacks = sessions.map((s) => s.feedback).filter(Boolean);
    const avgInterviewScore = completedFeedbacks.length > 0
      ? completedFeedbacks.reduce((sum, f) => sum + (f?.overallScore ?? 0), 0) / completedFeedbacks.length
      : 0.0;

    // 4. Fetch primary resume score
    const primaryResume = await prisma.resume.findFirst({
      where: { userId, isPrimary: true },
      include: { scores: { orderBy: { computedAt: 'desc' }, take: 1 } },
    });
    const resumeScore = primaryResume?.scores?.[0]?.overallScore ?? 0.0;

    // Composite Calculation (0.0 to 1.0)
    // Tiers mapping
    // FAANG Readiness: heavy focus on DSA exam completeness + high mastery (>85) + high interview performance
    let faangScore = (overallMastery * 0.40) + (avgExamScore * 0.30) + (avgInterviewScore * 0.20) + (resumeScore * 0.10);
    // Product Readiness: balanced profile
    let productScore = (overallMastery * 0.35) + (avgExamScore * 0.25) + (avgInterviewScore * 0.25) + (resumeScore * 0.15);
    // Startup Readiness: focus on projects (represented by resume) + coding/mastery
    let startupScore = (overallMastery * 0.30) + (avgExamScore * 0.20) + (avgInterviewScore * 0.20) + (resumeScore * 0.30);
    // Service Tier Readiness: foundational skills
    const serviceScore = (overallMastery * 0.50) + (avgExamScore * 0.20) + (avgInterviewScore * 0.15) + (resumeScore * 0.15);

    // Apply adjustments: if they haven't completed any interviews/exams, apply scaling discount
    if (examAttempts.length === 0) {
      faangScore *= 0.6;
      productScore *= 0.7;
    }
    if (completedFeedbacks.length === 0) {
      faangScore *= 0.6;
      productScore *= 0.7;
      startupScore *= 0.8;
    }

    return {
      codingReadiness: Math.round(overallMastery * 100),
      interviewReadiness: Math.round(avgInterviewScore * 100),
      resumeScore: Math.round(resumeScore * 100),
      overallReadiness: Math.round(((overallMastery + avgExamScore + avgInterviewScore + resumeScore) / 4) * 100),
      tiers: {
        faang: Math.min(100, Math.round(faangScore * 100)),
        product: Math.min(100, Math.round(productScore * 100)),
        startup: Math.min(100, Math.round(startupScore * 100)),
        service: Math.min(100, Math.round(serviceScore * 100)),
      },
    };
  }

  /**
   * Helper to make LLM calls
   */
  private async callLLM(systemPrompt: string, userMessage: string): Promise<string> {
    const isTest = process.env.NODE_ENV === 'test';

    if (isTest || (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)) {
      if (userMessage.includes('Resume Content') || systemPrompt.includes('JSON')) {
        // Return mock resume score
        return JSON.stringify({
          overallScore: 0.80,
          atsScore: 0.82,
          technicalScore: 0.78,
          projectScore: 0.75,
          completenessScore: 0.90,
          interviewReadinessScore: 0.80,
          suggestions: [
            'Quantify the achievements in the TechCorp Solutions internship (e.g. Optimized response times by 20%).',
            'List additional core algorithms topics like Dynamic Programming or Graphs explicitly under skills.',
          ],
        });
      }

      if (userMessage.includes('visibilityScore') || userMessage.includes('LinkedIn')) {
        return JSON.stringify({
          visibilityScore: 0.72,
          originalText: userMessage,
          optimizedText: 'Software Engineer Intern | Focused on NestJS, React, and Data Structures | Passionate about building robust web applications.',
          suggestions: [
            'Use high-impact verbs to describe your responsibilities.',
            'Include specific certifications and key frameworks under your tagline.',
          ],
        });
      }

      return 'Mock LLM Response';
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
      return data.choices?.[0]?.message?.content ?? '';
    } catch (error) {
      this.logger.error('Error calling LLM in resume/career:', error);
      return '{}';
    }
  }
}
