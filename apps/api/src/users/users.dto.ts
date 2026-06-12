import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(),
  avatarUrl: z.string().optional(),
  privacySetting: z.enum(['private', 'team', 'public'], {
    message: 'Privacy setting must be private, team, or public',
  }).optional(),
});

export const linkCodingProfileSchema = z.object({
  platform: z.enum(['leetcode', 'codeforces', 'codechef', 'github'], {
    message: 'Platform must be leetcode, codeforces, codechef, or github',
  }),
  username: z.string().min(1, { message: 'Username is required' }),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type LinkCodingProfileDto = z.infer<typeof linkCodingProfileSchema>;

// All valid model identifiers for the 4+4 AI model selection system
export const ALL_VALID_MODELS = [
  // Free tier models
  'gemini-2.5-flash',
  'qwen-3',
  'llama-4-scout',
  'deepseek-r1-free',
  // Premium tier models
  'deepseek-r1-groq',
  'llama-3.3-70b-groq',
  'deepseek-v3',
  'qwen-3-pro',
] as const;

export const updateSettingsSchema = z.object({
  selectedModel: z.enum(ALL_VALID_MODELS as unknown as [string, ...string[]]).optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;

