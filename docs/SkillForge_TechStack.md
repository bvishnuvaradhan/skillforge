SKILLFORGE

Tech Stack & Architecture

Complete technology decisions, reasoning, and architecture

Document 1 of 3  |  SkillForge Technical Series

# Chapter 1: Why This Stack?

SkillForge is not a simple CRUD app. It has real-time features (live games, interviews, nudges), AI-heavy systems (Digital Learning Twin, Recommendation Engine, AI Mentor), complex data relationships (Knowledge Graph), and scale requirements (thousands of students per institution). Every technology choice must support these demands.

The stack is chosen with three priorities: developer productivity for a student team, scalability when users grow, and AI-first architecture because the platform's value comes from intelligence.


[Table]
| Core Stack Summary | Frontend:     Next.js (React) + TypeScript + Tailwind CSS | Backend:      Node.js + Express / NestJS | Database:     PostgreSQL (primary) + Redis (cache) + Neo4j (Knowledge Graph) | AI Layer:     Python (FastAPI) + OpenAI / Anthropic API + Custom ML models | Auth:         NextAuth.js + JWT | Storage:      AWS S3 / Cloudflare R2 | Realtime:     Socket.io / Supabase Realtime | Deploy:       Vercel (frontend) + Railway / Render (backend) + AWS (AI layer) |


# Chapter 2: Frontend

## 2.1 Framework — Next.js (React) + TypeScript

Next.js is the best choice for SkillForge because it supports both static pages (landing, docs) and dynamic app pages (dashboard, games) in one framework. TypeScript prevents bugs in a large codebase — critical when managing complex state like the Digital Learning Twin.


[Table]
| Decision | Choice | Why |
| Framework | Next.js 14 (App Router) | SSR for SEO on public pages, client-side for app |
| Language | TypeScript | Type safety across complex data models |
| Styling | Tailwind CSS | Fast, consistent, dark-mode friendly |
| Component Library | shadcn/ui | Accessible, customizable, developer-friendly |
| State Management | Zustand + React Query | Simple global state + server state caching |
| Forms | React Hook Form + Zod | Validated forms for onboarding, resume builder |
| Charts & Data Viz | Recharts + D3.js | Mastery charts, retention heatmaps, roadmap viz |
| Code Editor | Monaco Editor | Same editor as VS Code — familiar to coders |
| Drag & Drop (Blockly) | React DnD + custom | Blockly-style visual programming blocks |
| Animations | Framer Motion | World unlock animations, game transitions |
| Icons | Lucide React | Clean, consistent icon set |


## 2.2 Why Dark Theme First?

Coding students live in dark-themed environments — VS Code, terminal, browser devtools. A dark-first UI is not just aesthetic, it is contextually appropriate. The platform should feel like home to a developer, not like a school LMS.

## 2.3 Mobile Strategy

Use Tailwind responsive classes throughout. Mobile layout is a single-column card stack. Games use touch events via React DnD touch backend. The Monaco Editor is desktop-only — replaced with a read-only code viewer on mobile.

# Chapter 3: Backend

## 3.1 Runtime — Node.js + NestJS

Node.js handles high concurrency well — important for real-time features like live games and nudge delivery. NestJS provides a structured, modular architecture that scales well as the codebase grows. Its decorator-based approach is clean and readable for a team.


[Table]
| Layer | Technology | Purpose |
| Runtime | Node.js 20 LTS | Async, event-driven, handles concurrent users well |
| Framework | NestJS | Modular architecture, TypeScript native, scales cleanly |
| API Style | REST + WebSocket | REST for CRUD, WebSocket for real-time (games, interviews) |
| ORM | Prisma | Type-safe database queries, clean migrations, works with PostgreSQL |
| Validation | class-validator + Zod | Request validation at controller and service layer |
| Auth | Passport.js + JWT + OAuth2 | JWT sessions + Google/GitHub login |
| File Uploads | Multer + S3 | Resume PDF uploads, profile images |
| Email | Resend / Nodemailer | Nudge emails, streak reminders, OTP |
| Queue / Jobs | BullMQ + Redis | Background jobs: DLT updates, nudge scheduling, report generation |
| Testing | Jest + Supertest | Unit and integration tests for all services |


## 3.2 API Architecture

The backend is organized into domain modules. Each major SkillForge feature maps to its own NestJS module:

auth/ — Authentication, JWT, OAuth

users/ — Student, Mentor, Admin profiles

