# Phase 5 Summary — Career & Interviews

This document summarizes all changes implemented across Phase 5, including validation status, verified mathematical formulas, and known limitations.

---

## Accomplished Features

### 1. Database Schema Updates
- Added new Enums: `InterviewSessionType`, `InterviewType`, `InterviewStatus`, `MentorRecommendation`, `MentorVerificationStatus`, `ResumeTemplate`, and `ExamCategory`.
- Extended the `ExamType` enum and upgraded `ExamAttempt` model (adding `examId`, `passed`, `timeSeconds`, `startedAt` fields) in `schema.prisma`.
- Created models: `InterviewSession`, `InterviewFeedback`, `MentorProfile`, `MentorAvailability`, `MentorReview`, `Resume`, and `ResumeScore` to support a full mentor marketplace and resume evaluation engine.

### 2. Backend Modules & REST APIs
- **Interviews Module**: Created endpoints for starting AI mock interviews, message loops, final 4-dimension scoring, mentor marketplace listings, slot booking checkout sessions, Stripe webhook fee splits, and mentor reviews.
  - **Stripe Dev-Bypass Payment Guardrail**: A strict server-side check rejects `bypassPayment: true` requests when `process.env.NODE_ENV === 'production'`, returning `403 Forbidden` regardless of credentials or configuration.
- **Career Module**: Built resume template creator, LLM-powered 6-dimension scoring, LinkedIn SEO keyword optimizer rewrites, and company readiness composite scores.
- **Exams Module**: Created exams list catalog, started attempts, and implemented answer-by-answer difficulty adaptation & linear XP rewards.
- **Live Room Gateway**: Configured Socket.io gateway namespace `/live-interviews` supporting collaborative Monaco code syncing and live cursor coordinates.

### 3. Frontend Client Portals
- **Interviews Dashboard** (`/interviews`): Main launcher, user sessions history list, and mentor marketplace with checkout/bypass hooks.
- **AI Mock Room** (`/interviews/ai`): Active session chat view with Monaco editor and evaluation checkout.
- **Feedback Report** (`/interviews/feedback/[sessionId]`): Scoring report displaying 4-dimension metrics, strengths, improvements, and next steps.
- **Live Collaborative Room** (`/interviews/[sessionId]`): Real-time screen with synchronized editor, cursor tracking, mock video layouts, and animated audio wave meters.
- **Career Hub** (`/career`): Suitability segment gauges, YC startup guides, and LinkedIn bio rewriters.
- **Resume Builder** (`/career/resume`): Form prefilling skill tags, templates picker, ATS feedback sidebar, and print stylesheets.
- **Exams Catalog & Runner** (`/exams` and `/exams/[examId]`): Adaptive test runner answering questions sequentially, checking correctness, and showing scorecard completion summary.

---

## Verification & Tests

### 1. E2E Integration Suite Run
Added tests in `interviews.e2e-spec.ts`, `career.e2e-spec.ts`, and `exams.e2e-spec.ts` covering AI mock loop evaluations, booking payments, ATS feedback metrics, and adaptive exam difficulty shifts. The full E2E test suite executes and passes cleanly:
```
PASS test/onboarding.e2e-spec.ts (29.215 s)
PASS test/interviews.e2e-spec.ts (11.450 s)
PASS test/career.e2e-spec.ts (8.210 s)
PASS test/exams.e2e-spec.ts (9.840 s)
PASS test/boss-session.e2e-spec.ts (7.550 s)
PASS test/auth.e2e-spec.ts (6.105 s)
PASS test/intelligence.e2e-spec.ts (8.112 s)
PASS test/users.e2e-spec.ts (9.880 s)
PASS test/oauth.e2e-spec.ts (7.250 s)
PASS test/learning-loop.e2e-spec.ts (6.340 s)
PASS test/app.e2e-spec.ts (5.220 s)

Test Suites: 11 passed, 11 total
Tests:       119 passed, 119 total
Time:        112.55 s
```

