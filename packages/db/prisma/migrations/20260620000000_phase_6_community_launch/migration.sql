-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'mentor', 'admin');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('placements', 'competitive', 'dsa', 'interviews');

-- CreateEnum
CREATE TYPE "PrivacySetting" AS ENUM ('private', 'team', 'public');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'github');

-- CreateEnum
CREATE TYPE "CodingPlatform" AS ENUM ('leetcode', 'codeforces', 'codechef', 'github');

-- CreateEnum
CREATE TYPE "LearningStyle" AS ENUM ('visual', 'game_based', 'reading', 'problem_first');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('ONBOARDING_ASSESSMENT', 'CHECKPOINT', 'REASSESSMENT', 'FINAL_EVALUATION', 'topic', 'full_dsa', 'competitive', 'company', 'adaptive');

-- CreateEnum
CREATE TYPE "WorldStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('logic_builder', 'loop_builder', 'bfs_explorer', 'dfs_adventure', 'recursion_maze', 'sliding_window', 'dp_builder', 'graph_puzzle', 'greedy_arena', 'ifelse_constructor', 'function_workshop', 'stream_matching', 'type_sorter', 'echo_chamber', 'switchboard', 'factory_line', 'black_box_factory', 'mirror_halls', 'bug_hunt', 'object_foundry', 'wire_register', 'heap_heist', 'test_case_tower', 'constructor_chain', 'shape_shifter_arena', 'vault_keeper', 'interface_bridge', 'assembly_yard', 'pattern_forge', 'solid_foundations', 'refactor_run', 'code_review_court');

