# SkillForge — Agent Instructions

## What is this project?

SkillForge is an AI-powered programmer growth ecosystem that guides learners from complete beginners to industry-ready software engineers and competitive programmers. It combines adaptive learning worlds, interactive games, memory science, personalized roadmaps, AI mentoring, mock interviews, resume building, and career readiness into a single intelligent platform.

The platform has three roles: Student, Mentor, and Admin. The core intelligence is the Digital Learning Twin (DLT) — an AI model of each learner that drives all recommendations, roadmaps, and world unlocks.

---

## Monorepo Structure

```
skillforge/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   ├── api/          # NestJS backend
│   └── ai/           # Python FastAPI AI service
├── packages/
│   ├── db/           # Prisma schema + migrations
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared component library
├── docs/             # All 13 specification documents
├── agents.md         # This file
└── turbo.json        # Turborepo config
```

---

## Tech Stack

### Frontend (apps/web)
- Framework: Next.js 14 with App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Components: shadcn/ui
- State: Zustand (global) + React Query (server state)
- Forms: React Hook Form + Zod
- Charts: Recharts + D3.js
- Code editor: Monaco Editor
- Animations: Framer Motion
- Icons: Lucide React
- Drag and drop: React DnD (for Blockly games)
- Real-time: Socket.io client

### Backend (apps/api)
- Framework: NestJS with TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Cache + Queue: Redis (Upstash) + BullMQ
- Auth: Passport.js + JWT + OAuth2 (Google, GitHub)
- File uploads: Multer + Cloudflare R2
- Email: Resend
- Real-time: Socket.io
- Validation: class-validator + Zod
- Testing: Jest + Supertest

### AI Service (apps/ai)
- Language: Python 3.11+
- Framework: FastAPI
- LLM: OpenAI GPT-4o / Anthropic Claude API
- ML: scikit-learn, numpy, scipy
- NLP: spaCy
- Orchestration: LangChain

### Databases
- Primary: PostgreSQL (all structured data)
- Cache: Redis (dashboard data, leaderboards, rate limiting, BullMQ queues)
- Graph: Neo4j (Knowledge Graph — topic relationships and prerequisites)
- Files: Cloudflare R2 (resumes, profile images, interview recordings)

### Infrastructure
- Frontend deploy: Vercel
- Backend deploy: Railway
- AI service deploy: Railway (separate service)
- Package manager: npm
- Monorepo: Turborepo

---

## Specification Documents

All 13 documents are in /docs. Always reference these before implementing any feature.

| File | What it covers |
|---|---|
| SkillForge_ProductVision.docx | What the platform is and why |
| SkillForge_Feature_Spec.docx | Deep spec of every feature |
| SkillForge_TechStack.docx | Tech decisions and reasoning |
| SkillForge_UIUX.docx | Design tokens, colors, components, animations |
| SkillForge_Pages.docx | Every page for every role |
| SkillForge_DBSchema.docx | Every database table and column |
| SkillForge_APISpec.docx | Every API endpoint |
| SkillForge_ArchComponents.docx | System architecture and UI components |
| SkillForge_PromptsStories.docx | AI prompt templates and user stories |
| SkillForge_Security.docx | Security checklist |
| SkillForge_Testing.docx | Testing strategy |
| SkillForge_DeployErrors.docx | Deployment runbook and error handling |
| SkillForge_PhasePlan.docx | Phase-wise build plan with checklists |

---

## Database Schema (Quick Reference)

All tables use UUID primary keys. Every table has created_at and updated_at timestamps. User-facing tables have soft delete (deleted_at).

### Core Tables
- `users` — id, email, password_hash, name, role (student|mentor|admin), plan (free|premium), primary_goal, onboarding_complete, streak_count
- `dlt_states` — user_id (unique), overall_mastery, overall_retention, learning_style, consistency_score, career_readiness (JSONB), xp_total, level
- `mastery_scores` — user_id, topic_id, score (0.0–1.0), game_score, assessment_score, coding_score, interview_score, retention_score
- `retention_scores` — user_id, topic_id, retention (0.0–1.0), stability, last_reviewed_at, next_review_at, risk_level
- `recommendations` — user_id, type, title, description, why, impact, effort_minutes, confidence, status, cooldown_until
- `roadmaps` — user_id (unique), goal, steps (JSONB), current_step_index
- `worlds` — slug, name, description, order_index, status, unlock_criteria (JSONB), xp_reward
- `interview_sessions` — student_id, mentor_id (nullable), type (ai|human), interview_type, status, recording_url, price_paid
- `resumes` — user_id, name, template, content (JSONB), pdf_url, is_primary

Full schema in SkillForge_DBSchema.docx.

---

## API Conventions

- Base URL: `/v1`
- All responses use standard envelope: `{ success: true, data: {...}, meta: {...} }`
- All errors use: `{ success: false, error: { code: string, message: string, details: {} } }`
- Auth: Bearer JWT in Authorization header
- Protected routes use NestJS Guards with role decorators
- All IDs are UUIDs — validate on every endpoint
- Never expose stack traces in production error responses

