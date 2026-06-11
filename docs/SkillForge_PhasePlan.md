SKILLFORGE

Phase-Wise Build Plan

5 phases from zero to production — what to build, in what order, with a checklist for each phase


[Table]
| The 5 Phases at a Glance | Phase 1 — Foundation          Set up the project, auth, database, and basic infrastructure | Phase 2 — Core Learning       Digital Learning Twin, Learning Worlds, Games, Dashboard | Phase 3 — Intelligence        Memory, Recommendations, Roadmaps, AI Mentor, Blockly | Phase 4 — Career & Interviews Mock Interviews, Resume Builder, Career Readiness Engine | Phase 5 — Community & Launch  Institutional platform, community, security hardening, go live |


# The Golden Rule

Every phase must be fully working and tested before the next phase begins. Do not start Phase 2 with broken auth. Do not start Phase 3 with a buggy DLT. Each phase produces a working, deployable product — not a half-finished one.


[Table]
| What 'Done' Means for Each Phase | ✅  All features in the phase are built and working | ✅  Unit and integration tests written and passing | ✅  Deployed to staging environment | ✅  Manually tested by at least one person who didn't build it | ✅  All checklist items below the phase are ticked | ✅  No P0 or P1 bugs open | Only then: move to the next phase. |



[Table]
| PHASE 1 | Foundation | Project setup, authentication, database, and deployment pipeline |


Phase 1 is boring but critical. Nothing in Phase 2 onwards works without this. The goal of Phase 1 is to have a running, deployed application that users can register and log in to — nothing more.

## What to Build


