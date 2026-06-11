SKILLFORGE

Database Schema

Complete PostgreSQL schema — all tables, columns, types, and relationships

# Chapter 1: Schema Overview

SkillForge uses PostgreSQL as the primary database. The schema is organized into 8 domains: Auth & Users, Learning, Progress & Intelligence, Interviews, Career, Community, Institutional, and Platform Operations. All tables use UUID primary keys. Timestamps (created_at, updated_at) are on every table. Soft deletes (deleted_at) on user-facing tables.


[Table]
| DOMAIN MAP | ───────────────────────────────────────────────────────── | auth          → users, sessions, oauth_accounts | learning      → worlds, lessons, games, boss_battles, blockly_programs | progress      → user_progress, mastery_scores, retention_scores, dlt_states | intelligence  → recommendations, roadmaps, skill_dna, forecasts | interviews    → interview_sessions, interview_feedback, mentor_bookings | career        → resumes, resume_scores, career_readiness, exam_attempts | community     → teams, leaderboards, competitions, reports | institutional → institutions, cohorts, cohort_members | platform      → notifications, audit_logs, feature_flags |


# Chapter 2: Auth & Users

### TABLE: users


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NULLABLE | Null if OAuth-only user |
| name | VARCHAR(100) | NOT NULL | Display name |
| avatar_url | TEXT | NULLABLE | Profile picture URL |
| role | ENUM | NOT NULL: student|mentor|admin | Platform role |
| plan | ENUM | NOT NULL DEFAULT free: free|premium | Subscription tier |
| plan_expires_at | TIMESTAMPTZ | NULLABLE | Premium expiry date |
| primary_goal | ENUM | NULLABLE: placements|competitive|dsa|interviews | Onboarding goal |
| onboarding_complete | BOOLEAN | DEFAULT false | Onboarding flow done |
| streak_count | INTEGER | DEFAULT 0 | Current daily streak |
| last_active_at | TIMESTAMPTZ | NULLABLE | Last platform activity |
| privacy_setting | ENUM | DEFAULT private: private|team|public | Profile visibility |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete timestamp |


### TABLE: oauth_accounts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | OAuth account ID |
| user_id | UUID | FK → users.id, NOT NULL | Linked user |
| provider | ENUM | NOT NULL: google|github | OAuth provider |
| provider_id | VARCHAR(255) | NOT NULL | Provider's user ID |
| access_token | TEXT | NULLABLE | OAuth access token |
| refresh_token | TEXT | NULLABLE | OAuth refresh token |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Link creation time |


### TABLE: sessions


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Session ID |
| user_id | UUID | FK → users.id, NOT NULL | Session owner |
| token_hash | VARCHAR(255) | UNIQUE, NOT NULL | Hashed JWT token |
| expires_at | TIMESTAMPTZ | NOT NULL | Token expiry |
| ip_address | VARCHAR(45) | NULLABLE | Login IP |
| user_agent | TEXT | NULLABLE | Browser user agent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Session start |


### TABLE: coding_profiles


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Profile link ID |
| user_id | UUID | FK → users.id, NOT NULL | Linked user |
| platform | ENUM | NOT NULL: leetcode|codeforces|codechef|github | Platform name |
| username | VARCHAR(100) | NOT NULL | Username on the platform |
| solved_count | INTEGER | DEFAULT 0 | Total problems solved |
| rating | INTEGER | NULLABLE | Platform rating/rank |
| last_synced_at | TIMESTAMPTZ | NULLABLE | Last data sync time |
| raw_data | JSONB | NULLABLE | Raw imported profile data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Link creation time |


# Chapter 3: Learning Domain

### TABLE: worlds


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | World ID |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL slug e.g. graph-kingdom |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | NOT NULL | World description |
| order_index | INTEGER | NOT NULL | Position in world map |
| status | ENUM | DEFAULT draft: draft|published|archived | Visibility |
| unlock_criteria | JSONB | NOT NULL | Mastery thresholds required |
| xp_reward | INTEGER | DEFAULT 0 | XP for completing world |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |


