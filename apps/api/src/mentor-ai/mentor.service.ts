import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { RedisService } from '../auth/redis.service';

@Injectable()
export class MentorService {
  private readonly logger = new Logger(MentorService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Send a chat message to the AI Mentor with context injection and plan-based limits
   */
  async sendMessage(userId: string, message: string, sessionId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found', details: {} } }, HttpStatus.UNAUTHORIZED);
    }

    const isPremium = user.plan === 'premium';

    // 1. Enforce message length limit (500 chars) for Free tier
    if (!isPremium && message.length > 500) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message exceeds the 500 character limit for the Free tier. Upgrade to Premium for unlimited length.',
            details: {},
          },
        },
        HttpStatus.BAD_REQUEST, // 400
      );
    }

    // 2. Enforce 10 messages/day rate-limit in Redis for Free tier
    if (!isPremium) {
      const limitKey = `mentor_chat_limit:${userId}`;
      
      // Calculate seconds remaining until midnight
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const secondsUntilMidnight = Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 1000));

      const count = await this.redisService.incrAndExpire(limitKey, secondsUntilMidnight);
      if (count > 10) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'PAYMENT_REQUIRED',
              message: 'Daily message limit reached (10 messages/day for Free tier). Upgrade to Premium for unlimited chat.',
              details: {},
            },
          },
          HttpStatus.PAYMENT_REQUIRED, // 402
        );
      }
    }

    // 3. Load model names with settings and routing fallbacks
    //
    // Free tier (user selects one):
    //   gemini-2.5-flash  — Google Gemini 2.5 Flash (direct)
    //   qwen-3            — Qwen3 via Groq
    //   llama-4-scout     — Llama 4 Scout via Groq
    //   deepseek-r1-free  — DeepSeek R1 via OpenRouter (free tier)
    //
    // Premium tier (user selects one, also has access to all free models):
    //   deepseek-r1-groq    — DeepSeek R1 via Groq (fast)
    //   llama-3.3-70b-groq  — Llama 3.3 70B via Groq
    //   deepseek-v3         — DeepSeek V3 via OpenRouter
    //   qwen-3-pro          — Qwen3 Pro via OpenRouter
    const FREE_MODELS = ['gemini-2.5-flash', 'qwen-3', 'llama-4-scout', 'deepseek-r1-free'];
    const PREMIUM_MODELS = ['deepseek-r1-groq', 'llama-3.3-70b-groq', 'deepseek-v3', 'qwen-3-pro', ...FREE_MODELS];

    let model = user.selectedModel;
    if (isPremium) {
      if (!model || !PREMIUM_MODELS.includes(model)) {
        model = process.env.PREMIUM_TIER_MODEL ?? 'deepseek-r1-groq';
      }
    } else {
      if (!model || !FREE_MODELS.includes(model)) {
        model = process.env.FREE_TIER_MODEL ?? 'gemini-2.5-flash';
      }
    }


    // 4. Retrieve student DLT state and mastery scores for context injection
    const dltState = await prisma.dltState.findUnique({ where: { userId } });
    const masteryScores = await prisma.masteryScore.findMany({ where: { userId } });
    const roadmap = await prisma.roadmap.findUnique({ where: { userId } });

    // 5. Construct context-aware system prompt (basic vs premium context splits)
    let systemPrompt = '';
    if (!isPremium) {
      const strongTopics = masteryScores
        .filter((s) => s.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => s.topicId);

      const weakTopics = masteryScores
        .filter((s) => s.score < 0.7)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((s) => s.topicId);

      systemPrompt = `You are the SkillForge AI Mentor (Free Tier).
You are mentoring the student: ${user.name} (Level ${dltState?.level ?? 1}, Goal: ${user.primaryGoal ?? 'Not Set'}).
Their top strong topics: ${strongTopics.join(', ') || 'None yet'}
Their weak topics to improve: ${weakTopics.join(', ') || 'None yet'}

Provide helpful, clear, and encouraging guidance. Keep answers relatively concise and highly technical.`;
    } else {
      systemPrompt = `You are the SkillForge AI Mentor, a premium programming growth coach.
You are mentoring the student: ${user.name} (Level ${dltState?.level ?? 1}, Goal: ${user.primaryGoal ?? 'Not Set'}, Plan: ${user.plan}).
Their current learning statistics:
- Overall Mastery: ${Math.round((dltState?.overallMastery ?? 0) * 100)}%
- Overall Retention: ${Math.round((dltState?.overallRetention ?? 0) * 100)}%
- Active Streak: ${user.streakCount} days
- Topic Masteries:
${masteryScores.length > 0 ? masteryScores.map((m) => `  * ${m.topicId}: Mastery: ${Math.round(m.score * 100)}%, Retention: ${Math.round(m.retentionScore * 100)}%`).join('\n') : '  * No topics attempted yet.'}

Their active roadmap steps:
${roadmap && Array.isArray(roadmap.steps) ? (roadmap.steps as any[]).map((s) => `  * ${s.title} (Status: ${s.status})`).join('\n') : '  * No active roadmap steps.'}

Provide helpful, clear, and encouraging guidance. Keep answers relatively concise and highly technical.
Direct them towards completing their next roadmap checkpoint.`;
    }

    // 6. Manage conversation history (Premium only)
    const resolvedSessionId = sessionId ?? 'session-' + Math.random().toString(36).substr(2, 9);
    const historyKey = `mentor_chat_history:${userId}:${resolvedSessionId}`;
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (isPremium) {
      const historyStrings = await this.redisService.lrange(historyKey, 0, 19); // last 20 messages (10 turns)
      history = historyStrings.map((s) => JSON.parse(s)).reverse();
    }

    // 7. Invoke LLM API
    const reply = await this.callLLM(model, systemPrompt, message, history);

    // Save user and assistant turns to Redis history list (Premium only)
    if (isPremium) {
      await this.redisService.lpush(historyKey, JSON.stringify({ role: 'user', content: message }));
      await this.redisService.lpush(historyKey, JSON.stringify({ role: 'assistant', content: reply }));
      await this.redisService.ltrim(historyKey, 0, 19);
      await this.redisService.expire(historyKey, 24 * 60 * 60); // 24 hours expiry
    }

    return {
      reply,
      session_id: resolvedSessionId,
    };
  }

  /**
   * Get AI Mentor usage details
   */
  async getUsage(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const isPremium = user?.plan === 'premium';
    const limitKey = `mentor_chat_limit:${userId}`;
    const countVal = await this.redisService.get(limitKey);
    const messagesToday = countVal ? parseInt(countVal, 10) : 0;

    return {
      messages_today: messagesToday,
      limit: isPremium ? 999999 : 10,
      is_premium: isPremium,
    };
  }

  /**
   * Helper to make LLM HTTP requests
   */
  private async callLLM(
    model: string,
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ): Promise<string> {
    const isTest = process.env.NODE_ENV === 'test';
    
    // Fallback if testing or no key configured
    if (isTest || (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)) {
      this.logger.log(`[LLM MOCK] Calling model: ${model}`);
      let mockReply = `[Mock AI Mentor response using ${model}]: Keep up the great work! Let's focus on mastering your next topic.`;
      const lastUserMsg = [...history].reverse().find((h) => h.role === 'user');
      if (lastUserMsg) {
        mockReply += ` (Context: I remember you said "${lastUserMsg.content}")`;
      }
      return mockReply;
    }

    try {
      if (model.startsWith('claude-')) {
        // Anthropic Claude call
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey ?? '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...history.map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
              { role: 'user', content: userMessage },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Claude API returned status ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        return data.content?.[0]?.text ?? 'I could not generate a response. Please try again.';
      } else {
        // OpenAI Chat completion call (supports gpt-4o, gemini-1.5-flash via OpenAI endpoint, or standard openai models)
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey ?? ''}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
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
        return data.choices?.[0]?.message?.content ?? 'I could not generate a response. Please try again.';
      }
    } catch (error) {
      this.logger.error('Error invoking LLM:', error);
      return 'I encountered an error communicating with my brain cells. Please try again in a moment!';
    }
  }
}