[Table]
| Area | Tasks | Priority |
| Monorepo Setup | Initialize Turborepo with /apps/web, /apps/api, /packages/db, /packages/types | P0 |
| Backend Scaffold | NestJS project with TypeScript, ESLint, Prettier, folder structure per domain modules | P0 |
| Frontend Scaffold | Next.js 14 App Router with TypeScript, Tailwind CSS, shadcn/ui installed | P0 |
| Database Setup | PostgreSQL on Railway/Supabase, Prisma configured, connection tested | P0 |
| Schema — Phase 1 | Prisma schema for: users, sessions, oauth_accounts, coding_profiles | P0 |
| Auth — Register | POST /auth/register endpoint with validation, bcrypt, JWT response | P0 |
| Auth — Login | POST /auth/login with credential validation, rate limiting (5 attempts/15min) | P0 |
| Auth — OAuth | Google + GitHub OAuth via Passport.js, NextAuth on frontend | P0 |
| Auth — Logout | Token blacklisting in Redis, POST /auth/logout | P0 |
| Auth — Refresh | Refresh token rotation, httpOnly cookie storage | P0 |
| JWT Guards | NestJS Auth Guard applied to all protected routes, role decorator | P0 |
| User Profile API | GET /users/me, PATCH /users/me, GET /users/:id/profile | P1 |
| Coding Profiles | POST + DELETE /users/me/coding-profiles (manual linking) | P1 |
| Onboarding Flow | 6-step onboarding UI + goal + assessment + POST /onboarding/* endpoints | P1 |
| Landing Page | Marketing landing page at skillforge.app with signup CTA | P1 |
| Login + Signup Pages | Auth pages with form validation and OAuth buttons | P0 |
| CI/CD Pipeline | GitHub Actions: lint + unit test + integration test on every PR | P0 |
| Staging Deployment | Backend on Railway, Frontend on Vercel, staging environment live | P0 |
| Environment Variables | All secrets configured in Railway/Vercel, .env.example documented | P0 |
| Health Check | GET /health endpoint returning service status | P0 |
| Error Handling | Global NestJS exception filter, standard error envelope | P0 |
| Redis Setup | Upstash Redis connected, used for token blacklist + rate limiting | P0 |


## Phase 1 — Completion Checklist

Tick every item before moving to Phase 2:


[Table]
| ☐ | Monorepo initialized | Turborepo running, all apps build without errors |



[Table]
| ☐ | PostgreSQL connected | Prisma migrate deploy runs cleanly, all Phase 1 tables exist |



[Table]
| ☐ | Redis connected | Token blacklist and rate limiting working in tests |



[Table]
| ☐ | Register works end-to-end | New user can sign up, receives JWT, profile created in DB |



[Table]
| ☐ | Login works end-to-end | Existing user logs in, receives JWT, token validates on next request |



[Table]
| ☐ | Google OAuth works | User can sign up and log in with Google account |



[Table]
| ☐ | GitHub OAuth works | User can sign up and log in with GitHub account |



[Table]
| ☐ | Logout blacklists token | After logout, old JWT returns 401 on any protected endpoint |



[Table]
| ☐ | Refresh token rotation works | New access token issued, old refresh token invalidated |



[Table]
| ☐ | Rate limiting works | 6th login attempt within 15 min returns 429 |



[Table]
| ☐ | Role guard works | Student JWT returns 403 on any /admin/* endpoint |



[Table]
| ☐ | Onboarding flow complete | New user completes all 6 steps without errors |



[Table]
| ☐ | Coding profile linking works | User can link LeetCode username, stored in DB |



[Table]
| ☐ | CI/CD pipeline green | All tests pass on GitHub Actions on a clean PR |



[Table]
| ☐ | Staging environment live | Backend and frontend deployed and accessible via staging URLs |



[Table]
| ☐ | No hardcoded secrets | git grep for API keys returns nothing |



[Table]
| ☐ | Error handling standardized | All endpoints return standard error envelope on failure |



[Table]
| 🏁  Phase 1 Complete | A user can register, log in with email or OAuth, complete onboarding, and link coding profiles. The app is deployed to staging. |



[Table]
| PHASE 2 | Core Learning | Digital Learning Twin, Learning Worlds, Games, Boss Battles, Dashboard |


Phase 2 is the heart of SkillForge. This is where the platform stops being a login screen and starts being an actual learning product. The goal is to have a student complete a full Learning World — from entering to beating the World Boss.

## What to Build


[Table]
| Area | Tasks | Priority |
| DB Schema — Phase 2 | Prisma schema: worlds, lessons, games, boss_battles, badges, user_world_progress, mastery_scores, game_attempts, boss_attempts, user_badges, dlt_states | P0 |
| Knowledge Graph (basic) | Neo4j setup, seed core topic nodes and prerequisite edges for Phase 2 topics | P0 |
| World Seeding | Seed database: Variables Kingdom, Conditions Valley, Loop Forest (3 worlds minimum) | P0 |
| World Map Page | /worlds — interactive world map with locked/unlocked/completed states | P0 |
| World Detail Page | /worlds/[slug] — lessons, games, boss battles listed with progress | P0 |
| Lesson Page | /worlds/[slug]/lesson/[id] — rich content rendering, mark complete | P0 |
| Game Engine (basic) | Game attempt submission API, score calculation, mastery update trigger | P0 |
| Logic Builder Game | First interactive game — variable/operator puzzles, drag-and-drop | P0 |
| If-Else Constructor | Decision tree building game | P1 |
| Loop Builder Game | Visual loop construction game | P1 |
| 3 More Games | BFS Explorer, Recursion Maze, one more from game catalog | P1 |
| Boss Battle System | Mini Boss + World Boss full battle screen with health bars | P0 |
| Badge System | Badge award on boss victory, badge display on profile | P1 |
| Digital Learning Twin (basic) | dlt_states table, mastery score calculation after each activity, DLT update job in BullMQ | P0 |
| GET /dlt/me | Returns current DLT state — mastery scores, XP, level | P0 |
| GET /mastery | Returns all topic mastery scores for current user | P0 |
| XP & Leveling | XP awarded per action, level calculation, level-up notification | P1 |
| Dashboard — Phase 2 | /dashboard with: World Progress widget, basic Recommendations (rule-based), Roadmap Preview (static for now) | P0 |
| World Unlock Logic | Evaluate unlock criteria from Knowledge Graph after each boss battle | P0 |
| World Map UI | Animated world map — unlock animations, progress rings, locked states | P1 |
| Boss Battle UI | Full boss battle screen — health bars, animations, victory/defeat screens | P0 |
| Streak System | Daily streak tracking, streak_count update, streak reminder nudge | P1 |
| Basic Notifications | /notifications page, in-app notification feed, Socket.io for real-time nudges | P1 |
| Profile Page | /profile — badges, activity calendar, top skills | P1 |


## Phase 2 — Completion Checklist


[Table]
| ☐ | 3+ Learning Worlds seeded | Variables Kingdom, Conditions Valley, Loop Forest in DB with full content |



[Table]
| ☐ | World map renders correctly | Locked, in-progress, and completed states all display correctly |



[Table]
| ☐ | Student can complete a lesson | Lesson renders, mark complete updates progress, XP awarded |



[Table]
| ☐ | 5+ games playable | Each game submits score, updates mastery, shows feedback screen |



[Table]
| ☐ | Mini Boss works | Student answers questions, health bars animate, pass/fail logic correct |



[Table]
| ☐ | World Boss works | Full boss battle, badge awarded on victory, cooldown enforced on failure |



[Table]
| ☐ | DLT updates after activity | Mastery score for related topic updates within 30s of game/boss completion |



[Table]
| ☐ | World unlock works | Completing boss battle triggers unlock evaluation, new world appears on map |



[Table]
| ☐ | Dashboard shows real data | World progress widget shows actual student data, not mock data |



[Table]
| ☐ | XP and leveling works | XP increments correctly, level-up triggers notification |



[Table]
| ☐ | Streak tracking works | Daily login updates streak, streak visible in sidebar |



[Table]
| ☐ | Premium gate works | Premium game returns 402 for free-tier user with upgrade prompt |



[Table]
| ☐ | All game/boss tests written | Integration tests cover attempt submission, scoring, and mastery update |



[Table]
| ☐ | Authorization tested | Student cannot access another student's progress data |



[Table]
| 🏁  Phase 2 Complete | A student can enter a Learning World, complete lessons, play games, fight and beat a boss, earn a badge, and unlock the next world. The DLT updates in real time. |



[Table]
| PHASE 3 | Intelligence Layer | Memory Intelligence, Recommendations, Roadmaps, AI Mentor, Blockly |


Phase 3 is what makes SkillForge intelligent rather than just a game. The goal is for the platform to genuinely know the student — what they are forgetting, what to study next, and why.

## What to Build


[Table]
| Area | Tasks | Priority |
| DB Schema — Phase 3 | Prisma schema: retention_scores, recommendations, roadmaps, skill_dna, forecasts, notifications (full) | P0 |
| Memory Intelligence Engine | Forgetting curve model, retention decay calculation, next_review_at scheduling | P0 |
| Memory Lab API | GET /memory/lab — health score, risk areas, review suggestions | P0 |
| Memory Lab UI | /memory — health score gauge, retention heatmap, reinforcement calendar, risk areas | P0 |
| Nightly Memory Job | BullMQ cron job: recalculate retention for all active users at 2AM | P0 |
| Recommendation Engine | Rule-based recommendation generation across all types (learn/review/practice/interview/career) | P0 |
| Recommendation Arbitration | Dedup, conflict resolution, cooldown, priority scoring, max 7 active recs | P0 |
| Recommendations API | GET /recommendations, PATCH /recommendations/:id (dismiss/snooze) | P0 |
| Personalized Roadmap | Roadmap generation from Knowledge Graph + DLT state + goal | P0 |
| Roadmap API | GET /roadmap, PATCH /roadmap/goal | P0 |
| Roadmap UI | /roadmap — visual timeline, step statuses, goal switcher | P0 |
| Knowledge Graph (full) | Neo4j: seed all topic nodes and edges, prerequisite traversal API | P0 |
| Skill DNA | Weekly computation job, GET /skill-dna, Skill DNA UI card | P1 |
| Forecasting Engine | Linear projection for topic readiness, retention risk, placement timeline | P1 |
| Forecasts API | GET /forecasts — predictions with confidence scores | P1 |
| Explainability Center | GET /explain/:type/:id — plain-language AI explanations for decisions | P1 |
| Dashboard — Phase 3 (full) | Add to dashboard: Memory Snapshot, DNA Snapshot, Recommendations feed, Roadmap Preview, Career Readiness | P0 |
| AI Mentor (basic) | POST /mentor-ai/chat — LLM call with learner context injected, streaming response | P0 |
| AI Mentor UI | Floating chat panel, suggested prompts, usage counter, premium gate | P0 |
| Smart Nudge System | All nudge types: memory/streak/interview/roadmap/inactivity, delivery via Socket.io + push | P1 |
| Blockly Visual Programming | Drag-and-drop block editor, code generation (C++/Java/Python), challenge mode | P1 |
| Coding Practice Hub | /practice — recommended problems, filter by topic/difficulty | P1 |
| Practice Problem Page | /practice/[problemId] — Monaco editor, test cases, run/submit | P1 |
| Analytics Page | /analytics — mastery trends, activity heatmap, weak areas, velocity chart | P1 |


## Phase 3 — Completion Checklist


[Table]
| ☐ | Forgetting curves calculating | Retention score decays correctly over time, next_review_at is accurate |



[Table]
| ☐ | Memory Lab loads with real data | Health score, heatmap, and risk areas reflect actual student retention |



[Table]
| ☐ | Nightly job runs correctly | 2AM cron updates retention for all active users without errors |



[Table]
| ☐ | Recommendations are personalized | Different students see different recommendations based on their DLT |



[Table]
| ☐ | Arbitration works | Never more than 7 recommendations, no duplicates, cooldowns respected |



[Table]
| ☐ | Roadmap generates correctly | Roadmap reflects student's goal, current mastery, and knowledge graph dependencies |



[Table]
| ☐ | Roadmap updates on goal change | Changing goal recalculates roadmap within 10 seconds |



[Table]
| ☐ | Knowledge graph complete | All core topics seeded in Neo4j with correct prerequisite edges |



[Table]
| ☐ | AI Mentor responds with context | Mentor answers reference student's actual mastery scores and roadmap |



[Table]
| ☐ | AI Mentor free tier limit works | 3rd message on same day returns 402 with upgrade prompt |



[Table]
| ☐ | Explainability works | Every recommendation has a 'Why?' explanation that is specific and accurate |



[Table]
| ☐ | Dashboard shows all widgets | All 8 dashboard widgets populated with real data |



[Table]
| ☐ | Nudges deliver correctly | Memory nudge fires when retention drops below 70%, max 2 per day |



[Table]
| ☐ | Blockly generates valid code | Visual program generates syntactically correct C++/Java/Python |



[Table]
| ☐ | Skill DNA computes | Learning style, strengths, weaknesses computed after 7 days of activity |



[Table]
| 🏁  Phase 3 Complete | The platform is genuinely intelligent. It knows what the student is forgetting, recommends the right actions, generates a personalized roadmap, and can answer questions about the student's own learning journey through the AI Mentor. |



[Table]
| PHASE 4 | Career & Interviews | Mock Interviews, Resume Builder, Career Readiness, Company Tracks, Exams |


Phase 4 transforms SkillForge from a learning platform into a career platform. The goal is for a student to be able to walk away from Phase 4 with a scored resume, completed mock interviews, and a clear picture of their hiring readiness.

## What to Build


[Table]
| Area | Tasks | Priority |
| DB Schema — Phase 4 | Prisma schema: interview_sessions, interview_feedback, mentor_profiles, mentor_availability, mentor_reviews, resumes, resume_scores, exam_attempts | P0 |
| AI Interview Engine | POST /interviews/ai/start, message loop, completion + feedback generation via LLM | P0 |
| AI Interview UI | /interviews/ai — interview screen with Monaco editor, AI evaluator panel | P0 |
| Interview Feedback Report | /interviews/feedback/[id] — full scored report with improvement areas | P0 |
| Mentor Profile Setup | /mentor/profile/setup — bio, expertise, pricing, availability builder | P0 |
| Mentor Verification Flow | Admin approval workflow for mentor applications | P0 |
| Mentor Marketplace | /interviews/mentors — browse mentors, filter, view profiles, book session | P0 |
| Booking System | Session booking with payment (Stripe), calendar slot selection, confirmation flow | P0 |
| Live Interview Room | /interviews/[sessionId] — video panel + shared Monaco editor + Socket.io code sync | P0 |
| Mentor Feedback Form | /mentor/feedback/[sessionId] — structured scoring form for mentors | P0 |
| Interview History | /interviews — list of all past and upcoming sessions with scores | P1 |
| Resume Builder UI | /career/resume — template selector, auto-filled sections, live preview, download PDF | P0 |
| Resume Score Engine | POST /resumes/:id/score — LLM-powered scoring across 6 dimensions | P0 |
| LinkedIn Optimizer | POST /career/linkedin/analyze — paste profile, receive scores and suggestions | P1 |
| Career Readiness Engine | Composite score calculation from coding + interview + resume + DLT data | P0 |
| Career Hub Page | /career — readiness meters, resume summary, company tracks | P0 |
| Company Prep Tracks | /career/company/[slug] — 13 company tracks with patterns, problems, readiness | P1 |
| Mock Exam Platform | /exams — exam catalog, start/submit flow, results page | P1 |
| Adaptive Exam Engine | Dynamic difficulty adjustment based on performance within exam session | P1 |
| Mentor Dashboard | /mentor/dashboard — upcoming sessions, pending reviews, earnings | P0 |
| Mentor Sessions Page | /mentor/sessions — session management, accept/decline, cancel | P0 |
| Mentor Earnings Page | /mentor/earnings — revenue tracking, payout requests | P1 |
| Mentor Reviews Queue | /mentor/reviews — resume and exam review queue | P1 |
| Payment Integration | Stripe for mentor session payments, commission split, webhook handling | P0 |


## Phase 4 — Completion Checklist


[Table]
| ☐ | AI interview generates appropriate questions | Question difficulty matches student's mastery level and target company |



[Table]
| ☐ | AI interview evaluation works | Feedback report has scores across all 4 dimensions with specific improvements |



[Table]
| ☐ | Mentor verification flow works | Admin can approve application, mentor receives verified badge |



[Table]
| ☐ | Mentor booking works end-to-end | Student books → mentor accepts → session appears in both dashboards |



[Table]
| ☐ | Payment processing works | Stripe processes payment, commission split recorded, mentor earnings updated |



[Table]
| ☐ | Live interview room works | Code syncs in real time between student and mentor via Socket.io |



[Table]
| ☐ | Mentor feedback submits correctly | Feedback saved, student receives report, DLT interview_score updates |



[Table]
| ☐ | Resume auto-fills from profile | Skills from mastery, badges, and coding stats appear in resume sections |



[Table]
| ☐ | Resume scoring works | 6-dimension score returned with specific, actionable suggestions |



[Table]
| ☐ | PDF download works | Resume downloads as a well-formatted PDF matching the selected template |



[Table]
| ☐ | Career readiness updates | Readiness scores change when interview results or resume score improves |



[Table]
| ☐ | 3+ company tracks live | At least Google, Amazon, Microsoft tracks with original practice problems |



[Table]
| ☐ | Exam platform works | Student can start, complete, and receive results for a topic exam |



[Table]
| ☐ | Mentor quality metrics tracking | Rating, session quality, and rebooking rate update after each session |



[Table]
| 🏁  Phase 4 Complete | A student has a scored resume, completed AI and human mock interviews, knows their readiness for specific companies, and has access to company-specific preparation tracks. Mentors can earn money on the platform. |



[Table]
| PHASE 5 | Community & Launch | Institutional platform, community features, security hardening, go live |


Phase 5 completes the platform and prepares it for real users. The goal is a fully hardened, monitored, and community-enabled platform ready to onboard colleges and student groups.

## What to Build


[Table]
| Area | Tasks | Priority |
| DB Schema — Phase 5 | Prisma schema: teams, team_members, competitions, competition_submissions, reports, institutions, cohorts, cohort_members, audit_logs, feature_flags | P0 |
| Teams System | Create team, join by invite code, team dashboard, team member list | P0 |
| Community Leaderboard | /community/leaderboard — global and cohort leaderboard with metric toggle | P0 |
| Team Quests | Shared challenges with team contribution tracking | P1 |
| Competitions | Internal contest creation, problem sets, live leaderboard, submission judging | P1 |
| Moderation System | Report button on all content, report queue in admin, action enforcement | P0 |
| Fair Play Monitoring | Similarity detection on competition submissions, flagging system | P1 |
| Admin Dashboard | /admin/dashboard — platform stats, pending actions, health overview | P0 |
| Admin User Management | /admin/users — search, filter, suspend, restore, change plan | P0 |
| Admin Mentor Management | /admin/mentors — pending approvals, low-performing mentor alerts | P0 |
| Admin Content Management | /admin/content — world editor, lesson editor, game config, boss builder | P0 |
| Admin Knowledge Graph | /admin/knowledge-graph — D3.js visual editor for topic relationships | P1 |
| Admin Analytics | /admin/analytics — user growth, engagement, revenue, dropout funnel | P0 |
| Admin Reports Queue | /admin/moderation — review and resolve community reports | P0 |
| Admin Feature Flags | /admin/feature-flags — enable/disable features per tier | P0 |
| Institutional Platform | Institution creation, cohort management, placement readiness reports | P0 |
| Cohort Analytics | Institution admin sees aggregated DLT data across cohort | P0 |
| Security Hardening | Full OWASP checklist review, penetration testing with OWASP ZAP | P0 |
| Performance Testing | k6 load tests on critical endpoints, optimize slow queries | P0 |
| Sentry Setup | Error monitoring for frontend and backend, alert rules configured | P0 |
| Accessibility Audit | WCAG AA audit, fix all critical accessibility issues | P0 |
| Mobile Optimization | Full mobile responsive testing, touch event fixes for games | P0 |
| Regional Language (basic) | Hindi language support for onboarding and AI Mentor (Phase 2 languages roadmap item) | P2 |
| Privacy Controls | Download My Data, Delete My Data, interview recording consent flows | P0 |
| Terms of Service + Privacy Policy | Legal pages live at /terms and /privacy | P0 |
| Smoke Test Suite | Post-deploy smoke tests covering all critical paths | P0 |
| Production Deployment | Full production deployment per runbook, DNS configured, SSL verified | P0 |
| Monitoring Setup | UptimeRobot, Sentry alerts, Railway metrics alerts configured | P0 |


## Phase 5 — Completion Checklist


[Table]
| ☐ | Teams work end-to-end | Create team, join by code, team dashboard shows member progress |



[Table]
| ☐ | Leaderboard is live | Global and cohort leaderboards update in near real-time |



[Table]
| ☐ | Report system works | User can report, admin sees in queue, action taken, reporter notified |



[Table]
| ☐ | Admin dashboard has real data | All platform stats pulling from live DB, no mock data |



[Table]
| ☐ | Admin can suspend a user | Suspended user receives 401 on next request, receives email |



[Table]
| ☐ | Institutional onboarding works | Admin can create institution, add cohort, add students, view reports |



[Table]
| ☐ | OWASP checklist complete | Every item in security checklist document is ticked |



[Table]
| ☐ | Load test passes | p95 response time under 800ms at 200 concurrent users on dashboard |



[Table]
| ☐ | Sentry alerts configured | New error types trigger Slack notification within 5 minutes |



[Table]
| ☐ | Uptime monitoring live | UptimeRobot pinging /health every minute, alerts on downtime |



[Table]
| ☐ | Accessibility audit passed | 0 critical WCAG AA violations on core pages |



[Table]
| ☐ | Mobile fully functional | Games, dashboard, AI mentor all work on a real mobile device |



[Table]
| ☐ | Privacy controls work | Download data export works, delete account purges data within 30 days |



[Table]
| ☐ | Terms and Privacy pages live | Legal pages accessible from footer, linked in signup flow |



[Table]
| ☐ | Production deployment complete | skillforge.app live, HTTPS, health check passing, no startup errors |



[Table]
| ☐ | Smoke tests pass on production | All critical flows working on live production environment |



[Table]
| ☐ | Feature flags working | Admin can toggle features without redeployment |



[Table]
| 🏁  Phase 5 Complete — SkillForge is Live 🚀 | The platform is fully built, hardened, monitored, and deployed to production. Real students can register, learn, practice, interview, build resumes, and join institutions. The team can monitor health and respond to issues in real time. |


# Complete Phase Summary


[Table]
| Phase | Name | Key Deliverable | Gate to Next Phase |
| Phase 1 | Foundation | Users can register, log in, and complete onboarding | Auth + CI/CD fully working and tested |
| Phase 2 | Core Learning | Student completes a full Learning World and beats a boss | DLT updates correctly after all activities |
| Phase 3 | Intelligence | Platform recommends, remembers, and mentors intelligently | Recommendations are personalized and accurate |
| Phase 4 | Career & Interviews | Student has resume, mock interviews, and career readiness score | Payment and live interview room working |
| Phase 5 | Community & Launch | Platform live with institutional support and security hardening | All security and accessibility checklists complete |



[Table]
| Final Checklist — Before Accepting Real Users | ☐  All 5 phases complete and their checklists fully ticked | ☐  Security checklist (Document 10) fully complete | ☐  Load test passing at target RPS (Document 11) | ☐  Sentry monitoring live and alerting | ☐  UptimeRobot monitoring live | ☐  Terms of Service and Privacy Policy published | ☐  Payment processing tested with real card in production | ☐  Data export and deletion flows tested | ☐  At least 3 real users (non-team-members) have tested the full flow | ☐  Rollback procedure tested — you know how to roll back in under 5 minutes | ☐  Team has a communication channel for production incidents |

