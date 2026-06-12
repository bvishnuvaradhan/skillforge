import { z } from 'zod';

export const updateRecommendationSchema = z.object({
  action: z.enum(['dismiss', 'snooze']),
  snooze_days: z.number().optional().default(1),
});

export type UpdateRecommendationDto = z.infer<typeof updateRecommendationSchema>;
