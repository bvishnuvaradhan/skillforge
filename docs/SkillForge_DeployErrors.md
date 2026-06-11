SKILLFORGE

Deployment Runbook

&

Error Handling Guide

Step-by-step deployment to production + standardized error patterns across the stack

# PART A: Deployment Runbook

This runbook documents every step required to deploy SkillForge from source code to a live production environment. Follow these steps in order. Never skip steps in production.

## A.1 Pre-Deployment Checklist

Before deploying any release, verify all of the following:

All CI/CD checks pass on the release branch (lint, unit tests, integration tests)

E2E tests pass on the staging environment

Database migrations have been reviewed and tested on staging

All environment variables for the new release are configured in production

The release has been code-reviewed and approved by at least one other team member

A rollback plan is documented for this release

The team is available during deployment (do not deploy on Fridays or before holidays)

## A.2 Environment Setup

### A.2.1 Required Environment Variables — Backend (NestJS)


[Table]
| Backend .env.production | # Database | DATABASE_URL=postgresql://user:password@host:5432/skillforge_prod?sslmode=require | REDIS_URL=rediss://user:password@upstash-host:6379 | NEO4J_URI=neo4j+s://your-neo4j-aura-uri | NEO4J_USERNAME=neo4j | NEO4J_PASSWORD=your-neo4j-password | # Auth | JWT_SECRET=minimum-256-bit-random-secret-here | JWT_EXPIRES_IN=15m | REFRESH_TOKEN_SECRET=different-256-bit-secret | REFRESH_TOKEN_EXPIRES_IN=7d | # OAuth | GOOGLE_CLIENT_ID=your-google-oauth-client-id | GOOGLE_CLIENT_SECRET=your-google-oauth-secret | GITHUB_CLIENT_ID=your-github-oauth-client-id | GITHUB_CLIENT_SECRET=your-github-oauth-secret | # AI | OPENAI_API_KEY=sk-your-openai-key | ANTHROPIC_API_KEY=sk-ant-your-anthropic-key | # Storage | R2_ACCOUNT_ID=your-cloudflare-account-id | R2_ACCESS_KEY=your-r2-access-key | R2_SECRET_KEY=your-r2-secret | R2_BUCKET_NAME=skillforge-production | # Email | RESEND_API_KEY=re_your-resend-key | EMAIL_FROM=noreply@skillforge.app | # App | NODE_ENV=production | PORT=3001 | FRONTEND_URL=https://skillforge.app | SENTRY_DSN=your-sentry-dsn |


### A.2.2 Required Environment Variables — Frontend (Next.js)


[Table]
| Frontend .env.production | NEXT_PUBLIC_API_URL=https://api.skillforge.app/v1 | NEXT_PUBLIC_SOCKET_URL=https://api.skillforge.app | NEXT_PUBLIC_SENTRY_DSN=your-frontend-sentry-dsn | NEXTAUTH_SECRET=your-nextauth-secret | NEXTAUTH_URL=https://skillforge.app |


## A.3 Database Deployment

### A.3.1 First-Time Database Setup

Create a PostgreSQL database on Supabase or Railway

Note the connection string — add to DATABASE_URL env variable

Enable the uuid-ossp extension: CREATE EXTENSION IF NOT EXISTS uuid-ossp;

Run Prisma migrations: npx prisma migrate deploy

Verify all tables created: npx prisma studio (check table count)

Run seed script for base data (worlds, badges, feature flags): npx ts-node prisma/seed.ts

### A.3.2 Running Migrations on Updates

Test migration on staging database first — never run untested migrations on production

Back up production database before any migration: pg_dump or Supabase dashboard

Deploy new backend code (migration runs automatically via Prisma in deploy script)

Verify migration succeeded: npx prisma migrate status

Monitor error logs for 15 minutes after migration


[Table]
| ⚠️ Migration Safety Rules | NEVER use DROP COLUMN or DROP TABLE in a migration without a 2-step deployment: |   Step 1: Deploy code that no longer uses the column |   Step 2: Deploy migration that removes the column | NEVER rename a column in one migration — add new column, migrate data, drop old. | ALWAYS make new columns NULLABLE or have DEFAULT values. | ALWAYS test migrations on a production-sized DB snapshot before running on prod. |


## A.4 Backend Deployment (Railway)

Push code to main branch on GitHub

Railway auto-detects push and begins deployment pipeline

Railway builds Docker image from Dockerfile in /apps/api

Environment variables are injected from Railway project settings

New container starts — Railway runs health check: GET /health

If health check passes within 60s: traffic switches to new container

If health check fails: Railway automatically rolls back to previous deployment

Monitor Railway deployment logs for any startup errors

Run smoke tests: curl https://api.skillforge.app/v1/health


