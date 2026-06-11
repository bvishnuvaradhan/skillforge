SKILLFORGE

Testing Strategy

Unit, integration, E2E, and performance testing — what to test, how, and with what tools

# Chapter 1: Testing Philosophy

SkillForge follows the Testing Trophy model. Most test coverage comes from integration tests because they give the highest confidence at reasonable cost. Unit tests cover pure business logic. E2E tests cover the most critical user journeys only.


[Table]
| Testing Trophy (most to least) | E2E Tests          ← few, slow, expensive — cover critical paths only | ──────────────────────────────────────────── | Integration Tests  ← most coverage here — test API endpoints end-to-end | ──────────────────────────────────────────── | Unit Tests         ← fast, pure functions — DLT calculations, formulas | ──────────────────────────────────────────── | Static Analysis    ← TypeScript + ESLint — catches errors before runtime |



[Table]
| Test Type | Tool | Coverage Target | Run When |
| Unit Tests | Jest | 90%+ on business logic | On every commit (CI) |
| Integration Tests | Jest + Supertest | 80%+ on API endpoints | On every PR (CI) |
| E2E Tests | Playwright | 10 critical user flows | Before every release |
| Component Tests | React Testing Library | Key UI components | On frontend PRs |
| Performance Tests | k6 | Critical endpoints | Before major releases |
| Security Tests | OWASP ZAP | Full surface | Before going live |


# Chapter 2: Unit Tests (Backend)

Unit tests cover pure functions with no external dependencies. These run in milliseconds and should be the fastest feedback loop.

## 2.1 What to Unit Test

DLT mastery score calculation formula

Retention decay formula (forgetting curve)

Recommendation arbitration logic (dedup, cooldown, priority)

Roadmap step ordering algorithm

Career readiness composite score formula

XP calculation per action type

Resume score composite calculation

JWT token generation and validation helpers

Input validation schemas (Zod schemas)

## 2.2 Example: Mastery Score Unit Test


[Table]
| mastery.service.spec.ts | describe('MasteryService', () => { |   describe('calculateMastery', () => { |     it('should weight game score correctly', () => { |       const result = calculateMastery({ |         gameScore: 0.9, |         assessmentScore: 0.7, |         codingScore: 0.5, |         interviewScore: 0.6, |         retentionScore: 0.8, |       }); |       expect(result).toBeCloseTo(0.72, 2); |     }); |     it('should cap at 1.0', () => { |       const result = calculateMastery({ gameScore:1, assessmentScore:1, ... }); |       expect(result).toBeLessThanOrEqual(1.0); |     }); |     it('should return 0 for no activity', () => { |       const result = calculateMastery({}); |       expect(result).toBe(0); |     }); |   }); | }); |


## 2.3 Example: Retention Decay Unit Test


[Table]
| retention.service.spec.ts | describe('RetentionService', () => { |   describe('calculateDecay', () => { |     it('should return 1.0 at t=0', () => { |       expect(calculateDecay({ stability: 10, daysSince: 0 })).toBe(1.0); |     }); |     it('should decay below 0.7 after enough time', () => { |       const result = calculateDecay({ stability: 5, daysSince: 10 }); |       expect(result).toBeLessThan(0.7); |     }); |     it('should never return negative retention', () => { |       const result = calculateDecay({ stability: 1, daysSince: 100 }); |       expect(result).toBeGreaterThanOrEqual(0); |     }); |   }); | }); |


# Chapter 3: Integration Tests (API)

Integration tests call real API endpoints against a test database. They test the full stack from HTTP request to database and back. These give the highest confidence that the system works correctly.

## 3.1 Test Setup

Use a separate test PostgreSQL database — never run tests against production

Seed the test DB with known fixture data before each test suite

Reset the DB after each test (use database transactions + rollback)

Mock external services: OpenAI API, email sending, S3 uploads

## 3.2 Critical Integration Test Suites

### Auth Tests


[Table]
| auth.integration.spec.ts — Test Cases | POST /auth/register |   ✓ Creates user and returns JWT on valid input |   ✓ Returns 409 when email already exists |   ✓ Returns 400 on missing required fields |   ✓ Returns 400 on weak password (< 8 chars) | POST /auth/login |   ✓ Returns JWT on correct credentials |   ✓ Returns 401 on wrong password |   ✓ Returns 404 on unknown email |   ✓ Returns 429 after 5 failed attempts within 15 min | POST /auth/logout |   ✓ Blacklists token — subsequent requests with same token return 401 | POST /auth/refresh |   ✓ Returns new token on valid refresh token |   ✓ Returns 401 on expired refresh token |   ✓ Old refresh token is invalidated after rotation |


