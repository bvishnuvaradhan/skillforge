import { z } from 'zod';

export const setGoalSchema = z.object({
  goal: z.enum(['placements', 'competitive', 'dsa', 'interviews'], {
    message: 'Goal must be placements, competitive, dsa, or interviews',
  }),
  language_track: z.enum(['CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT'], {
    message: 'Language track must be CPP, JAVA, PYTHON, or JAVASCRIPT',
  }).optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().min(1, { message: 'question_id is required' }),
      answer: z.string().min(1, { message: 'answer is required' }),
    }),
    { message: 'Answers array is required' },
  ),
});

export type SetGoalDto = z.infer<typeof setGoalSchema>;
export type SubmitAssessmentDto = z.infer<typeof submitAssessmentSchema>;