[Table]
| Dockerfile — Backend | FROM node:20-alpine | WORKDIR /app | COPY package*.json ./ | RUN npm ci --only=production | COPY . . | RUN npx prisma generate | RUN npm run build | EXPOSE 3001 | CMD ["node", "dist/main.js"] |


### A.4.1 Health Check Endpoint


[Table]
| GET /health — Response | { |   "status": "ok", |   "timestamp": "2025-01-15T10:30:00Z", |   "services": { |     "database": "ok", |     "redis": "ok", |     "ai_service": "ok" |   }, |   "version": "1.4.2" | } |


## A.5 Frontend Deployment (Vercel)

Push code to main branch — Vercel auto-deploys

Vercel builds Next.js app: next build

Static pages are deployed to Vercel's global CDN

Preview URL generated: https://skillforge-git-main.vercel.app

If build succeeds: production domain updated automatically

If build fails: Vercel preserves previous deployment — no downtime

Verify deployment: visit https://skillforge.app and check critical pages

## A.6 AI Service Deployment (Railway / Render)

Python FastAPI service has its own Dockerfile in /apps/ai

Deploy to Railway as a separate service in the same project

Environment variables: OPENAI_API_KEY, ANTHROPIC_API_KEY, DATABASE_URL

Health check: GET /health on the AI service

Backend NestJS must have AI_SERVICE_URL env variable pointing to the AI service

## A.7 Rollback Procedure

If a deployment causes production errors, roll back immediately. Do not try to fix-forward under pressure.

### Rolling Back Backend (Railway)

Go to Railway project → Deployments tab

Find the last successful deployment

Click Rollback — Railway redeploys the previous image

If migration was deployed: restore DB from backup taken before migration

Notify team in Slack/Discord that rollback is in progress

### Rolling Back Frontend (Vercel)

Go to Vercel project → Deployments

Find the last successful deployment

Click the three-dot menu → Promote to Production

Vercel instantly switches the production domain to the old deployment

## A.8 Monitoring & Alerts


[Table]
| What to Monitor | Tool | Alert Condition |
| API error rate | Sentry | Error rate > 1% triggers Slack alert |
| API response time | Railway metrics | p95 > 2 seconds triggers alert |
| Database connections | Supabase dashboard | Connection pool > 80% full |
| Redis memory | Upstash console | Memory > 80% of limit |
| Background job failures | BullMQ dashboard | Any job fails 3 retries |
| Frontend errors | Sentry (browser) | New error type triggers alert |
| Uptime | UptimeRobot (free) | Downtime > 1 min sends email + SMS |


# PART B: Error Handling Guide

Standardized error handling across all layers of SkillForge ensures consistent developer experience, easier debugging, and clear user-facing messages.

## B.1 Error Classification


[Table]
| Category | Examples | Who Sees It | How to Handle |
| Validation Error | Missing field, invalid UUID, weak password | User (specific message) | Return 400 with field-level errors |
| Auth Error | Expired token, wrong password, missing token | User (generic message) | Return 401/403, never reveal reason |
| Business Logic Error | Boss cooldown active, world locked, plan limit | User (helpful message) | Return 400/402/409 with action suggestion |
| Not Found | Resource doesn't exist or user can't see it | User (generic) | Return 404 — never reveal if private |
| Rate Limit | Too many requests | User (retry message) | Return 429 with Retry-After header |
| External Service Error | OpenAI down, email failed, S3 error | Log only, user sees fallback | Return 503, log full error, show fallback UI |
| Unexpected Error | Null pointer, DB timeout, uncaught exception | Log only, user sees generic | Return 500, log to Sentry, never expose stack trace |


## B.2 Backend Error Handling (NestJS)

### B.2.1 Global Exception Filter

One global exception filter catches all unhandled errors and formats them into the standard error envelope before sending to the client.