### World & Game Tests


[Table]
| worlds.integration.spec.ts — Test Cases | GET /worlds |   ✓ Returns all worlds with user progress for authenticated student |   ✓ Returns 401 for unauthenticated request | GET /worlds/:slug |   ✓ Returns world detail with lessons and games for unlocked world |   ✓ Returns 403 for locked world |   ✓ Returns 404 for unknown slug | POST /worlds/:slug/games/:id/attempt |   ✓ Records attempt and updates mastery score |   ✓ Does not reduce mastery if new score is lower than existing best |   ✓ Awards correct XP on passing attempt |   ✓ Returns 403 for premium game accessed by free user | POST /worlds/:slug/boss/:level/attempt |   ✓ Passes and awards badge when score >= pass_threshold |   ✓ Fails and returns weak areas when score < pass_threshold |   ✓ Returns 429 during cooldown period after failed attempt |


### DLT & Recommendation Tests


[Table]
| dlt.integration.spec.ts — Test Cases | GET /dlt/me |   ✓ Returns current DLT state for authenticated student |   ✓ overall_mastery is correctly computed from mastery_scores | GET /recommendations |   ✓ Returns only active (not dismissed/snoozed) recommendations |   ✓ Returns maximum 7 recommendations |   ✓ Each recommendation has: why, impact, effort_minutes, confidence | PATCH /recommendations/:id |   ✓ Dismissing sets status to dismissed |   ✓ Snoozing sets snoozed_until to correct future date |   ✓ Returns 404 for recommendation belonging to another user |


### Authorization Tests — Critical


[Table]
| authorization.integration.spec.ts — Test Cases | Student cannot access admin endpoints: |   ✓ GET /admin/users returns 403 for student JWT |   ✓ PATCH /admin/users/:id returns 403 for student JWT | Student cannot access another student's data: |   ✓ GET /resumes/:otherId returns 403 |   ✓ GET /interviews/:otherSessionId/feedback returns 403 |   ✓ GET /dlt/me always returns own DLT, never another user's | Mentor cannot access student-only endpoints with wrong role: |   ✓ POST /worlds/:slug/boss/:level/attempt returns 403 for mentor JWT | Unauthenticated requests rejected: |   ✓ All protected endpoints return 401 with no/invalid JWT |


# Chapter 4: Component Tests (Frontend)

Component tests verify that UI components render correctly and handle interactions as expected. Use React Testing Library — test behavior, not implementation.

## 4.1 Components to Test


[Table]
| Component | Test Cases |
| MasteryBar | Renders correct color for each score range, shows retention risk badge when riskLevel=critical |
| RecommendationCard | Renders all metadata, dismiss button calls onDismiss, snooze opens duration picker |
| BossBattleScreen | Health bars render, correct answer reduces boss HP, wrong answer reduces player HP, victory fires onVictory |
| CodeEditor | Renders Monaco editor, language switch updates syntax highlighting, onCodeChange fires on edit |
| AIMentorChat | Renders message history, send button disabled when empty, shows usage limit warning |
| WorldCard | Locked world shows lock icon, completed shows badge, in-progress shows progress ring |
| StreakWidget | Shows correct streak count, gold flame at 30+, broken streak shows red flame |


## 4.2 Example: MasteryBar Component Test


[Table]
| MasteryBar.test.tsx | describe('MasteryBar', () => { |   it('shows green bar for score >= 0.8', () => { |     render(<MasteryBar topic='Arrays' score={0.85} />); |     const bar = screen.getByRole('progressbar'); |     expect(bar).toHaveStyle('background-color: #06D6A0'); |   }); |   it('shows critical warning icon when riskLevel=critical', () => { |     render(<MasteryBar topic='BFS' score={0.7} riskLevel='critical' />); |     expect(screen.getByRole('img', { name: /critical/i })).toBeInTheDocument(); |   }); |   it('renders topic name', () => { |     render(<MasteryBar topic='Dynamic Programming' score={0.5} />); |     expect(screen.getByText('Dynamic Programming')).toBeInTheDocument(); |   }); | }); |


# Chapter 5: E2E Tests (Playwright)

E2E tests simulate a real user in a real browser. They are slow and expensive — only write E2E tests for the most critical user journeys. These run against a staging environment.

## 5.1 Critical User Flows to E2E Test