### TABLE: lessons


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Lesson ID |
| world_id | UUID | FK → worlds.id, NOT NULL | Parent world |
| title | VARCHAR(200) | NOT NULL | Lesson title |
| content | JSONB | NOT NULL | Rich content blocks |
| order_index | INTEGER | NOT NULL | Order within world |
| estimated_minutes | INTEGER | DEFAULT 10 | Estimated read time |
| topic_tags | TEXT[] | NOT NULL | Knowledge graph topic IDs |
| status | ENUM | DEFAULT draft: draft|published | Visibility |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: games


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Game ID |
| world_id | UUID | FK → worlds.id, NOT NULL | Parent world |
| name | VARCHAR(200) | NOT NULL | Game name |
| game_type | ENUM | NOT NULL: logic_builder|loop_builder|bfs_explorer|dfs_adventure|recursion_maze|sliding_window|dp_builder|graph_puzzle|greedy_arena|ifelse_constructor|function_workshop | Game type |
| config | JSONB | NOT NULL | Game-specific configuration and puzzles |
| topic_tags | TEXT[] | NOT NULL | Related topic IDs |
| mastery_contribution | FLOAT | DEFAULT 0.3 | Weight in mastery calculation |
| xp_reward | INTEGER | DEFAULT 50 | XP on first completion |
| order_index | INTEGER | NOT NULL | Order within world |
| tier | ENUM | DEFAULT free: free|premium | Access tier |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: boss_battles


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Boss battle ID |
| world_id | UUID | FK → worlds.id, NOT NULL | Parent world |
| name | VARCHAR(200) | NOT NULL | Boss name e.g. Graph Conqueror |
| level | ENUM | NOT NULL: mini|world|grand | Boss tier |
| questions | JSONB | NOT NULL | Array of question objects |
| pass_threshold | FLOAT | DEFAULT 0.8 | Minimum score to pass |
| xp_reward | INTEGER | NOT NULL | XP on victory |
| badge_id | UUID | FK → badges.id, NULLABLE | Badge awarded on victory |
| requires_human_review | BOOLEAN | DEFAULT false | Grand boss human validation |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: blockly_programs


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Program ID |
| user_id | UUID | FK → users.id, NOT NULL | Program owner |
| name | VARCHAR(200) | NOT NULL DEFAULT Untitled | Program name |
| blocks_json | JSONB | NOT NULL | Serialized block structure |
| generated_code | JSONB | NULLABLE | Generated code per language |
| challenge_id | UUID | NULLABLE | Linked challenge if any |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last save time |


### TABLE: badges


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Badge ID |
| name | VARCHAR(100) | NOT NULL | Badge name |
| description | TEXT | NOT NULL | How to earn it |
| image_url | TEXT | NOT NULL | Badge image URL |
| rarity | ENUM | DEFAULT common: common|rare|epic|legendary | Badge rarity |
| is_secret | BOOLEAN | DEFAULT false | Hidden until earned |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


# Chapter 4: Progress & Intelligence Domain

### TABLE: user_world_progress


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Progress record ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| world_id | UUID | FK → worlds.id, NOT NULL | World |
| status | ENUM | DEFAULT locked: locked|unlocked|in_progress|completed | World status |
| unlocked_at | TIMESTAMPTZ | NULLABLE | When world was unlocked |
| completed_at | TIMESTAMPTZ | NULLABLE | When world was completed |
| lessons_completed | INTEGER | DEFAULT 0 | Count of completed lessons |
| games_completed | INTEGER | DEFAULT 0 | Count of completed games |
| xp_earned | INTEGER | DEFAULT 0 | XP earned in this world |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |


### TABLE: mastery_scores


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Score record ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| topic_id | VARCHAR(100) | NOT NULL | Knowledge graph topic ID |
| score | FLOAT | NOT NULL DEFAULT 0 | Mastery 0.0–1.0 |
| game_score | FLOAT | DEFAULT 0 | Weighted game contribution |
| assessment_score | FLOAT | DEFAULT 0 | Weighted assessment contribution |
| coding_score | FLOAT | DEFAULT 0 | Weighted coding contribution |
| interview_score | FLOAT | DEFAULT 0 | Weighted interview contribution |
| retention_score | FLOAT | DEFAULT 0 | Weighted retention contribution |
| last_activity_at | TIMESTAMPTZ | NULLABLE | Last relevant activity |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last recalculation |


### TABLE: retention_scores


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Retention record ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| topic_id | VARCHAR(100) | NOT NULL | Knowledge graph topic ID |
| retention | FLOAT | NOT NULL DEFAULT 1.0 | Current retention 0.0–1.0 |
| stability | FLOAT | NOT NULL DEFAULT 1.0 | Memory stability factor |
| last_reviewed_at | TIMESTAMPTZ | NOT NULL | Last review/activity |
| next_review_at | TIMESTAMPTZ | NOT NULL | Predicted optimal review time |
| review_count | INTEGER | DEFAULT 0 | Number of successful reviews |
| risk_level | ENUM | DEFAULT low: low|medium|high|critical | Forgetting risk |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |


