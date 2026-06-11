SkillForge — Project Status
Last updated: June 11, 2026, 1:45 PM
Current phase: Phase 1
Overall progress: Phase 1 of 5
Phase 1 — Foundation
Completed

- Monorepo Setup — Turborepo initialized with workspaces: apps/web, apps/api, apps/ai, packages/db, packages/types, packages/ui, packages/tsconfig, packages/eslint-config
- Shared configuration packages — packages/tsconfig and packages/eslint-config created and integrated across workspaces
- Backend Scaffold — NestJS project scaffolded with strict TypeScript, configured to extend shared config, and GET /health endpoint implemented and verified
- Frontend Scaffold — Next.js 14 App Router project scaffolded and configured to extend shared config
- AI Service Scaffold — FastAPI Python service scaffolded in apps/ai with GET /health endpoint and requirements.txt
- Environment Variables — .env.example files created in apps/web, apps/api, and apps/ai documentation from agents.md
- CI/CD pipeline — GitHub Actions workflow (.github/workflows/ci.yml) created for automated linting and build verification
- Database Schema — Prisma schema redesigned and pushed to MongoDB with users, oauth_accounts, sessions, and coding_profiles collections, verified using a read/write test script
- Auth Layer — Register, Login (with rate-limiting), Logout (with Redis blacklist token check), Refresh Token Rotation, JWT Strategy, and NestJS Auth/Roles Guards (fully verified with 15 passing E2E tests)
- User Profile API — Fetching current user (`GET /users/me`), updating profile (`PATCH /users/me`), soft account deletion (`DELETE /users/me`), and public/private controls on profile retrieval (`GET /users/:id/profile`) (fully verified with E2E tests)
- Coding Profiles — Manual platform linking (`POST /users/me/coding-profiles`) and unlinking (`DELETE /users/me/coding-profiles/:platform`) for students (fully verified with E2E tests)
- Onboarding Flow — Assessment setup (`POST /onboarding/assessment`), primary goal setting (`POST /onboarding/goal`), and onboarding completion (`POST /onboarding/complete`) which initializes DltState and Roadmap tracks (fully verified with E2E tests)
- OAuth Integration — Google and GitHub OAuth authentication integration with automatic account linking, httpOnly cookie state propagation, and callback redirection (fully verified with E2E tests)

In Progress

- none

Remaining

- Landing Page — marketing landing page at skillforge.app
- Login + Signup Pages — authentication pages with validation and OAuth buttons
- Staging Deployment — Railway + Vercel staging environments and configurations

Blockers

none

Phase History

Phase 1 — status: in progress
Phase 2 — status: not started
Phase 3 — status: not started
Phase 4 — status: not started
Phase 5 — status: not started