### Auth Levels
- `Public` — no auth required
- `Student` — valid JWT with role: student
- `Mentor` — valid JWT with role: mentor
- `Admin` — valid JWT with role: admin
- `Any` — valid JWT, any role

Full API spec in SkillForge_APISpec.docx.

---

## Design System

### Colors (dark theme — always dark first)
```
--bg-primary:      #0A0E1A   (main background)
--bg-secondary:    #111827   (cards, panels)
--bg-elevated:     #1A1F35   (modals, dropdowns)
--brand-cyan:      #00B4D8   (primary brand, buttons, links)
--accent-purple:   #7B2FBE   (badges, tags, secondary accent)
--accent-green:    #06D6A0   (success, mastery high, correct answer)
--accent-orange:   #FF6B35   (boss battles, streaks, warnings)
--accent-red:      #EF4444   (errors, retention critical, wrong answer)
--text-primary:    #F1F5F9   (main body text)
--text-secondary:  #94A3B8   (labels, metadata)
--text-muted:      #475569   (placeholders, disabled)
--border:          #1E2B45   (subtle borders)
```

### Typography
- Headings: Space Grotesk
- Body: Inter
- Code / Numbers / Stats: JetBrains Mono
- All font sizes in Tailwind classes (text-sm, text-base etc.)

### Key Design Rules
- Dark theme is primary — never design light-first
- Cards: bg-secondary background, 1px border (--border), rounded-xl
- Primary buttons: bg brand-cyan, text dark
- Never use localhost hardcoded — always use environment variables
- Boss battle screens get orange glow treatment
- Mastery bars: green (>80%), orange (60–79%), red (<60%)

Full design system in SkillForge_UIUX.docx.

---

## Folder Conventions

### Frontend (apps/web)
```
app/
├── (auth)/           # login, signup, onboarding (no sidebar layout)
├── (app)/            # all authenticated pages (with sidebar layout)
│   ├── dashboard/
│   ├── worlds/
│   ├── practice/
│   ├── interviews/
│   ├── career/
│   ├── memory/
│   ├── community/
│   └── settings/
├── (admin)/          # admin pages
└── (mentor)/         # mentor pages

components/
├── ui/               # shadcn primitives (Button, Card, Input etc.)
├── features/         # feature components (MasteryBar, WorldCard etc.)
├── layouts/          # AppLayout, AuthLayout, FocusLayout
└── charts/           # Recharts + D3 chart components

hooks/                # useDLT, useRecommendations, useWorldProgress etc.
stores/               # Zustand stores (auth, theme, socket)
lib/                  # api client, utils, constants
types/                # TypeScript interfaces mirroring DB schema
```

### Backend (apps/api)
```
src/
├── auth/             # JWT, OAuth, guards, decorators
├── users/            # user profiles, coding profiles
├── worlds/           # worlds, lessons, games, boss battles
├── dlt/              # Digital Learning Twin engine
├── recommendations/  # recommendation generation + arbitration
├── roadmap/          # personalized roadmap generation
├── memory/           # retention tracking, Memory Lab
├── interviews/       # AI + human interview sessions
├── career/           # resume, LinkedIn, career readiness
├── community/        # teams, leaderboards, competitions
├── notifications/    # smart nudge system
├── analytics/        # dashboard data aggregation
├── admin/            # admin-only endpoints
└── common/           # shared filters, interceptors, pipes
```

---

## Coding Rules

### General
- TypeScript strict mode everywhere — no `any` types
- Always handle errors — never let promises reject silently
- Use Zod for all input validation — both frontend forms and backend DTOs
- All database queries go through Prisma — never raw SQL unless absolutely necessary
- Never hardcode secrets, URLs, or API keys — always use environment variables
- All environment variables must have a corresponding entry in .env.example

### Backend Specific
- Every controller method must have a role guard decorator
- Always check resource ownership: `WHERE id = $1 AND user_id = $2`
- Use BullMQ for any operation that takes more than 200ms (DLT updates, email, reports)
- Return paginated responses for any list endpoint (page, limit, total in meta)
- Log errors to Sentry in production — never console.log in production
- Never expose internal error details in API responses

### Frontend Specific
- Use React Query for all server state — never useState for API data
- Every page must have a loading skeleton — never show empty content while loading
- All forms must show field-level validation errors, not just toast notifications
- Use next/image for all images — never raw <img> tags
- Mobile responsive is required on every component — test at 375px width
- All interactive elements must have proper aria-labels

### Database
- Never use `$queryRawUnsafe` — use parameterized queries only
- Every new feature needs a Prisma migration — never modify the DB directly
- Add indexes for every foreign key and every column used in WHERE clauses
- Unique constraints must be defined in the Prisma schema, not just the application

