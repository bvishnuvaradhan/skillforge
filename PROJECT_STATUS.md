SkillForge — Project Status
Last updated: June 12, 2026
Current phase: Phase 4A — Roadmaps Restructure (not started)
Overall progress: Phase 3 of 6 complete

Phase 1 — Foundation
Completed

- Monorepo Setup — Turborepo initialized with workspaces: apps/web, apps/api, apps/ai, packages/db, packages/types, packages/ui, packages/tsconfig, packages/eslint-config
- Shared configuration packages — packages/tsconfig and packages/eslint-config created and integrated across workspaces
- Backend Scaffold — NestJS project scaffolded with strict TypeScript, configured to extend shared config, and GET /health endpoint implemented and verified
- Frontend Scaffold — Next.js 14 App Router project scaffolded and configured to extend shared config
- AI Service Scaffold — FastAPI Python service scaffolded in apps/ai with GET /health endpoint and requirements.txt
- Environment Variables — .env.example files created in apps/web, apps/api, and apps/ai documentation from agents.md
- CI/CD pipeline — GitHub Actions workflow (.github/workflows/ci.yml) created for automated linting and build verification
- Database Schema — Prisma schema redesigned and pushed to PostgreSQL with users, oauth_accounts, sessions, coding_profiles, and exam_attempts tables, using UUID primary keys and compound indexes, verified using a read/write test script
- Auth Layer — Register, Login (with rate-limiting), Logout (with Redis blacklist token check), Refresh Token Rotation, JWT Strategy, and NestJS Auth/Roles Guards (fully verified with 15 passing E2E tests)
- User Profile API — Fetching current user (`GET /users/me`), updating profile (`PATCH /users/me`), soft account deletion (`DELETE /users/me`), and public/private controls on profile retrieval (`GET /users/:id/profile`) (fully verified with E2E tests)
- Coding Profiles — Manual platform linking (`POST /users/me/coding-profiles`) and unlinking (`DELETE /users/me/coding-profiles/:platform`) for students (fully verified with E2E tests)
- Onboarding Flow — Assessment setup (`POST /onboarding/assessment`), primary goal setting (`POST /onboarding/goal`), and onboarding completion (`POST /onboarding/complete`) which initializes DltState and Roadmap tracks (fully verified with E2E tests)
- OAuth Integration — Google and GitHub OAuth authentication integration with automatic account linking, httpOnly cookie state propagation, and callback redirection (fully verified and tested)
- Landing Page — Marketing landing page composed of all premium UI sections (fully verified)
- Login + Signup Pages — Authentication pages with validation, error messages, and OAuth buttons (fully verified)
- Staging Deployment — Railway + Vercel deployment setups and environment configurations configured

Phase 2 — Core Learning Loop
Completed

- docker-compose.yml — Added root docker-compose for Neo4j database on port 7687
- Extended Prisma Schema — Synced enums and models representing worlds, lessons, games, boss battles, user badges, and progress tracking
- Database Seeding — Complete seed script populating 3 initial worlds, lessons, structured game templates, bosses, and badges
- Neo4j Knowledge Graph — Initialized topic nodes and prerequisite relationships (e.g. loops requires conditionals) via MERGE query execution
- Dynamic Onboarding Mastery — Compute initial mastery scores based on correct answers in diagnostic assessments instead of mock baseline values
- Worlds, Lessons, Games, & Boss API Endpoints — Implemented GET worlds overview, world details (enforcing 403 checks for locked worlds), lesson readers, game structural submission validation, and MCQ boss battle grading with Redis-backed cooldown controls
- Asynchronous DLT Recomputation Worker — Built a BullMQ queue listener processing mastery formulas, streak calculations, XP, levels, and evaluating world unlock conditions
- Real-time Socket Gateway — Emit socket updates for `dlt_updated`, `world_unlocked`, and `badge_earned`
- Frontend Learning Loop Pages — Dashboard (featuring XP, streak, world progress, recommendations, and roadmap widgets), world map, lesson reader, interactive game arena, and boss portals with premium CSS transitions and Framer Motion micro-animations
- Test verification — Added 9 new learning loop E2E integration tests; backend E2E suite is fully passing (49 tests total)

Phase 3 — Intelligence Layer
Completed + Corrections Applied

