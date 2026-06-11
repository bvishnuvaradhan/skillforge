# Phase 2 Summary — Core Learning Loop

This document serves as a permanent, read-only record of the work completed, decisions made, and problems solved during **Phase 2 — Core Learning Loop** of the SkillForge ecosystem.

---

## 1. What Was Built

### Monorepo Infrastructure
- **Docker Compose Setup**: Configured `docker-compose.yml` in the project root to spin up a local Neo4j database instance on port `7687` for the knowledge graph.
- **Environment Configurations**: Added prerequisite Neo4j environment variable placeholders (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`) to all `.env.example` templates.

### Database Schema & Seeding (`packages/db`)
- **Prisma Schema Expansion**: Added enums and database models for:
  - `World`, `Lesson`, `Game`, `BossBattle`, `Badge` (representing learning tracks, content, puzzles, and rewards).
  - `UserWorldProgress`, `GameAttempt`, `BossAttempt`, `UserBadge` (representing user progress tracking, puzzle attempts, boss battles, and earned badges).
- **Seeding Module**: Implemented [seed.ts](file:///d:/projects/skillforge/packages/db/prisma/seed.ts) to populate:
  - 3 initial worlds: Variables Kingdom, Conditions Valley, Loop Forest.
  - 5 interactive lessons, 5 logic puzzle games (using structural JSON validation templates), 3 world bosses, and 3 custom badges.

### Backend Services (`apps/api`)
- **Neo4j Node Initialization**: Implemented `Neo4jService` to connect to the graph database, index topic nodes, and insert prerequisite edges (e.g. `loops` depends on `conditions`).
- **Dynamic Onboarding Mastery**: Refactored `onboarding.service.ts` to compute genuine initial mastery scores using the correct-to-total answer ratio per topic from diagnostic assessment `exam_attempts` rather than hardcoded mock baseline values.
- **Worlds API**:
  - `GET /v1/worlds`: World list overview with user progress states.
  - `GET /v1/worlds/:slug`: World details (enforces `403 Forbidden` if locked).
  - `POST /v1/worlds/:slug/lessons/:id/complete`: Marks a lesson complete, grants 25 XP, and enqueues a DLT update.
- **Games API**:
  - `POST /v1/games/:id/submit`: Structural JSON validation against template keys (e.g., checking for `blocks`, `connections`, and `output_node` keys on `logic_builder`). Records attempts and enqueues DLT updates.
- **Boss Battles API**:
  - `POST /v1/boss/:id/submit`: Grades MCQ responses. If failed, locks retries via Redis for 1 hour. If passed, awards badges and sets world progress status to completed.
- **DLT Asynchronous Worker**:
  - Built `DltWorkerService` using BullMQ to recalculate mastery scores, handle streak increments/resets, execute the 7-step world unlock conditions, and broadcast events.
- **Real-Time Gateway**:
  - Implemented Socket.io support to emit real-time event updates for `dlt_updated`, `world_unlocked`, and `badge_earned` directly to the client.
- **DLT Query Endpoints**:
  - `GET /v1/dlt/me`: Fetches overall level, XP, streak, and overall mastery/retention.
  - `GET /v1/mastery`: Fetches detailed mastery scores per topic.

### Frontend Application (`apps/web`)
- **Dashboard widgets**: Created `/dashboard` featuring exactly 5 responsive widgets:
  1. *XP & Level*: Levels and progress meters showing next level thresholds.
  2. *Daily Streak*: Flame animations indicating streak counts and milestones.
  3. *World Progress*: World list tracking completed lessons and XP.
  4. *Roadmap Preview*: Interactive track showing steps and estimated days.
  5. *Recommendations Feed*: High-impact tasks to execute.
- **Interactive World Map**: `/worlds` renders a beautiful connect-the-dots map showing locked, unlocked, in-progress, and completed tracks.
- **World Detail Page**: `/worlds/[slug]` renders the lesson flow, game levels, and boss portal.
- **Lesson Reader**: `/worlds/[slug]/lesson/[id]` renders slide content sections (headings, paragraphs, code blocks).
- **Game Arena**: `/worlds/[slug]/game/[id]` implements visual game puzzles and drag-and-drop validations.
- **Boss Fight Portal**: `/worlds/[slug]/boss/[id]` features MCQ submission panels, cooldown countdowns, and red/orange glowing aesthetic effects.

---

## 2. Key Decisions Made

1. **State-Persisted Progress Checks**:
   - Chose to store world progress state in a dedicated `user_world_progress` table for fast, index-driven checks instead of parsing logs dynamically on every request.
2. **Structural JSON validation**:
   - Decided to grade visual games on backend templates (e.g. `ifelse_constructor` requires `condition_blocks`, `true_branch`, `false_branch`) to verify structural correctness without exposing the server to code compilation vulnerabilities.
3. **Redis Cooldown Locks**:
   - Leveraged Redis keys with a TTL of 3600 seconds (`boss_cooldown:${userId}:${bossId}`) to securely enforce boss battle retake delay restrictions.
4. **BullMQ Asynchronous updates**:
   - Handled DLT mastery formulas, level calculations, streaks, and unlock evaluations asynchronously via a background worker, avoiding request thread blockages.
5. **Route-Level Locked Checks**:
   - Hardened worlds API routes to return `403 Forbidden` for locked worlds, ensuring students cannot fetch contents for worlds they haven't unlocked.

---

## 3. Problems Encountered & Solutions

### Frontend Import Resolution Issues
- **Problem**: Next.js route groups like `(app)` threw type compilation warnings when trying to locate relative modules like `../../lib/api`.
- **Solution**: Updated all imports inside route folders to use standard absolute alias paths (`@/lib/api`).

### MCQ Key Casing Mismatch
- **Problem**: The database seed script saved MCQ answers using `correctAnswer` (camelCase) while the grading service checked for `correct_answer` (snake_case), causing correct submissions to fail.
- **Solution**: Refactored the boss service parser to check for both `correctAnswer` and `correct_answer`.

### Jest Open Handles in E2E tests
- **Problem**: Jest test runner failed to exit gracefully due to open connections maintained by BullMQ queue worker pools and Redis cache streams.
- **Solution**: Added strict lifecycle listeners to shutdown services (`OnModuleDestroy` hooks closing BullMQ queues/workers) and closed database client connections cleanly in test teardowns.

---

## 4. What Was Deferred & Why

1. **Adaptive Recommendation Arbitrator**:
   - **Reason**: The candidate generation, cooldown checking, and sorting of top-7 recommendations will be fully completed in Phase 3.
2. **Advanced Games Gameplay**:
   - **Reason**: The BFS Explorer, DFS Adventure, and Recursion Maze routes are set up and structured, but their visual step-by-step gameboards are deferred to Phase 4.

---

## 5. State of Codebase at Completion

- **Compilation**: Backend and frontend compile and build cleanly with zero type errors.
- **Testing**: 100% of integration E2E test suites (Auth, Onboarding, Users, App, OAuth, and the new **Learning Loop** suite) pass successfully (49 tests total).
- **Database**: PostgreSQL Prisma schema synced, Neo4j knowledge nodes initialized, and Redis caching active.
