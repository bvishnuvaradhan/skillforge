import { z } from 'zod';
import { Goal } from '@prisma/client';

export const updateGoalSchema = z.object({
  goal: z.nativeEnum(Goal),
});

export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;