[Table]
| Flow | Steps Covered | Priority |
| New User Signup & Onboarding | Register → Goal selection → Assessment → DLT generation → Dashboard loads | P0 |
| Complete a Learning Game | Login → Open world → Play game → Submit → See mastery update | P0 |
| Fight a Boss Battle | Login → Open boss → Answer questions → Victory/defeat flow → Badge awarded | P0 |
| AI Interview Session | Login → Start AI interview → Submit answer → Receive feedback report | P1 |
| Resume Builder | Login → Open resume → Auto-fill from profile → Download PDF | P1 |
| Book Human Interview | Login → Browse mentors → Select slot → Confirm booking | P1 |
| Admin Approves Mentor | Admin login → Open pending applications → Approve → Mentor gets badge | P2 |


## 5.2 Example: Onboarding E2E Test


[Table]
| onboarding.e2e.spec.ts | test('new user completes onboarding', async ({ page }) => { |   await page.goto('/signup'); |   await page.fill('[name=name]', 'Test Student'); |   await page.fill('[name=email]', 'test@example.com'); |   await page.fill('[name=password]', 'TestPass123!'); |   await page.click('[data-testid=signup-submit]'); |   // Goal selection |   await expect(page).toHaveURL('/onboarding'); |   await page.click('[data-testid=goal-placements]'); |   await page.click('[data-testid=next-step]'); |   // Skip coding profiles |   await page.click('[data-testid=skip-profiles]'); |   // Answer assessment |   for (let i = 0; i < 15; i++) { |     await page.click('[data-testid=answer-option]:first-child'); |     await page.click('[data-testid=next-question]'); |   } |   // Wait for DLT generation |   await expect(page.locator('[data-testid=dlt-generated]')).toBeVisible({ timeout: 10000 }); |   // Verify dashboard loads |   await expect(page).toHaveURL('/dashboard'); |   await expect(page.locator('[data-testid=daily-focus]')).toBeVisible(); | }); |


# Chapter 6: Performance Tests (k6)

Performance tests verify the system handles load without degrading. Run these before major releases and when scaling.

## 6.1 Performance Targets


[Table]
| Endpoint | Max Response Time (p95) | Target RPS | Notes |
| GET /dashboard | 800ms | 200 rps | Most visited page — must be fast |
| GET /dlt/me | 500ms | 200 rps | Called on every dashboard load |
| GET /recommendations | 600ms | 150 rps | Redis cached — should be fast |
| POST /worlds/:slug/games/:id/attempt | 1000ms | 50 rps | Triggers background DLT job |
| POST /mentor-ai/chat | 5000ms | 20 rps | LLM call — inherently slow |
| POST /auth/login | 300ms | 100 rps | Auth must always be responsive |


## 6.2 Load Test Scenario


[Table]
| load-test.k6.js | import http from 'k6/http'; | import { check, sleep } from 'k6'; | export const options = { |   stages: [ |     { duration: '2m', target: 50 },   // Ramp up to 50 users |     { duration: '5m', target: 200 },  // Hold at 200 users |     { duration: '2m', target: 0 },    // Ramp down |   ], |   thresholds: { |     'http_req_duration': ['p(95)<800'],  // 95% under 800ms |     'http_req_failed': ['rate<0.01'],    // < 1% error rate |   }, | }; | export default function () { |   const res = http.get('https://api.skillforge.app/v1/dlt/me', { |     headers: { Authorization: `Bearer ${__ENV.TEST_TOKEN}` } |   }); |   check(res, { 'status is 200': (r) => r.status === 200 }); |   sleep(1); | } |


# Chapter 7: CI/CD Pipeline

All tests run automatically in GitHub Actions on every push and pull request.

## 7.1 Pipeline Stages


[Table]
| .github/workflows/ci.yml — Pipeline | on: [push, pull_request] | jobs: |   lint: |     - ESLint on frontend and backend |     - TypeScript type checking (tsc --noEmit) |     - Prettier format check |   unit-tests: |     - Jest unit tests (backend) |     - Coverage report generated |     - Fail if coverage < 80% on business logic |   integration-tests: |     - Spin up PostgreSQL test container (Docker) |     - Run migrations |     - Jest + Supertest integration tests |     - Tear down test DB |   component-tests: |     - React Testing Library tests |     - Vitest on frontend |   security-scan: |     - npm audit (fail on high severity) |     - Snyk dependency scan |   e2e-tests: (on PR to main only) |     - Deploy to staging environment |     - Playwright E2E test suite |     - Notify team of results |   deploy: (on merge to main only) |     - Deploy backend to Railway |     - Deploy frontend to Vercel |     - Run smoke tests on production |


## 7.2 Coverage Requirements


[Table]
| Area | Minimum Coverage | Tool |
| Business logic services (DLT, Mastery, Retention) | 90% | Jest --coverage |
| API endpoint handlers | 80% | Jest + Supertest |
| Utility functions | 85% | Jest |
| Frontend components (critical) | 70% | React Testing Library |
| Overall codebase | 75% | Combined |