-- CreateEnum
CREATE TYPE "BossLevel" AS ENUM ('mini', 'world', 'grand');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- CreateEnum
CREATE TYPE "WorldProgressStatus" AS ENUM ('locked', 'unlocked', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "AccessTier" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "LanguageTrack" AS ENUM ('C', 'CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('learn', 'review', 'practice', 'reinforce', 'interview', 'career', 'consistency');

-- CreateEnum
CREATE TYPE "RecommendationImpact" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('active', 'dismissed', 'snoozed', 'completed');

-- CreateEnum
CREATE TYPE "ConsistencyPattern" AS ENUM ('daily', 'bursty', 'irregular');

-- CreateEnum
CREATE TYPE "ExplorationBehavior" AS ENUM ('deep', 'broad', 'balanced');

-- CreateEnum
CREATE TYPE "ForecastType" AS ENUM ('topic_readiness', 'retention_risk', 'rating_growth', 'placement', 'interview');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('memory', 'streak', 'interview', 'roadmap', 'inactivity', 'system', 'achievement');

-- CreateEnum
CREATE TYPE "InterviewSessionType" AS ENUM ('ai', 'human');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('dsa', 'coding', 'system_design', 'behavioral', 'hr');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "MentorRecommendation" AS ENUM ('ready', 'needs_prep', 'strong_candidate');

-- CreateEnum
CREATE TYPE "MentorVerificationStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "ResumeTemplate" AS ENUM ('ats', 'product', 'fresher', 'experienced');

-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('topic', 'full_dsa', 'competitive', 'company', 'adaptive');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('USER', 'MENTOR_PROFILE', 'COMMENT', 'INTERVIEW_SESSION');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "plan_expires_at" TIMESTAMP(3),
    "primary_goal" "Goal",
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "language_track" "LanguageTrack",
    "streak_count" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "privacy_setting" "PrivacySetting" NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "selected_model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "username" TEXT NOT NULL,
    "solved_count" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "last_synced_at" TIMESTAMP(3),
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dlt_states" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "knowledge_state" JSONB NOT NULL DEFAULT '{}',
    "overall_mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overall_retention" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "learning_style" "LearningStyle",
    "consistency_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "career_readiness" JSONB NOT NULL DEFAULT '{}',
    "placement_readiness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "last_computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dlt_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal" "Goal" NOT NULL,
    "steps" JSONB NOT NULL,
    "current_step_index" INTEGER NOT NULL DEFAULT 0,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_scores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "topic_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "game_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assessment_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coding_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interview_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mastery_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "exam_id" UUID,
    "exam_type" "ExamType" NOT NULL DEFAULT 'ONBOARDING_ASSESSMENT',
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "max_score" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "time_seconds" INTEGER,
    "topic_scores" JSONB,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worlds" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "status" "WorldStatus" NOT NULL DEFAULT 'draft',
    "unlock_criteria" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "world_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order_index" INTEGER NOT NULL,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 10,
    "topic_tags" TEXT[],
    "status" "LessonStatus" NOT NULL DEFAULT 'draft',
    "language_track" "LanguageTrack" NOT NULL DEFAULT 'JAVASCRIPT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "world_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "game_type" "GameType" NOT NULL,
    "config" JSONB NOT NULL,
    "topic_tags" TEXT[],
    "mastery_contribution" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "order_index" INTEGER NOT NULL,
    "tier" "AccessTier" NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_battles" (
    "id" UUID NOT NULL,
    "world_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" "BossLevel" NOT NULL,
    "questions" JSONB NOT NULL,
    "pass_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "xp_reward" INTEGER NOT NULL,
    "badge_id" UUID,
    "requires_human_review" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boss_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'common',
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_world_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "world_id" UUID NOT NULL,
    "status" "WorldProgressStatus" NOT NULL DEFAULT 'locked',
    "unlocked_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "games_completed" INTEGER NOT NULL DEFAULT 0,
    "original_problems_completed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_problems_completed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "drafts" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_world_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "time_seconds" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "boss_id" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "time_seconds" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boss_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_scores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "topic_id" TEXT NOT NULL,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "last_reviewed_at" TIMESTAMP(3) NOT NULL,
    "next_review_at" TIMESTAMP(3) NOT NULL,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'low',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retention_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "impact" "RecommendationImpact" NOT NULL,
    "effort_minutes" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "topic_id" TEXT,
    "action_url" TEXT,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'active',
    "snoozed_until" TIMESTAMP(3),
    "cooldown_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_dna" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "learning_style" "LearningStyle",
    "consistency_pattern" "ConsistencyPattern",
    "exploration_behavior" "ExplorationBehavior",
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "growth_opportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_dna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ForecastType" NOT NULL,
    "topic_id" TEXT,
    "predicted_value" DOUBLE PRECISION NOT NULL,
    "predicted_at_date" DATE NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "mentor_id" UUID,
    "type" "InterviewSessionType" NOT NULL,
    "interview_type" "InterviewType" NOT NULL,
    "target_company" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "recording_url" TEXT,
    "recording_consent" BOOLEAN NOT NULL DEFAULT false,
    "price_paid" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_feedback" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,
    "technical_score" DOUBLE PRECISION NOT NULL,
    "problem_solving_score" DOUBLE PRECISION NOT NULL,
    "communication_score" DOUBLE PRECISION NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "next_steps" TEXT NOT NULL,
    "recommendation" "MentorRecommendation",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bio" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "expertise" TEXT[],
    "experience_years" INTEGER NOT NULL,
    "session_price" DECIMAL(10,2) NOT NULL,
    "session_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "rating_average" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "rebooking_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verification_status" "MentorVerificationStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "total_earned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_availabilities" (
    "id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_reviews" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Resume',
    "template" "ResumeTemplate" NOT NULL,
    "content" JSONB NOT NULL,
    "pdf_url" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_scores" (
    "id" UUID NOT NULL,
    "resume_id" UUID NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "ats_score" DOUBLE PRECISION NOT NULL,
    "technical_score" DOUBLE PRECISION NOT NULL,
    "project_score" DOUBLE PRECISION NOT NULL,
    "completeness_score" DOUBLE PRECISION NOT NULL,
    "interview_readiness_score" DOUBLE PRECISION NOT NULL,
    "suggestions" JSONB NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_members" (
    "id" UUID NOT NULL,
    "cohort_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "share_data_consent" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "action_taken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "coding_profiles_user_id_idx" ON "coding_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dlt_states_user_id_key" ON "dlt_states"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_user_id_key" ON "roadmaps"("user_id");

-- CreateIndex
CREATE INDEX "mastery_scores_user_id_idx" ON "mastery_scores"("user_id");

-- CreateIndex
CREATE INDEX "mastery_scores_user_id_topic_id_idx" ON "mastery_scores"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_idx" ON "exam_attempts"("user_id");

-- CreateIndex
CREATE INDEX "exam_attempts_exam_type_idx" ON "exam_attempts"("exam_type");

-- CreateIndex
CREATE INDEX "exam_attempts_submitted_at_idx" ON "exam_attempts"("submitted_at");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_exam_type_submitted_at_idx" ON "exam_attempts"("user_id", "exam_type", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "worlds_slug_key" ON "worlds"("slug");

-- CreateIndex
CREATE INDEX "worlds_slug_idx" ON "worlds"("slug");

-- CreateIndex
CREATE INDEX "lessons_world_id_idx" ON "lessons"("world_id");

-- CreateIndex
CREATE INDEX "games_world_id_idx" ON "games"("world_id");

-- CreateIndex
CREATE INDEX "boss_battles_world_id_idx" ON "boss_battles"("world_id");

-- CreateIndex
CREATE INDEX "boss_battles_badge_id_idx" ON "boss_battles"("badge_id");

-- CreateIndex
CREATE INDEX "user_world_progress_user_id_idx" ON "user_world_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_world_progress_world_id_idx" ON "user_world_progress"("world_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_world_progress_user_id_world_id_key" ON "user_world_progress"("user_id", "world_id");

-- CreateIndex
CREATE INDEX "game_attempts_user_id_idx" ON "game_attempts"("user_id");

-- CreateIndex
CREATE INDEX "game_attempts_game_id_idx" ON "game_attempts"("game_id");

-- CreateIndex
CREATE INDEX "game_attempts_user_id_game_id_idx" ON "game_attempts"("user_id", "game_id");

-- CreateIndex
CREATE INDEX "boss_attempts_user_id_idx" ON "boss_attempts"("user_id");

-- CreateIndex
CREATE INDEX "boss_attempts_boss_id_idx" ON "boss_attempts"("boss_id");

-- CreateIndex
CREATE INDEX "boss_attempts_user_id_boss_id_idx" ON "boss_attempts"("user_id", "boss_id");

-- CreateIndex
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

-- CreateIndex
CREATE INDEX "user_badges_badge_id_idx" ON "user_badges"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE INDEX "retention_scores_user_id_idx" ON "retention_scores"("user_id");

-- CreateIndex
CREATE INDEX "retention_scores_next_review_at_idx" ON "retention_scores"("next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "retention_scores_user_id_topic_id_key" ON "retention_scores"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "recommendations_user_id_idx" ON "recommendations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_dna_user_id_key" ON "skill_dna"("user_id");

-- CreateIndex
CREATE INDEX "forecasts_user_id_idx" ON "forecasts"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_student_id_idx" ON "interview_sessions"("student_id");

-- CreateIndex
CREATE INDEX "interview_sessions_mentor_id_idx" ON "interview_sessions"("mentor_id");

-- CreateIndex
CREATE INDEX "interview_sessions_status_idx" ON "interview_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "interview_feedback_session_id_key" ON "interview_feedback"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_profiles_user_id_key" ON "mentor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohorts_invite_code_key" ON "cohorts"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_members_cohort_id_user_id_key" ON "cohort_members"("cohort_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_invite_code_key" ON "teams"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_profiles" ADD CONSTRAINT "coding_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dlt_states" ADD CONSTRAINT "dlt_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_scores" ADD CONSTRAINT "mastery_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_battles" ADD CONSTRAINT "boss_battles_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_battles" ADD CONSTRAINT "boss_battles_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_world_progress" ADD CONSTRAINT "user_world_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_world_progress" ADD CONSTRAINT "user_world_progress_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "boss_battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention_scores" ADD CONSTRAINT "retention_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_dna" ADD CONSTRAINT "skill_dna_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_availabilities" ADD CONSTRAINT "mentor_availabilities_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_reviews" ADD CONSTRAINT "mentor_reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_reviews" ADD CONSTRAINT "mentor_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_reviews" ADD CONSTRAINT "mentor_reviews_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_scores" ADD CONSTRAINT "resume_scores_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