### TABLE: dlt_states


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | DLT state ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | Student (one per user) |
| knowledge_state | JSONB | NOT NULL DEFAULT '{}' | Topics known: {topic_id: bool} |
| overall_mastery | FLOAT | DEFAULT 0 | Weighted average mastery |
| overall_retention | FLOAT | DEFAULT 0 | Weighted average retention |
| learning_style | ENUM | NULLABLE: visual|game_based|reading|problem_first | Inferred style |
| consistency_score | FLOAT | DEFAULT 0 | 0–1 regularity score |
| career_readiness | JSONB | DEFAULT '{}' | Readiness per company tier |
| placement_readiness | FLOAT | DEFAULT 0 | Overall placement readiness 0–1 |
| xp_total | INTEGER | DEFAULT 0 | Total XP earned |
| level | INTEGER | DEFAULT 1 | Current level |
| last_computed_at | TIMESTAMPTZ | DEFAULT NOW() | Last full recompute |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |


### TABLE: recommendations


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Recommendation ID |
| user_id | UUID | FK → users.id, NOT NULL | Target student |
| type | ENUM | NOT NULL: learn|review|practice|reinforce|interview|career|consistency | Rec type |
| title | VARCHAR(200) | NOT NULL | Short recommendation title |
| description | TEXT | NOT NULL | Full recommendation text |
| why | TEXT | NOT NULL | Explanation of trigger signal |
| impact | ENUM | NOT NULL: low|medium|high | Expected impact |
| effort_minutes | INTEGER | NOT NULL | Estimated effort |
| confidence | FLOAT | NOT NULL | AI confidence 0.0–1.0 |
| topic_id | VARCHAR(100) | NULLABLE | Related topic if any |
| action_url | TEXT | NULLABLE | Deep link to relevant page |
| status | ENUM | DEFAULT active: active|dismissed|snoozed|completed | Current status |
| snoozed_until | TIMESTAMPTZ | NULLABLE | Snooze expiry |
| cooldown_until | TIMESTAMPTZ | NULLABLE | Cannot re-show until |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Generation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last status change |


### TABLE: roadmaps


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Roadmap ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | Student (one active roadmap) |
| goal | ENUM | NOT NULL: placements|competitive|dsa|interviews | Current goal |
| steps | JSONB | NOT NULL | Ordered array of roadmap steps |
| current_step_index | INTEGER | DEFAULT 0 | Current position |
| generated_at | TIMESTAMPTZ | DEFAULT NOW() | Generation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last recalculation |


### TABLE: skill_dna


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | DNA record ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | Student |
| learning_style | ENUM | NULLABLE | Computed learning style |
| consistency_pattern | ENUM | NULLABLE: daily|bursty|irregular | Session pattern |
| exploration_behavior | ENUM | NULLABLE: deep|broad|balanced | Topic exploration style |
| strengths | TEXT[] | DEFAULT '{}' | Top mastery topics |
| weaknesses | TEXT[] | DEFAULT '{}' | Low mastery topics |
| growth_opportunities | TEXT[] | DEFAULT '{}' | Adjacent ready topics |
| computed_at | TIMESTAMPTZ | DEFAULT NOW() | Last computation |


### TABLE: forecasts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Forecast ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| type | ENUM | NOT NULL: topic_readiness|retention_risk|rating_growth|placement|interview | Forecast type |
| topic_id | VARCHAR(100) | NULLABLE | Topic if applicable |
| predicted_value | FLOAT | NOT NULL | Predicted metric value |
| predicted_at_date | DATE | NOT NULL | When prediction is for |
| confidence | FLOAT | NOT NULL | Forecast confidence 0–1 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When generated |


### TABLE: game_attempts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Attempt ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| game_id | UUID | FK → games.id, NOT NULL | Game played |
| score | FLOAT | NOT NULL | Score 0.0–1.0 |
| hints_used | INTEGER | DEFAULT 0 | Hints used |
| time_seconds | INTEGER | NOT NULL | Time to complete |
| passed | BOOLEAN | NOT NULL | Met pass threshold |
| attempt_number | INTEGER | DEFAULT 1 | Attempt count for this game |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Attempt timestamp |


