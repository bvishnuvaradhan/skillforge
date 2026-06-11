import { z } from "zod";

export const goalSchema = z.object({
  goal: z.enum(["placements", "competitive", "dsa", "interviews"], "Please select a valid learning goal"),
});

export type GoalInput = z.infer<typeof goalSchema>;

export const assessmentAnswerSchema = z.object({
  question_id: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer value is required"),
});

export const assessmentSchema = z.object({
  answers: z.array(assessmentAnswerSchema).min(1, "Please provide at least one answer"),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
