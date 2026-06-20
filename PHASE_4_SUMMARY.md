# Phase 4 Summary — Roadmaps Restructure, Boss Redesign & Game Expansion (4A – 4D)

This document summarizes all changes implemented across Phase 4A, 4B, and 4C, including validation status and known limitations.

---

## Accomplished Features

### 1. Database Schema & Curriculum Seeding
- Added `C` to the `LanguageTrack` enum.
- Added `originalProblemsCompleted` and `externalProblemsCompleted` string arrays to the `UserWorldProgress` model in Prisma.
- Upgraded the database seeding script (`seed.ts`) to programmatically seed:
  - 13 structured roadmap modules.
  - Multi-language (C/C++/Java/Python/JS) lessons.
  - Interactive coding games (Modules 1, 2, 3, 4, 6).
  - 3-level boss battle pools (Level 1 MCQ, Level 2 matching pairs, Level 3 coding challenges).

### 2. Redis-Backed Boss Sessions & State Machine
- Created `BossSessionService` to manage active boss battle sessions with a 1-hour Redis cache TTL (`boss_session:${userId}:${bossId}`).
- Enforces the **3 lives state machine** across the battle steps:
  - **Level 1 (Quiz)**: Shuffles 5 out of 8 MCQs. Passing requires `>= 80%` (4/5 correct). Failure deducts 1 life, returns incorrect questions, and shuffles new ones on retry.
  - **Level 2 (Matching)**: Drag-and-drop matching. Passing requires `100%`. Correctly matched pairs are **locked/preserved in place** on retry, while incorrect ones are reset.
  - **Level 3 (Boss Fight)**: Coding task compiled and executed against 2-3 real test cases. Failure or timer timeout deducts 1 life, preserving the partial code in Redis for retries.
  - Reaching `0` lives deletes the session, forcing a full restart from Level 1.

### 3. Local Subprocess Code Execution
- Created `CodeRunnerService` which compiles and runs student code locally:
  - **C**: Compiles with `gcc` to binary, runs with arguments.
  - **C++**: Compiles with `g++` to binary, runs with arguments.
  - **Java**: Compiles `Solution.java` and a `Runner.java` harness with `javac`, runs `java Runner`.
  - **Python**: Executes Python scripts with arguments.
  - **JavaScript**: Executes Node scripts with arguments.
  - Timeout enforcement: 2s (C/C++/Python/JS), 3s (Java).
  - Validates `validationRegex` constructs (e.g. enforcing loop/conditional syntax).
  - Automatically loads host registry PATH on Windows during startup to ensure `gcc`/`g++` are in the execution PATH.

### 4. Roadmaps Routing & Redesigned Pages
- Renamed client-facing routes from `/worlds` to `/roadmaps` (updated sidebar navigation, Next.js matcher middleware, and dashboard links).
- Implemented the `/roadmaps` page featuring the **7-Part Curriculum layout**, with Part 1 active and Parts 2-7 as coming soon placeholders.
- Redesigned `/roadmaps/[slug]` featuring:
  - Lessons completion track.
  - Interactive games access.
  - **Practice Problems Tab**: Original problems solvable in an inline Monaco Code Editor, and External links (LeetCode/Codeforces) with a self-reporting mark-complete trigger.
  - **Gated Boss Battle**: Disabled until lessons, games, and practice problems are completed. Shows active session status and lives remaining.
- Adapted coding games (Logic, If-Else, Loop, Recursion) to render syntax matching the student's selected language track.
- Implemented Module 2's new **I/O Stream Matching** game.
- Built the 3-level Boss Battle portal UI with a lives hearts bar, matching board, code editor, and countdown timer.

### 5. Server-Side Gating (Post-Review Fix)
- **Root cause**: Gating was UI-only — `startSession` only checked whether the world was unlocked (prior-module prerequisite), not whether the student completed lessons/games/problems within the *current* module. A student could fail a game and immediately call `/boss/:id/session/start` and receive `201 Created`.
- **Fix — `boss.session.service.ts`**: `startSession` now fetches lessons, games, and `userWorldProgress`, computes `allLessonsDone`, `allGamesDone`, `allOriginalDone`, `allExternalDone`, and throws `403 BOSS_LOCKED` if any are false.
- **Fix — `worlds.service.ts`**: `completeProblem` now checks `lessonsCompleted >= totalLessons` and `gamesCompleted >= gamesCount` before allowing problem marking, throwing `403 PREREQUISITES_NOT_MET` if violated.
- **Closes the same vulnerability class on both paths**: a student cannot skip a failed game to reach either problems or the boss.

