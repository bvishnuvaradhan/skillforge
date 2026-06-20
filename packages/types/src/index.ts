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

export type InterviewSessionType = 'ai' | 'human';
export type InterviewType = 'dsa' | 'coding' | 'system_design' | 'behavioral' | 'hr';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MentorRecommendation = 'ready' | 'needs_prep' | 'strong_candidate';
export type MentorVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ResumeTemplate = 'ats' | 'product' | 'fresher' | 'experienced';

export interface InterviewSession {
  id: string;
  studentId: string;
  mentorId: string | null;
  type: InterviewSessionType;
  interviewType: InterviewType;
  targetCompany: string | null;
  status: InterviewStatus;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  recordingUrl: string | null;
  recordingConsent: boolean;
  pricePaid: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewFeedback {
  id: string;
  sessionId: string;
  evaluatorId: string;
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string;
  improvements: string;
  nextSteps: string;
  recommendation: MentorRecommendation | null;
  createdAt: Date;
}

export interface MentorProfile {
  id: string;
  userId: string;
  bio: string;
  headline: string;
  expertise: string[];
  experienceYears: number;
  sessionPrice: number;
  sessionDurationMinutes: number;
  ratingAverage: number;
  ratingCount: number;
  rebookingRate: number;
  verificationStatus: MentorVerificationStatus;
  verifiedAt: Date | null;
  totalEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorAvailability {
  id: string;
  mentorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorReview {
  id: string;
  sessionId: string;
  studentId: string;
  mentorId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  template: ResumeTemplate;
  content: Record<string, unknown>;
  pdfUrl: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeScore {
  id: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  technicalScore: number;
  projectScore: number;
  completenessScore: number;
  interviewReadinessScore: number;
  suggestions: Record<string, unknown> | Array<unknown>;
  computedAt: Date;
}

export * from "./questions";

export interface AssessmentAnswer {
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
  topic: string;
}

export type ExamType = "ONBOARDING_ASSESSMENT" | "CHECKPOINT" | "REASSESSMENT" | "FINAL_EVALUATION" | "topic" | "full_dsa" | "competitive" | "company" | "adaptive";

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string | null;
  examType: ExamType;
  answers: AssessmentAnswer[];
  score: number | null;
  maxScore: number | null;
  passed: boolean;
  timeSeconds: number | null;
  topicScores: Record<string, number> | null;
  startedAt: Date | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