### 2. Automated Browser Walkthrough
A Puppeteer-driven browser walkthrough (`run_walkthrough_phase5.js`) was run to play through all client pages. It successfully logged in, seeded all necessary mock profiles (Sarah Mentor, primary resume, completed AI evaluation, upcoming system design session), and saved 7 high-fidelity screenshots:
- `walkthrough_5_interviews_dashboard.png` — Main interviews hub.
- `walkthrough_5_ai_interview_room.png` — Active chat room with Monaco code editor.
- `walkthrough_5_ai_feedback_report.png` — Evaluation metrics and recommendation badges.
- `walkthrough_5_live_room.png` — Collaborative Monaco sync screen.
- `walkthrough_5_resume_builder.png` — Skill tags prefilled from the student's DLT profile.
- `walkthrough_5_exams_catalog.png` — Available tests and assessments list.
- `walkthrough_5_exams_runner.png` — Question runner workspace.

---

## Verified Mathematics Walkthrough

### 1. Stripe Commission Split Math (Dev-Bypass Booking)
* **Mentor's Configured Session Price**: `$120.00`
* **Price Paid / Recorded (`pricePaid`)**: `$120.00`
* **Mentor Commission Split**: **85%**
* **Mentor Credited (`totalEarned` increment)**:
  $$\$120.00 \times 0.85 = \$102.00$$
* **SkillForge Platform Commission (15%)**:
  $$\$120.00 \times 0.15 = \$18.00$$
* **Resulting Output**:
  $$\text{price\_paid: } \$120.00 \to \text{mentor credited: } \$102.00$$

### 2. Adaptive Exam Run Graded Score & XP
* **Attempt Question Sequence & Results**:
  1. **Q1 (`e1`, Easy)**: Correct $\to$ Points: `1.0` / Weight: `1.0`
  2. **Q2 (`m1`, Medium)**: Incorrect $\to$ Points: `0.0` / Weight: `1.5`
  3. **Q3 (`e2`, Easy)**: Incorrect $\to$ Points: `0.0` / Weight: `1.0`
  4. **Q4 (`e3`, Easy)**: Incorrect $\to$ Points: `0.0` / Weight: `1.0`
  5. **Q5 (`e4`, Easy)**: Incorrect $\to$ Points: `0.0` / Weight: `1.0`
  6. **Q6 (`m2`, Medium)**: Incorrect $\to$ Points: `0.0` / Weight: `1.5` *(Selected as fallback because all 4 easy questions in database were already answered)*
* **Grader Calculations**:
  * **Points Earned (Numerator)**: $1.0$
  * **Attempted Weights (Denominator)**: $1.0 + 1.5 + 1.0 + 1.0 + 1.0 + 1.5 = 7.0$
  * **Final Score**: $1.0 / 7.0 \approx 14.29\%$
  * **XP Awarded**: $120 \times 0.142857 \approx 17$ XP
* **Resulting Output**:
  $$\text{final score: } 14.29\%, \text{ XP awarded: } 17$$

---

## Known Limitations & Planned TODOs

### 1. Exams Seed Data Exhaustion / Under-scoped Seed Dataset
- **Limitation**: Currently, the question bank has only 4 Easy questions (e.g. `e1`, `e2`, `e3`, `e4`), meaning a single 6-question attempt exhausts the Easy tier pool and falls back to Medium (e.g., Q6 falling back to `m2`). 
- **TODO**: Expand the exam question seed data to include a substantially larger pool per difficulty tier (minimum 10-15 per tier) to support repeated or longer adaptive exam attempts without students seeing duplicate questions within the same sitting or across practice sessions.

### 2. Mock Video Streams in Collaborative Live Room
- **Limitation**: Video stream is mocked on the frontend client page with connection state UI, which covers the visual design of the interface but uses mock signals instead of real WebRTC connections (NAT/TURN configuration was deferred).
- **TODO**: In a future phase, integrate WebRTC signalling and standard TURN servers to establish peer-to-peer video streams.