worlds/ — Learning worlds, lessons, games, boss battles

dlt/ — Digital Learning Twin engine

recommendations/ — Recommendation generation and arbitration

roadmap/ — Personalized roadmap generation

memory/ — Retention tracking, forgetting curves, Memory Lab

interviews/ — AI and human mock interviews

resume/ — Resume builder and scoring

community/ — Teams, competitions, leaderboards

notifications/ — Smart nudge system

analytics/ — Dashboard data aggregation

# Chapter 4: Databases

## 4.1 PostgreSQL — Primary Database

PostgreSQL handles all structured relational data. It is battle-tested, supports complex queries, and has excellent support in the Node.js ecosystem via Prisma.

Stores: Users, roles, progress records, mastery scores, retention data, exam results, resume data, interview records, community data, institutional data.

## 4.2 Redis — Cache & Queue

Redis serves two purposes: caching frequently accessed data (dashboard widgets, leaderboards) and powering the BullMQ job queue for background processing.

Cache: Dashboard data (TTL 5 mins), leaderboard rankings (TTL 1 min), recommendation sets (TTL 15 mins)

Queue: DLT recalculation jobs, nudge scheduling, report generation, email delivery

## 4.3 Neo4j — Knowledge Graph

The Knowledge Graph (topic relationships, prerequisite chains) is a natural fit for a graph database. Neo4j allows fast traversal of concept dependencies — critical for roadmap generation and world unlock logic.


[Table]
| Example Neo4j Query — Find prerequisites for a topic | MATCH (t:Topic {name: 'Dynamic Programming'}) | <-[:PREREQUISITE*]-(prereq:Topic) | RETURN prereq.name, prereq.mastery_threshold |


## 4.4 Database Summary


[Table]
| Database | Use Case | Why This Choice |
| PostgreSQL | All structured app data | Relational, reliable, excellent Prisma support |
| Redis | Cache + job queues | Fast in-memory, TTL support, BullMQ native |
| Neo4j | Knowledge Graph only | Graph traversal is its core strength |
| AWS S3 / R2 | File storage | Resume PDFs, profile pictures, interview recordings |


# Chapter 5: AI Layer

## 5.1 Architecture — Python Microservice

All AI/ML logic lives in a separate Python FastAPI microservice. This is intentional — Python has the best AI/ML ecosystem (scikit-learn, PyTorch, LangChain, spaCy). The Node.js backend calls this service via internal HTTP API. The AI service is independently deployable and scalable.

## 5.2 AI Components


[Table]
| Feature | AI Approach | Tech Used |
| Digital Learning Twin | Weighted scoring model + decay functions | Python + numpy + custom formulas |
| Recommendation Engine | Rule-based + collaborative filtering | Python + scikit-learn |
| Memory / Forgetting Curves | Ebbinghaus exponential decay model | Python + scipy |
| AI Mentor | LLM with learner context injected | OpenAI GPT-4o / Anthropic Claude API |
| AI Mock Interviews | LLM + structured prompt templates | OpenAI API + LangChain |
| Resume Score Engine | NLP keyword analysis + rule-based scoring | Python + spaCy + custom rules |
| Forecasting Engine | Linear regression + trend extrapolation | Python + scikit-learn |
| Skill DNA | Behavioral clustering + pattern analysis | Python + scikit-learn KMeans |
| Adaptive Quiz Generation | LLM with topic + difficulty constraints | OpenAI API + structured output |


## 5.3 LLM Usage

The platform uses LLMs (GPT-4o or Claude) for three things: AI Mentor conversations, AI mock interview question generation and evaluation, and adaptive quiz/challenge generation. LLM calls are wrapped with structured prompt templates and output parsing to ensure consistency.


[Table]
| LLM Cost Control Strategy | 1. Cache common mentor answers (same question from many users) with Redis | 2. Use smaller/cheaper models for quiz generation; reserve GPT-4o for mentor + interviews | 3. Limit AI Mentor to 3 questions/day on Free tier | 4. Batch quiz generation during off-peak hours using BullMQ |


# Chapter 6: Real-Time & Infrastructure

## 6.1 Real-Time — Socket.io

Real-time communication is needed for: live game state updates, live interview sessions (code sync between student and mentor), leaderboard updates, and nudge delivery. Socket.io runs on the NestJS backend with Redis adapter for multi-instance support.