### TABLE: boss_attempts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Attempt ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| boss_id | UUID | FK → boss_battles.id, NOT NULL | Boss fought |
| score | FLOAT | NOT NULL | Final score 0.0–1.0 |
| passed | BOOLEAN | NOT NULL | Met pass threshold |
| answers | JSONB | NOT NULL | All answers given |
| time_seconds | INTEGER | NOT NULL | Total time |
| attempt_number | INTEGER | DEFAULT 1 | Attempt count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Attempt timestamp |


### TABLE: user_badges


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Award record ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| badge_id | UUID | FK → badges.id, NOT NULL | Badge earned |
| earned_at | TIMESTAMPTZ | DEFAULT NOW() | Award timestamp |


# Chapter 5: Interviews Domain

### TABLE: interview_sessions


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Session ID |
| student_id | UUID | FK → users.id, NOT NULL | Student |
| mentor_id | UUID | FK → users.id, NULLABLE | Null for AI sessions |
| type | ENUM | NOT NULL: ai|human | Session type |
| interview_type | ENUM | NOT NULL: dsa|coding|system_design|behavioral|hr | Interview category |
| target_company | VARCHAR(100) | NULLABLE | Company if specified |
| status | ENUM | DEFAULT scheduled: scheduled|in_progress|completed|cancelled | Session status |
| scheduled_at | TIMESTAMPTZ | NULLABLE | Booking time |
| started_at | TIMESTAMPTZ | NULLABLE | Actual start |
| ended_at | TIMESTAMPTZ | NULLABLE | Actual end |
| recording_url | TEXT | NULLABLE | Interview recording URL |
| recording_consent | BOOLEAN | DEFAULT false | Student consented to recording |
| price_paid | DECIMAL(10,2) | NULLABLE | Amount paid (human sessions) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation |


### TABLE: interview_feedback


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Feedback ID |
| session_id | UUID | FK → interview_sessions.id, UNIQUE, NOT NULL | Linked session |
| evaluator_id | UUID | FK → users.id, NOT NULL | Mentor or AI system |
| technical_score | FLOAT | NOT NULL | 0.0–1.0 |
| problem_solving_score | FLOAT | NOT NULL | 0.0–1.0 |
| communication_score | FLOAT | NOT NULL | 0.0–1.0 |
| confidence_score | FLOAT | NOT NULL | 0.0–1.0 |
| overall_score | FLOAT | NOT NULL | Weighted composite |
| strengths | TEXT | NOT NULL | Observed strengths text |
| improvements | TEXT | NOT NULL | Improvement areas text |
| next_steps | TEXT | NOT NULL | Recommended actions |
| recommendation | ENUM | NULLABLE: ready|needs_prep|strong_candidate | Mentor verdict |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Submission time |


### TABLE: mentor_profiles


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Profile ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | Mentor user |
| bio | TEXT | NOT NULL | Professional bio |
| headline | VARCHAR(200) | NOT NULL | Short title |
| expertise | TEXT[] | NOT NULL | Expertise area tags |
| experience_years | INTEGER | NOT NULL | Years of experience |
| session_price | DECIMAL(10,2) | NOT NULL | Price per session |
| session_duration_minutes | INTEGER | DEFAULT 60 | Standard session length |
| rating_average | FLOAT | DEFAULT 0 | Average student rating |
| rating_count | INTEGER | DEFAULT 0 | Total ratings received |
| rebooking_rate | FLOAT | DEFAULT 0 | % students who rebooked |
| verification_status | ENUM | DEFAULT pending: pending|approved|rejected|suspended | Admin approval |
| verified_at | TIMESTAMPTZ | NULLABLE | Approval timestamp |
| total_earned | DECIMAL(12,2) | DEFAULT 0 | Lifetime earnings |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Profile creation |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |


### TABLE: mentor_availability


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Slot ID |
| mentor_id | UUID | FK → users.id, NOT NULL | Mentor |
| day_of_week | INTEGER | NOT NULL 0-6 | 0=Sunday |
| start_time | TIME | NOT NULL | Slot start time |
| end_time | TIME | NOT NULL | Slot end time |
| is_active | BOOLEAN | DEFAULT true | Slot currently available |


### TABLE: mentor_reviews


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Review ID |
| session_id | UUID | FK → interview_sessions.id, NOT NULL | Reviewed session |
| student_id | UUID | FK → users.id, NOT NULL | Reviewer |
| mentor_id | UUID | FK → users.id, NOT NULL | Reviewed mentor |
| rating | INTEGER | NOT NULL CHECK 1-5 | Star rating |
| comment | TEXT | NULLABLE | Written review |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Review time |


