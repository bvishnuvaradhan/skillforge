# Phase 1 Summary — Foundation

This document serves as a permanent, read-only record of the work completed, decisions made, and problems solved during **Phase 1 — Foundation** of the SkillForge ecosystem.

---

## 1. What Was Built

### Monorepo Infrastructure
- **Turborepo Setup**: Configured Turborepo (`turbo.json`) to manage build caching and parallel process execution.
- **Workspaces**:
  - `apps/web`: Next.js 14 frontend (App Router).
  - `apps/api`: NestJS backend.
  - `apps/ai`: FastAPI Python service scaffold.
  - `packages/db`: Prisma schema, migrations, and shared client.
  - `packages/types`: Shared TypeScript interfaces.
  - `packages/ui`: Shared Tailwind + shadcn component templates.
  - `packages/tsconfig` & `packages/eslint-config`: Shared configurations.

### Backend Services (`apps/api`)
- **Scaffold & Configuration**: Set up NestJS in strict TypeScript mode with centralized Zod request validation.
- **Authentication System**:
  - Email/password signup and login.
  - Password hashing via `bcrypt` (cost factor 12).
  - JWT generation and rotation using httpOnly cookies (`access_token`, `refresh_token`).
  - Redis-backed rate limiting (5 attempts per IP per 15 mins) and token blacklist verification on logout.
- **OAuth 2.0 Integration**:
  - Google and GitHub OAuth strategies with auto-linking of accounts and automated callback redirection.
- **Users Module**:
  - Current user operations (`GET /users/me`, `PATCH /users/me`).
  - Public/private profile retrieval (`GET /users/:id/profile`).
  - Soft account deletion (`DELETE /users/me`).
  - External platform linking/unlinking (LeetCode, GitHub, etc.).
- **Onboarding Module**:
  - Endpoint to update primary learning goals (`POST /v1/onboarding/goal`).
  - Endpoint to grade/submit diagnostic assessment answers (`POST /v1/onboarding/assessment`).
  - Endpoint to finalize onboarding (`POST /v1/onboarding/complete`) which initializes the Digital Learning Twin state (`dltState`), roadmap steps based on goals, and re-issues httpOnly token cookies with updated payload.

### Frontend Application (`apps/web`)
- **Next.js Core Setup**: Integrated App Router, standard routes, Tailwind CSS styling, and Zod environment schemas.
- **Edge Middleware Routing**:
  - Built token extraction and cryptographic payload verification using `jose` on Next.js Edge.
  - Handles routing logic: redirects unauthenticated users to `/login`, authenticated users without onboarding completion to `/onboarding`, and completed users to `/dashboard`.
- **UI Design System**:
  - Implemented the dark-theme-first color system (main background: `#0A0E1A`, brand cyan: `#00B4D8`, accent purple/green/orange/red) with Space Grotesk typography.
- **Pages & Components**:
  - **Landing Page**: Fully responsive marketing layout featuring navbar, hero mock IDE panel, workflow walkthrough, and footer.
  - **Auth Pages**: Responsive `/login` and `/signup` forms with Zod field validation and OAuth buttons.
  - **Onboarding Wizard**: `/onboarding` multi-step interface covering Goal Selection, Coding Profiles link, 15-question MCQ Diagnostic, DLT calibration animated loader, reveal of baseline mastery bars, and Roadmap preview.

### CI/CD Pipeline
- GitHub Actions workflow (`.github/workflows/ci.yml`) checking workspace build validation and linting checks.

---

## 2. Key Decisions Made

1. **HttpOnly Cookie Storage for JWTs**:
   - Exclusively stored the authentication payload in HttpOnly, Secure, Lax cookies rather than `localStorage` to mitigate Cross-Site Scripting (XSS) token theft.
2. **JWT payload-based Onboarding State**:
   - Included `onboardingComplete: boolean` directly inside the signed JWT payload. This allows Next.js Edge middleware to verify onboarding status cryptographically without making blocking database calls on every request.
3. **Zod Validation for Frontend & Backend**:
   - Enforced request parsing and form validations on both sides via Zod to guarantee data integrity.
4. **Mocked DLT Baselines in Phase 1**:
   - Initialized baseline masteries to static weights (Arrays: 0.7, Trees: 0.3) upon assessment completion to test front-to-back state transitions before building the actual ML engines in apps/ai.

---

## 3. Problems Encountered & Solutions

### Google OAuth "invalid_client" (Error 401)
- **Problem**: Google OAuth callback failed with `invalid_client` because local client credentials did not register the correct origins.
- **Solution**: Reconfigured client credentials in the Google Cloud Console, registering `http://localhost:3000` (web) and `http://localhost:3001` (API) as authorized JS origins, and `http://localhost:3001/v1/auth/oauth/google/callback` as the authorized redirect URI.

### Environment Schema Build-Time Crashes
- **Problem**: Next.js SSR build collection crashed during production compilation because the strict Zod env schema threw an error when `NEXT_PUBLIC_API_URL` was undefined at compile-time.
- **Solution**: Updated `env.ts` to output a build-safe default URL (`http://localhost:3001`) during static page generation.

### Stale Webpack Module Cache (`./522.js` MODULE_NOT_FOUND)
- **Problem**: Hot-reload in next dev server threw module loader errors due to a corrupt cache build folder.
- **Solution**: Cleared the `.next` directory (`Remove-Item -Recurse -Force .next`) and restarted Next.js via Turbo.

### TypeScript Warning TS2532 in Tests
- **Problem**: NestJS E2E tests for onboarding failed check-compilation because array indices on optional DB responses were flagged as potentially undefined.
- **Solution**: Appended TypeScript non-null assertions (`!`) to variables guaranteed by preceding assertions.

---

## 4. What Was Skipped & Why

1. **AI Recommendation Engine (apps/ai)**:
   - **Reason**: The FastAPI service is scaffolded, but its implementation (retention decay math, ML models, knowledge graphs) belongs to Phase 2/3. Baseline DLT values are mocked inside the NestJS service for Phase 1.
2. **Blockly / Drag-and-Drop Games**:
   - **Reason**: The game interfaces are planned for the Practice Worlds section in Phase 2/3 and were not needed to compile onboarding flow routing.

---

## 5. State of Codebase at Completion

- **Compilation**: Clean production build (`npm run build`) succeeds across all 7 packages.
- **Auth**: Fully operational JWT and Google/GitHub OAuth logins.
- **Onboarding Wizard**: Active at `/onboarding` and fully integrated.
- **Tests**: 100% of API E2E test suites (Auth: 15/15; Onboarding: 7/7) compile and pass successfully.
- **Database**: MongoDB Prisma schema synced, with Redis caching active.