[Table]
| global-exception.filter.ts | @Catch() | export class GlobalExceptionFilter implements ExceptionFilter { |   catch(exception: unknown, host: ArgumentsHost) { |     const ctx = host.switchToHttp(); |     const response = ctx.getResponse<Response>(); |     const request = ctx.getRequest<Request>(); |     // Known HTTP exceptions (thrown intentionally) |     if (exception instanceof HttpException) { |       const status = exception.getStatus(); |       const exceptionResponse = exception.getResponse(); |       return response.status(status).json({ |         success: false, |         error: { |           code: this.getErrorCode(status, exceptionResponse), |           message: this.getUserMessage(exceptionResponse), |           details: this.getDetails(exceptionResponse), |         } |       }); |     } |     // Unknown errors — log to Sentry, return generic 500 |     Sentry.captureException(exception); |     return response.status(500).json({ |       success: false, |       error: { |         code: 'INTERNAL_ERROR', |         message: 'Something went wrong. Please try again.', |         details: {} |       } |     }); |   } | } |


### B.2.2 Throwing Standard Errors


[Table]
| How to throw errors in NestJS services | // Validation error | throw new BadRequestException({ |   code: 'VALIDATION_ERROR', |   message: 'Password must be at least 8 characters', |   field: 'password' | }); | // Not found | throw new NotFoundException({ |   code: 'NOT_FOUND', |   message: 'World not found' | }); | // Business logic error (e.g. boss cooldown) | throw new BadRequestException({ |   code: 'BOSS_COOLDOWN_ACTIVE', |   message: 'You can retry this boss in 18 hours', |   retry_after: cooldownExpiry.toISOString() | }); | // Payment required (premium feature) | throw new HttpException({ |   code: 'PREMIUM_REQUIRED', |   message: 'Memory Lab is a Premium feature', |   upgrade_url: '/pricing' | }, 402); |


## B.3 Frontend Error Handling

### B.3.1 API Error Interceptor (React Query)


[Table]
| api-client.ts — Global Error Handler | const queryClient = new QueryClient({ |   defaultOptions: { |     queries: { |       retry: (failureCount, error) => { |         // Never retry 4xx errors — they won't resolve |         if (error.status >= 400 && error.status < 500) return false; |         // Retry 5xx up to 2 times with exponential backoff |         return failureCount < 2; |       }, |       onError: (error) => { |         if (error.status === 401) { |           // Token expired — redirect to login |           authStore.logout(); |           router.push('/login?reason=session_expired'); |         } |         if (error.status === 403) { |           toast.error('You do not have permission to do this'); |         } |         // Log all errors to Sentry |         Sentry.captureException(error); |       } |     } |   } | }); |


### B.3.2 User-Facing Error Messages


[Table]
| Error Code | User Sees | Action Shown |
| VALIDATION_ERROR | Field-specific message under the input | Fix the field and retry |
| UNAUTHORIZED | 'Your session expired. Please log in again.' | Redirect to login |
| FORBIDDEN | 'You do not have permission to do this.' | None |
| NOT_FOUND | 'This page does not exist.' | Go to dashboard button |
| PREMIUM_REQUIRED | 'This feature requires Premium. Upgrade to unlock.' | Upgrade button |
| BOSS_COOLDOWN_ACTIVE | 'You can retry in X hours.' | Countdown timer shown |
| RATE_LIMITED | 'You are doing that too fast. Please wait a moment.' | Auto-retry after delay |
| INTERNAL_ERROR | 'Something went wrong. We have been notified.' | Retry button |


## B.4 Error Handling for External Services

External services (OpenAI, Resend email, S3) can fail. The platform must handle these gracefully — users should never see raw API errors.


[Table]
| Service | Failure | Fallback Behavior |
| OpenAI / Anthropic API | Timeout or 5xx from LLM | Show 'AI Mentor is temporarily unavailable. Try again in a few minutes.' — do not retry immediately |
| Resend (email) | Email delivery fails | Log the failure, retry once after 5 minutes via BullMQ, log if second attempt fails |
| Cloudflare R2 (storage) | File upload fails | Return error to user: 'File upload failed. Please try again.' — do not create partial DB records |
| Neo4j (Knowledge Graph) | Connection timeout | Fall back to cached roadmap from Redis — log the Neo4j error to Sentry |
| Redis (cache) | Redis unavailable | Fall through to PostgreSQL — slower but correct. Log Redis error, alert team. |


## B.5 Error Logging Standards

### B.5.1 What to Log

Log all 5xx errors with: request method, path, user ID, error message, stack trace

Log all 4xx auth errors with: IP address, user ID (if any), endpoint

Log all external service failures with: service name, error code, request context

Log all background job failures with: job name, attempt number, error message

### B.5.2 What NOT to Log

Never log passwords, JWT tokens, or OAuth tokens

Never log full request bodies that may contain sensitive data

Never log PII (email, name, phone) in error messages — use user ID only

Never log LLM prompt content in production (contains learner data)

### B.5.3 Log Levels


[Table]
| Level | When to Use | Example |
| ERROR | System cannot recover, needs immediate attention | DB connection failed, unhandled exception |
| WARN | Unexpected but recoverable situation | Redis cache miss, external service slow |
| INFO | Normal significant events | User registered, boss battle completed, world unlocked |
| DEBUG | Development only — never in production | SQL queries, request/response bodies |


## B.6 Error Monitoring Setup (Sentry)

Create a Sentry project for SkillForge backend and one for frontend

Install: npm install @sentry/node (backend), @sentry/nextjs (frontend)

Initialize Sentry at app startup with DSN from environment variable

Set environment tag: Sentry.setTag('environment', process.env.NODE_ENV)

Set user context on auth: Sentry.setUser({ id: user.id }) — no email

Configure alert rules: email + Slack on new error types, spike alerts

Set up release tracking: tag Sentry releases with git commit SHA

Review Sentry dashboard weekly — resolve or assign all new errors