### AI / LLM
- Never concatenate user input directly into prompts — always use template substitution
- Cap injected context at 2000 tokens per LLM call
- Always parse LLM responses as JSON — never trust unstructured text output
- Wrap all LLM calls in try-catch — LLM APIs can fail and must not crash the app
- Cache common LLM responses in Redis to reduce cost

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=
REDIS_URL=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
RESEND_API_KEY=
EMAIL_FROM=
FRONTEND_URL=
NODE_ENV=
PORT=3001
SENTRY_DSN=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_SENTRY_DSN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---
 
## Current Build Phase
 
Current Build Phase: Phase 5 — Career & Interviews
Scope: Implement Mock Interviews (AI-powered and human-reviewed), Resume Builder (auto-filled sections, templates, scoring engine), LinkedIn Optimizer, Career Readiness Engine, Company-specific preparation tracks, Stripe billing integration, and mock exams platform. See SkillForge_PhasePlan.md / SkillForge_PhasePlan.docx and SkillForge_Curriculum.docx for details.
 
Do not build Phase 6 (Community & Launch) features until all Phase 5 checklist items are complete and verified.
 
---

## What NOT to Do

- Do not use `localStorage` for JWT tokens — use httpOnly cookies only
- Do not use `any` TypeScript type — ever
- Do not skip writing tests for business logic (DLT calculations, mastery formulas)
- Do not use `$queryRawUnsafe` in Prisma
- Do not add features outside the current phase scope
- Do not return stack traces in API error responses
- Do not commit `.env` files — only `.env.example`
- Do not use wildcard `*` in CORS configuration in production
- Do not store sensitive data in URL query parameters
- Do not call LLM APIs synchronously on request threads for long operations — use BullMQ

---

## Key Business Logic

### Mastery Score Formula
```
mastery = (w1 * game_score) + (w2 * assessment_score) + (w3 * coding_score)
        + (w4 * interview_score) + (w5 * retention_score)
// Weights sum to 1.0, adjusted by learner's primary goal
// Score is always clamped to 0.0–1.0
```

### Retention Decay Formula
```
retention(t) = initial_retention * e^(-t / stability)
// t = days since last review
// stability increases with each successful review
// When retention drops below 0.7 → trigger REVIEW recommendation
```

### World Unlock Logic
```
1. Get world's unlock_criteria from DB (JSONB)
2. Check each required topic's mastery_score >= threshold
3. Check overall retention >= 0.65
4. Check user has been active in last 14 days
5. If all pass → set user_world_progress.status = 'unlocked'
6. Send world_unlocked Socket.io event to user
7. Create WORLD_UNLOCKED notification
```

### Recommendation Arbitration
```
1. Generate all candidate recommendations from all sources
2. Remove duplicates (same type + same topic_id)
3. Remove any on cooldown (cooldown_until > now)
4. Resolve conflicts (keep higher priority)
5. Sort by priority score (urgency * impact * confidence)
6. Take top 7 only
7. Save to recommendations table
8. Invalidate Redis cache for this user
```

---

## Testing Requirements

- Unit tests required for: all DLT calculations, mastery formulas, retention decay, recommendation arbitration
- Integration tests required for: all API endpoints, auth flows, authorization checks
- Test database: separate PostgreSQL instance, reset between test suites
- Mock all external services in tests: OpenAI, Resend, R2
- Minimum coverage: 90% on business logic, 80% on API handlers
- Run tests with: `npm run test` (unit) and `npm run test:e2e` (integration)

### Verification Standard — Non-Negotiable

Every phase's final verification must include a literal browser walkthrough of the user-facing flow before claiming the phase complete. API-level E2E tests are necessary but not sufficient.

A phase is not "verified" until every core user-facing flow has been exercised through the actual rendered browser UI — not via direct API calls, curl, or walkthrough scripts. Specifically:

- Before claiming a phase complete, run through every checklist item by clicking through the real frontend in a browser (localhost dev server is acceptable).
- For each flow: note the actual network request made, the actual response received, and the actual UI state that results.
- Screenshot or log the key steps (e.g. "submitted empty code → saw 400 error toast", "completed lesson 3 → progress bar advanced to 60%").
- If a flow cannot be browser-tested by the agent (e.g. requires a real user session), state this explicitly and flag it for the human to verify — do not mark it as verified.

**Rationale**: The discrepancy between 78/78 E2E tests passing and multiple broken flows in production was caused by tests that validated API contracts in isolation. The frontend was not sending code to `completeProblem`, making the test suite blind to the real data path a student uses. This class of bug — correct API, wrong wiring — is only caught by tracing the full browser-to-backend path.

Full testing strategy in SkillForge_Testing.docx.


---

## Security Rules (Non-Negotiable)

- JWT in httpOnly cookies only — never localStorage
- bcrypt cost factor minimum 12 for password hashing
- Rate limit: 5 login attempts per IP per 15 minutes
- All admin endpoints behind AdminGuard
- All resource queries filter by user_id (ownership check)
- Input validation on every single endpoint — no exceptions
- No PII (email, name) in error logs — use user ID only

Full security checklist in SkillForge_Security.docx.