- Spaced Repetition Memory Lab — Implemented the forgetting curve decay formula $R = e^{-t / S}$ and risk evaluation levels (low, medium, high, critical)
- Nightly decay cron scheduler — Created memory scheduler worker (running via nightly jobs) to decay topic retention scores, adjust matching DLT mastery, and trigger critical/review alerts
- Recommendations Arbitrator — Built candidate recommendation generator for learn, review, practice, and consistency triggers with priority-based conflict resolution, cooldowns, and top 7 filtering
- Dynamic Roadmap Generator — Constructed topological sort path traversal using Neo4j knowledge graph prerequisite nodes to generate and lock/unlock steps dynamically upon goal switches
- Context-Aware AI Mentor — Implemented POST /mentor-ai/chat with student DLT context injection, plan-based model tiering, 10 messages/day Redis daily limit for free tier, and full 4+4 model selection system
- Skill DNA Profile — Implemented activity-gated (min 7 days) analysis computing learning style, consistency pattern, exploration behavior, strengths, and weaknesses
- Explainability Route — Implemented GET /explain/:type/:id supporting rule-based descriptions and premium upgrade "Tell me more" LLM details
- Frontend Intelligence Pages — Developed /memory Lab page (retention heatmap, gauge, and schedule), /roadmap timeline page (checkpoints and switcher), dashboard widget integrations, and floating AI chat drawer
- Test Verification — 71/71 E2E tests passing across 7 suites (Auth, OAuth, Onboarding, Users, App, Learning Loop, Intelligence)

Phase 3 Corrections (applied post-review):
- [x] Correction 1: Goal swaps — removed 1-swap/month Redis limit; all tiers can change goal unlimited times
- [x] Correction 2: Memory Lab — removed premium overlays on Retention Heatmap and Daily Reinforcement Calendar; both are now free for all users
- [x] Correction 3: AI model system — upgraded to full 4+4 model selection (gemini-2.5-flash / qwen-3 / llama-4-scout / deepseek-r1-free for free; deepseek-r1-groq / llama-3.3-70b-groq / deepseek-v3 / qwen-3-pro for premium); added enum validation on selectedModel API field
- [x] BullMQ teardown fix — resolved unhandled 'Connection is closed' ioredis error in DltWorkerService and ProfileSyncService onModuleDestroy; fixed OAuth e2e testApp teardown race; added forceExit to jest-e2e.json

Remaining / Restructuring Progress
- [x] Step 1: Complete BFS Explorer gameboard (P0)
- [x] Step 2: Complete DFS Adventure gameboard (P0)
- [x] Step 3: Complete Recursion Maze gameboard (P0)
- [x] Step 4: Add Array Arena, Function Fortress, Recursion Caverns to seed.ts (P0)
- [x] Step 5: Language track system — schema & onboarding & filtering
- [x] Step 6: Expand lesson content in seed.ts for all worlds and all 4 languages
- [x] Step 7: Platform profile verification on link
- [x] Step 8: Fast track unlock in onboarding.service.ts
- [x] Step 9: Update free vs premium gates — remove incorrect 402 gates, enforce correct ones
- [x] Step 10: AI Model Selection System & routing fallback (4+4 model system)
- [x] Step 11: Boss battle progressive cooldown system
- [x] Step 12: World victory screen and progression flow
- [x] Step 13: Locked world prerequisite modal
- [x] Step 14: Memory Lab service & nightly scheduler
- [x] Step 15: Recommendation engine & arbitrator
- [x] Step 16: Roadmap regeneration via Neo4j
- [x] Step 17: AI Mentor with limits and custom system prompt
- [x] Step 18: Skill DNA computation
- [x] Step 19: Forecasting engine
- [x] Step 20: Frontend: Memory Lab UI page (heatmap + schedule free for all users)
- [x] Step 21: Frontend: Roadmap UI page (full timeline, unlimited goal swaps)
- [x] Step 22: Frontend: AI Mentor floating chat panel (4+4 model selector)
- [x] Step 23: Frontend: Updated dashboard with Phase 3 widgets
- [x] Step 24: Frontend: Practice hub + Monaco editor
- [x] Step 25: Frontend: Blockly editor component
- [ ] See SkillForge_PhasePlan.docx v2 for details on remaining tasks in Phase 4, 5, and 6.
- [ ] User Profile display page (`/profile`) with activity calendar and Top Skills

Blockers
- none

Phase History

- Phase 1 — status: completed
- Phase 2 — status: completed
- Phase 3 — status: completed (corrections applied, 71/71 tests passing)
- Phase 4 — status: not started (sub-phases 4A-4D)
- Phase 5 — status: not started (was old Phase 4: Career & Interviews)
- Phase 6 — status: not started (was old Phase 5: Community & Launch)