[Table]
| Real-Time Event | Socket Room | Direction |
| Game state update | game:{sessionId} | Server → Client |
| Code sync in interview | interview:{sessionId} | Bidirectional |
| Leaderboard update | leaderboard:{cohortId} | Server → Client |
| Nudge delivery | user:{userId} | Server → Client |
| World unlock notification | user:{userId} | Server → Client |


## 6.2 Deployment Architecture


[Table]
| Service | Platform | Reason |
| Next.js Frontend | Vercel | Zero-config Next.js deployment, edge CDN |
| NestJS Backend | Railway / Render | Simple Node.js hosting, auto-scaling, free tier available |
| Python AI Service | AWS EC2 / Lambda | GPU access for ML models if needed, scalable |
| PostgreSQL | Supabase / Railway | Managed PostgreSQL, backups included |
| Redis | Upstash | Serverless Redis, pay-per-request, no idle cost |
| Neo4j | Neo4j Aura | Managed cloud graph database, free tier available |
| File Storage | Cloudflare R2 | Cheaper than S3, no egress fees |
| Email | Resend | Developer-friendly, simple API, generous free tier |


## 6.3 Phase 1 Simplified Stack (Start Here)

You do not need everything on day one. Here is the minimum viable tech stack to build Phase 1 of SkillForge:


[Table]
| Phase 1 Tech Stack (MVP) | Frontend:   Next.js + TypeScript + Tailwind + shadcn/ui | Backend:    NestJS + Prisma + PostgreSQL | Auth:       NextAuth.js (Google login) | AI Mentor:  OpenAI API (direct, no Python service yet) | Deploy:     Vercel (frontend) + Railway (backend + DB) | Skip for now: Neo4j, Redis, Python AI service, Socket.io |


Add Neo4j when you implement the Knowledge Graph. Add Redis when caching becomes necessary. Add the Python AI service when you build custom ML models.

# Chapter 7: Development Tools & Workflow

## 7.1 Recommended Dev Tools


[Table]
| Tool | Purpose | Why |
| VS Code | Primary IDE | Best TypeScript support, extensions ecosystem |
| ESLint + Prettier | Code quality | Consistent formatting across team |
| Husky + lint-staged | Pre-commit checks | Prevents bad code from being committed |
| GitHub Actions | CI/CD | Auto-test and deploy on push |
| Postman / Insomnia | API testing | Test all backend endpoints during development |
| Prisma Studio | DB GUI | Visual database browser, great for development |
| Storybook | Component development | Build and test UI components in isolation |
| Sentry | Error monitoring | Catch production errors before users report them |


## 7.2 Folder Structure

skillforge/

  apps/

    web/          <- Next.js frontend

    api/          <- NestJS backend

    ai/           <- Python FastAPI AI service

  packages/

    db/           <- Prisma schema + migrations

    types/        <- Shared TypeScript types

    ui/           <- Shared component library

  docs/           <- Documentation

Use a monorepo managed by Turborepo. This keeps frontend, backend, and shared types in sync without publishing packages.

# Chapter 8: What to Build First

## 8.1 Phase 1 — Core Foundation (Months 1–3)

Focus: Get the Digital Learning Twin, one Learning World, and the Dashboard working end-to-end. Everything else depends on these.


[Table]
| Feature | Tech Involved | Priority |
| Auth (login, roles) | NextAuth + PostgreSQL | P0 |
| Onboarding flow | Next.js + NestJS + Prisma | P0 |
| Variables Kingdom (1 world) | Next.js games + NestJS | P0 |
| Digital Learning Twin (basic) | NestJS + Prisma + formulas | P0 |
| Dashboard (Mission Control) | Next.js + React Query | P0 |
| Basic Recommendations (rule-based) | NestJS | P1 |
| Personalized Roadmap (basic) | NestJS + PostgreSQL | P1 |
| AI Mentor (basic) | OpenAI API | P1 |
| Coding Profile Linking (manual) | NestJS + Prisma | P2 |


## 8.2 Phase 2 — Intelligence Layer (Months 4–6)

Memory Intelligence + Memory Lab

Knowledge Graph (Neo4j integration)

Full Recommendation Arbitration Engine

Forecasting Engine

Skill DNA

More Learning Worlds (Loop Forest, Array Arena)

## 8.3 Phase 3 — Career & Community (Months 7–12)

Mock Interview Platform (AI + Human)

Resume Builder + Score Engine

Career Readiness Engine

Community + Institutional Platform

Company-specific preparation tracks

Mobile app (React Native or PWA)