### 6. Additional Bug Fixes
- **`TypeError: boss.questions.map is not a function`** — `getBoss` was casting the `questions` JSONB column as `Array<...>` and calling `.map()` on it. Fixed to return `questions` as `Record<string, unknown>` matching the actual `{ level1, level2, level3 }` structure.
- **Null `userTrack` crash** — `(userTrack).toUpperCase()` crashed for legacy users with no language track set. Fixed with `(userTrack || 'JAVASCRIPT').toUpperCase()` fallback in all three game/boss/roadmap pages.
- **Missing `getMonacoLanguage` / `ChevronRight`** — undefined references in boss arena page; both added.

---

## Verification & Tests

Final E2E suite run (post all fixes):
```
PASS test/onboarding.e2e-spec.ts     (28.713 s)
PASS test/boss-session.e2e-spec.ts   (8.195 s)
PASS test/auth.e2e-spec.ts           (6.245 s)
PASS test/intelligence.e2e-spec.ts   (8.345 s)
PASS test/users.e2e-spec.ts          (10.218 s)
PASS test/oauth.e2e-spec.ts          (7.782 s)
PASS test/learning-loop.e2e-spec.ts  (6.485 s)
PASS test/app.e2e-spec.ts

Test Suites: 8 passed, 8 total
Tests:       78 passed, 78 total
Time:        79.521 s
```

---

## Phase 4B — Game 2 (Modules 1-4) Implementation

During Phase 4B, the validated 4A patterns were extended to build the second game (Game 2) across the first four curriculum modules:
1. **Type Sorter** (`type_sorter` — Module 1): A drag-and-drop matching grid where students sort code literals into language-specific types.
2. **Echo Chamber** (`echo_chamber` — Module 2): A matching challenge linking print statements to stdout terminal outputs.
3. **Switchboard** (`switchboard` — Module 3): A circuit routing panel connecting inputs to case labels and default paths.
4. **Factory Line** (`factory_line` — Module 4): A conveyor belt loop simulation checking precise iteration bounds and body action orders.

### 1. Seeding and Database Configuration
- Updated Step 5 of the Prisma seeding script (`seed.ts`) to configure and link all four games for the corresponding Modules 1–4.
- Injected language track representations (C, C++, Java, Python, JS syntax elements) into the game configuration objects.

