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
