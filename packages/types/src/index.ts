export type UserRole = 'student' | 'mentor' | 'admin';
export type UserPlan = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  primaryGoal: string | null;
  onboardingComplete: boolean;
  streakCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CareerReadiness {
  codingReadiness: number;
  interviewReadiness: number;
  resumeScore: number;
  overallReadiness: number;
}

export interface DltState {
  id: string;
  userId: string;
  overallMastery: number;
  overallRetention: number;
  learningStyle: string | null;
  consistencyScore: number;
  careerReadiness: CareerReadiness;
  xpTotal: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasteryScore {
  id: string;
  userId: string;
  topicId: string;
  score: number;
  gameScore: number;
  assessmentScore: number;
  codingScore: number;
  interviewScore: number;
  retentionScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionScore {
  id: string;
  userId: string;
  topicId: string;
  retention: number;
  stability: number;
  lastReviewedAt: Date;
  nextReviewAt: Date;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export type RecommendationType = 'learn' | 'review' | 'practice' | 'interview' | 'career';
export type RecommendationStatus = 'active' | 'dismissed' | 'snoozed' | 'completed';

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  why: string;
  impact: number;
  effortMinutes: number;
  confidence: number;
  status: RecommendationStatus;
  cooldownUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  topicId: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  goal: string;
  steps: RoadmapStep[];
  currentStepIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface World {
  id: string;
  slug: string;
  name: string;
  description: string;
  orderIndex: number;
  status: 'active' | 'inactive';
  unlockCriteria: Record<string, unknown>;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InterviewType = 'ai' | 'human';
export type InterviewSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface InterviewSession {
  id: string;
  studentId: string;
  mentorId: string | null;
  type: InterviewType;
  interviewType: string;
  status: InterviewSessionStatus;
  recordingUrl: string | null;
  pricePaid: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  template: string;
  content: Record<string, unknown>;
  pdfUrl: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