### 2. Backend Submission Evaluation
- Added validation keys under `GAME_SUBMISSION_TEMPLATES` in [games.service.ts](file:///d:/projects/skillforge/apps/api/src/games/games.service.ts).
- Implemented robust structural evaluation inside `evaluateSubmission` for all four games (including calculating expected iterations `Math.ceil((end - start) / step)` and exact array comparisons for conveyor loop steps in `factory_line`).
- Integrated the standard all-or-nothing grading rule: 100% correct answers earn full XP, otherwise `0.2` score (0 XP).

### 3. Frontend Interactive Components
- Built the `TypeSorterGame`, `EchoChamberGame`, `SwitchboardGame`, and `FactoryLineGame` components inside [page.tsx](file:///d:/projects/skillforge/apps/web/app/(app)/roadmaps/[slug]/game/[id]/page.tsx).
- Integrated drag-and-drop/matching mechanics with visual feedback, retry states, and custom HSL dark theme variables.

---

## Verification & Tests (Phase 4B Game 2)

### 1. E2E Integration Suite Run
Added tests in [learning-loop.e2e-spec.ts](file:///d:/projects/skillforge/apps/api/test/learning-loop.e2e-spec.ts) covering each game's validation rules and run/fail states. The full E2E test suite executes and passes cleanly:
```
Test Suites: 8 passed, 8 total
Tests:       84 passed, 84 total (up from 78/78)
Time:        89.545 s
```

### 2. Automated Browser Walkthrough
A Puppeteer-driven browser walkthrough (`run_walkthrough_games.js`) was run to play through all four games. It verified:
- Login and onboarding completion on the JAVASCRIPT track.
- Completing lessons to bypass world access gates.
- Navigating to each game page and playing them.
- Submitting incorrect solutions (yielding a 20% score / 0 XP), resetting, and successfully completing them (earning XP).
- Redirecting back to the dashboard, showing the updated level and accumulated **780 XP**.



## Phase 4C — Game Expansion (Modules 7, 8, 9, 10) Implementation

During Phase 4C, interactive learning games were built across the remaining core modules:
1. **Wire & Register** (`wire_register` — Module 7, Game 1): A pointer routing simulator. Value propagation is dynamically simulated on the backend.
2. **Heap Heist** (`heap_heist` — Module 7, Game 2): A dynamic memory allocator/GC dashboard where students link pointers to heap blocks and release them to prevent leaks.
3. **Test Case Tower** (`test_case_tower` — Module 8, Game 2): A branch coverage puzzle where students design a set of up to 3 test cases to cover all branch statements.
4. **Constructor Chain** (`constructor_chain` — Module 9, Game 2): A drag-and-drop constructor sequence chain builder.
5. **Shape Shifter Arena** (`shape_shifter_arena` — Module 10, Game 1): A polymorph subclass combat dispatcher.

---

## Verification & Tests (Phase 4C)

### 1. E2E Integration Suite Run
Added tests in [learning-loop.e2e-spec.ts](file:///d:/projects/skillforge/apps/api/test/learning-loop.e2e-spec.ts) covering each Phase 4C game's pass and fail states. Full sequential E2E run via `npx jest --config ./test/jest-e2e.json --runInBand` from `apps/api`:

```
PASS test/users.e2e-spec.ts         (39.161 s)
PASS test/onboarding.e2e-spec.ts    (20.108 s)
PASS test/learning-loop.e2e-spec.ts  (9.292 s)
PASS test/auth.e2e-spec.ts           (6.607 s)
PASS test/intelligence.e2e-spec.ts   (8.721 s)
PASS test/oauth.e2e-spec.ts          (5.472 s)
PASS test/boss-session.e2e-spec.ts   (7.887 s)
PASS test/app.e2e-spec.ts

Test Suites: 8 passed, 8 total
Tests:       94 passed, 94 total
Time:        101.135 s
```

### 2. Infrastructure Fix — `--runInBand` baked into test:e2e script
The `npm run test:e2e --workspace=apps/api -- --runInBand` pattern silently drops the `--runInBand` flag via the npm workspace relay, causing all 8 suites to run concurrently and producing foreign-key constraint violations from shared database state. Fixed by baking `--runInBand` directly into the `test:e2e` script in [apps/api/package.json](file:///d:/projects/skillforge/apps/api/package.json). Always invoke E2E tests as `npx jest --config ./test/jest-e2e.json --runInBand` from within `apps/api`, or use `npm run test:e2e` (now equivalent).

### 3. Browser + API Walkthrough (Phase 4C — all 5 games)

Walkthrough run against a fresh student account (`walkthrough-4c-v2-*`). Fail states verified via direct API POST; pass states verified via Puppeteer browser UI where the result panel rendered correctly, and via API for the two games (Heap Heist, Shape Shifter Arena) where the UI's per-slot button logic requires row-specific interaction that Puppeteer cannot reliably target without DOM IDs.

**Fail state verification (API — all 5 games):**

| Game | Payload | `passed` | `score` | `xp_earned` |
|------|---------|----------|---------|-------------|
| Wire & Register | `[{from:'INPUT', to:'OUTPUT_A'}]` — skips SP dereference | `false` | `0.2` | `0` |
| Heap Heist | Correct allocations, `freed: []` — memory leaked | `false` | `0.2` | `0` |
| Test Case Tower | `[{x:5, y:2}]` — only Branch A covered | `false` | `0.2` | `0` |
| Constructor Chain | `['this_maxSpeed','super']` — wrong order | `false` | `0.2` | `0` |
| Shape Shifter Arena | `{slot1:'Warrior', slot2:'Archer'}` — wrong subclass | `false` | `0.2` | `0` |

**Pass state verification (screenshots + API — all 5 games):**

| Game | Evidence | `score` | `xp_earned` |
|------|----------|---------|-------------|
| Wire & Register | Screenshot: "Challenge Cleared! +80 XP #2 Attempt" (toast: "Game completed! +80 XP") | `1.0` | `80` |
| Heap Heist | API response: `passed=true, score=1, xp=85` | `1.0` | `85` |
| Test Case Tower | Screenshot: "Challenge Cleared! +90 XP #2 Attempt" (toast: "Game completed! +90 XP") | `1.0` | `90` |
| Constructor Chain | Screenshot: "Challenge Cleared! +90 XP #2 Attempt" (toast: "Game completed! +90 XP") | `1.0` | `90` |
| Shape Shifter Arena | API response: `passed=true, score=1, xp=95` | `1.0` | `95` |

Total XP across 5 games for this fresh student: **80 + 85 + 90 + 90 + 95 = 440 XP**.

---

## Phase 4D — Part 1 Completion & Roadmaps Polish

During Phase 4D, interactive learning games and roadmaps polish were completed to finalize Part 1 of the curriculum:

1. **High-Fidelity Coming Soon Grid**: The static bullet list for Parts 2-7 has been replaced with a rich dynamic grid rendering all 128 remaining modules. Each card details the module's index, name, tech track, key topics list, planned game playgrounds, and difficulty stars in a premium disabled/coming soon state.
2. **Vault Keeper** (`vault_keeper` — Module 10, Game 2): Encapsulation game where students secure class fields (e.g. `secretCode`, `bankBalance`) with access modifiers (`private`, `public`) and setter/getter access. The UI auto-defaults access to `readwrite` when `public` is selected to avoid UI-level contradictions.
3. **Interface Bridge** (`interface_bridge` — Module 11, Game 1): Contracts design game matching classes (`Car`, `Airplane`) to interfaces and methods.
4. **Assembly Yard** (`assembly_yard` — Module 11, Game 2): Object relationships classifier where students determine if class parts use composition, aggregation, or dependency.
5. **Pattern Forge** (`pattern_forge` — Module 12, Game 1): Roles mapping editor classifying components into Strategy/Observer design pattern roles (e.g., Context vs ConcreteStrategy).
6. **SOLID Foundations** (`solid_foundations` — Module 12, Game 2): SOLID principles matching game linking code violations to principle names and corresponding refactoring resolutions.
7. **Refactor Run** (`refactor_run` — Module 13, Game 1): Sequencing editor requiring students to clean up code by ordering operations (constant replacement ➔ helper method extraction ➔ variable renaming).
8. **Code Review Court** (`code_review_court` — Module 13, Game 2): Mock PR diff reviewer classifying code lines into security/style/performance issue categories.

### 1. E2E Integration Suite Run
Added success and fail tests in `learning-loop.e2e-spec.ts` covering all 7 new games. All 101 tests pass sequentially:
```
Test Suites: 8 passed, 8 total
Tests:       101 passed, 101 total (up from 94/94)
Time:        91.463 s
```

### 2. Browser + API Walkthrough
Fresh student walkthrough (`walkthrough-4d-v2-*`) verified all 7 games. All fail states verified via API (yielding score=0.2, xp=0). Pass states verified via browser UI for games with easily automatable DOM targets, and via direct API submit for complex layouts:

**Walkthrough Verification Standard (screenshots + API):**

| Game | Verification Method | Reason / DOM targeting limitation | `score` | `xp` | Evidence / Screenshot |
|------|---------------------|-----------------------------------|---------|------|-----------------------|
| Vault Keeper | **Browser UI** | Direct modifier/access clicks, React state timing delayed. | `1.0` | `95` | `4d_g1_vault_keeper_pass.png` |
| Interface Bridge | **API Post** | Mapping grid buttons toggle interfaces dynamically across multiple rows and columns, making selector clicks brittle. | `1.0` | `85` | API pass verified |
| Assembly Yard | **Browser UI** | Single-column relationship classification buttons. | `1.0` | `90` | `4d_g3_assembly_yard_pass.png` |
| Pattern Forge | **API Post** | Dropdown option menu overlays are difficult for Puppeteer to select reliably without layout flakes. | `1.0` | `90` | API pass verified |
| SOLID Foundations | **API Post** | Complex matching mapping across three columns. | `1.0` | `95` | API pass verified |
| Refactor Run | **Browser UI** | Click sequence elements; submit button text matches `"Run Refactoring Sequence"`. | `1.0` | `90` | `4d_g6_refactor_run_pass.png` |
| Code Review Court | **API Post** | Syntax-highlighted code lines select options inside mock PR diff. | `1.0` | `95` | API pass verified |

Total XP across 7 games for this fresh student: **95 + 85 + 90 + 90 + 95 + 90 + 95 = 640 XP**. Adding 4 completed lessons (+100 XP) yields a final verified DLT total of **740 XP** in the database.

---

## Known Limitations & Future TODOs

> [!WARNING]
> **Subprocess Sandboxing and Isolation**
> - Subprocess executions for student code (C, C++, Java, Python, JS) run directly on the host operating system with basic execution timeouts (2-3s).
> - There are **no resource caps** (memory bounds, output size limit, CPU throttling) or concurrency gates on simultaneous executions.
> - **TODO**: Implement containerized execution (e.g., executing submissions inside temporary, short-lived Docker containers) or sandbox wrappers to secure the host environment under concurrent student load.

> [!NOTE]
> **safeEval Limitations (from Mirror Halls / Module 6)**
> - The whitelisted expression parser (`safeEval`) in `games.service.ts` only supports single-variable (`n`), single-operator arithmetic (`+`, `-`, `*`, `/`) or single-comparison operations on integer literals.
> - **TODO**: If any future game requires compound recursion conditions or complex nested logic, a full expression lexer/parser must be implemented instead of expanding this regex-based evaluator.

> [!WARNING]
> **Test Case Tower Branch Formula Sync**
> - `test_case_tower` branch coverage is graded on the backend via hardcoded branch condition evaluation formulas (representing the logical branches of the seeded snippet).
> - **TODO**: If the seeded code snippet in the database is ever changed, these backend grading formulas **must** be updated in lockstep. Otherwise, the frontend display and backend grading criteria will silently diverge.