# Chapter 6: Career Domain

### TABLE: resumes


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Resume ID |
| user_id | UUID | FK → users.id, NOT NULL | Resume owner |
| name | VARCHAR(200) | DEFAULT My Resume | Resume name |
| template | ENUM | NOT NULL: ats|product|fresher|experienced | Template used |
| content | JSONB | NOT NULL | Full resume data structure |
| pdf_url | TEXT | NULLABLE | Generated PDF URL |
| is_primary | BOOLEAN | DEFAULT false | Active/primary resume |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last edit |


### TABLE: resume_scores


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Score record ID |
| resume_id | UUID | FK → resumes.id, NOT NULL | Scored resume |
| overall_score | FLOAT | NOT NULL | Composite score 0–100 |
| ats_score | FLOAT | NOT NULL | ATS compatibility |
| technical_score | FLOAT | NOT NULL | Technical strength |
| project_score | FLOAT | NOT NULL | Project quality |
| completeness_score | FLOAT | NOT NULL | Profile completeness |
| interview_readiness_score | FLOAT | NOT NULL | Interview readiness |
| suggestions | JSONB | NOT NULL | Array of improvement suggestions |
| computed_at | TIMESTAMPTZ | DEFAULT NOW() | Score computation time |


### TABLE: exam_attempts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Attempt ID |
| user_id | UUID | FK → users.id, NOT NULL | Student |
| exam_id | UUID | NOT NULL | Exam taken |
| exam_type | ENUM | NOT NULL: topic|full_dsa|competitive|company|adaptive | Exam category |
| answers | JSONB | NOT NULL | All submitted answers |
| score | FLOAT | NOT NULL | Final score 0.0–1.0 |
| passed | BOOLEAN | NOT NULL | Met pass threshold |
| time_seconds | INTEGER | NOT NULL | Total time taken |
| topic_scores | JSONB | NOT NULL | Score breakdown by topic |
| started_at | TIMESTAMPTZ | NOT NULL | Exam start |
| submitted_at | TIMESTAMPTZ | NOT NULL | Submission time |


# Chapter 7: Community & Institutional Domain

### TABLE: teams


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Team ID |
| name | VARCHAR(200) | NOT NULL | Team name |
| institution_id | UUID | FK → institutions.id, NULLABLE | Parent institution if any |
| created_by | UUID | FK → users.id, NOT NULL | Team creator |
| invite_code | VARCHAR(20) | UNIQUE, NOT NULL | Join code |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: team_members


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Membership ID |
| team_id | UUID | FK → teams.id, NOT NULL | Team |
| user_id | UUID | FK → users.id, NOT NULL | Member |
| role | ENUM | DEFAULT member: member|admin | Team role |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | Join timestamp |


### TABLE: competitions


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Competition ID |
| team_id | UUID | FK → teams.id, NULLABLE | Hosting team if internal |
| institution_id | UUID | FK → institutions.id, NULLABLE | Hosting institution |
| name | VARCHAR(200) | NOT NULL | Competition name |
| description | TEXT | NOT NULL | Details |
| starts_at | TIMESTAMPTZ | NOT NULL | Start time |
| ends_at | TIMESTAMPTZ | NOT NULL | End time |
| problems | JSONB | NOT NULL | Competition problems |
| status | ENUM | DEFAULT upcoming: upcoming|live|ended | Status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: competition_submissions


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Submission ID |
| competition_id | UUID | FK → competitions.id, NOT NULL | Competition |
| user_id | UUID | FK → users.id, NOT NULL | Submitter |
| problem_index | INTEGER | NOT NULL | Problem number |
| code | TEXT | NOT NULL | Submitted code |
| language | ENUM | NOT NULL: cpp|java|python | Language |
| verdict | ENUM | NULLABLE: accepted|wrong|tle|mle|re | Judge result |
| score | FLOAT | DEFAULT 0 | Points earned |
| submitted_at | TIMESTAMPTZ | DEFAULT NOW() | Submission time |
| is_flagged | BOOLEAN | DEFAULT false | Flagged for review |


### TABLE: reports


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Report ID |
| reporter_id | UUID | FK → users.id, NOT NULL | Who reported |
| reported_user_id | UUID | FK → users.id, NULLABLE | Reported user if any |
| category | ENUM | NOT NULL: spam|harassment|fake_mentor|cheating|other | Report category |
| description | TEXT | NOT NULL | Report details |
| evidence_url | TEXT | NULLABLE | Screenshot or link |
| status | ENUM | DEFAULT open: open|reviewing|resolved|dismissed | Admin status |
| resolved_by | UUID | FK → users.id, NULLABLE | Admin who resolved |
| resolved_at | TIMESTAMPTZ | NULLABLE | Resolution time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Report time |


