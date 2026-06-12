import { z } from 'zod';

export const mentorChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  session_id: z.string().optional(),
});

export type MentorChatDto = z.infer<typeof mentorChatSchema>;