### TABLE: institutions


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Institution ID |
| name | VARCHAR(200) | NOT NULL | Institution name |
| type | ENUM | NOT NULL: college|club|training | Institution type |
| plan | ENUM | DEFAULT basic: basic|enterprise | Licensing tier |
| license_expires_at | TIMESTAMPTZ | NOT NULL | License expiry |
| admin_user_id | UUID | FK → users.id, NOT NULL | Institution admin |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: cohorts


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Cohort ID |
| institution_id | UUID | FK → institutions.id, NOT NULL | Parent institution |
| name | VARCHAR(200) | NOT NULL | Cohort name e.g. Batch 2025 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |


### TABLE: cohort_members


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Membership ID |
| cohort_id | UUID | FK → cohorts.id, NOT NULL | Cohort |
| user_id | UUID | FK → users.id, NOT NULL | Member student |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | Join time |


# Chapter 8: Platform Operations Domain

### TABLE: notifications


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Notification ID |
| user_id | UUID | FK → users.id, NOT NULL | Recipient |
| type | ENUM | NOT NULL: memory|streak|interview|roadmap|inactivity|system|achievement | Nudge type |
| title | VARCHAR(200) | NOT NULL | Short title |
| body | TEXT | NOT NULL | Full message |
| action_url | TEXT | NULLABLE | Deep link |
| is_read | BOOLEAN | DEFAULT false | Read status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Sent time |


### TABLE: audit_logs


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Log entry ID |
| actor_id | UUID | FK → users.id, NULLABLE | Who performed the action |
| action | VARCHAR(100) | NOT NULL | Action e.g. user.suspend |
| target_type | VARCHAR(50) | NOT NULL | Table affected |
| target_id | UUID | NOT NULL | Row ID affected |
| metadata | JSONB | NULLABLE | Additional context |
| ip_address | VARCHAR(45) | NULLABLE | Actor IP |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Log timestamp |


### TABLE: feature_flags


[Table]
| Column | Type | Constraints | Description |
| id | UUID | PK | Flag ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Flag identifier |
| description | TEXT | NOT NULL | What it controls |
| is_enabled | BOOLEAN | DEFAULT false | Global toggle |
| enabled_for_plans | TEXT[] | DEFAULT '{}' | Plans with access |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last change |


# Chapter 9: Indexes & Key Constraints

Performance-critical indexes that must be created on all tables:

## 9.1 Primary Indexes

-- Auth

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE INDEX idx_coding_profiles_user ON coding_profiles(user_id);

-- Progress

CREATE INDEX idx_mastery_user ON mastery_scores(user_id);

CREATE INDEX idx_mastery_topic ON mastery_scores(topic_id);

CREATE INDEX idx_mastery_user_topic ON mastery_scores(user_id, topic_id);

CREATE INDEX idx_retention_user ON retention_scores(user_id);

CREATE INDEX idx_retention_next_review ON retention_scores(next_review_at);

CREATE INDEX idx_recommendations_user_status ON recommendations(user_id, status);

-- Interviews

CREATE INDEX idx_interview_student ON interview_sessions(student_id);

CREATE INDEX idx_interview_mentor ON interview_sessions(mentor_id);

CREATE INDEX idx_interview_status ON interview_sessions(status);

-- Community

CREATE INDEX idx_team_members_team ON team_members(team_id);

CREATE INDEX idx_team_members_user ON team_members(user_id);

CREATE INDEX idx_reports_status ON reports(status);

## 9.2 Unique Constraints

ALTER TABLE mastery_scores ADD CONSTRAINT unique_user_topic UNIQUE (user_id, topic_id);

ALTER TABLE retention_scores ADD CONSTRAINT unique_user_topic_ret UNIQUE (user_id, topic_id);

ALTER TABLE user_world_progress ADD CONSTRAINT unique_user_world UNIQUE (user_id, world_id);

ALTER TABLE user_badges ADD CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id);

ALTER TABLE team_members ADD CONSTRAINT unique_team_user UNIQUE (team_id, user_id);

ALTER TABLE cohort_members ADD CONSTRAINT unique_cohort_user UNIQUE (cohort_id, user_id);
