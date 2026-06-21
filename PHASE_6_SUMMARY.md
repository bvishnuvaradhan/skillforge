# Phase 6 Summary — Community & Launch

This document summarizes all features, architectural changes, database schema enhancements, mathematical/algorithmic specifications, and E2E verification results for Phase 6.

---

## Accomplished Features

### 1. Database Schema Updates
- **Enums Added**: `ReportTargetType` with values `USER`, `MENTOR_PROFILE`, `COMMENT`, `INTERVIEW_SESSION`.
- **Models Added**:
  - `Institution` — Represents academic or corporate institutional platforms (id, name, domain).
  - `Cohort` — Groups of students within an institution (id, name, institutionId).
  - `CohortMember` — Mapping of users to cohorts with custom privacy settings (`shareDataConsent`).
  - `Team` — Study teams supporting collaboration (id, name, inviteCode, cohortId).
  - `TeamMember` — Mapping of users to study teams with leadership roles (`MEMBER`, `LEADER`).
  - `Report` — System reports queue for moderation (reporterId, targetId, targetType, status, resolution details).
  - `AuditLog` — Centralized security audit trails (actorId, action, targetId, details JSON, IP, User-Agent).
  - `FeatureFlag` — Dynamic feature controls (key, description, isEnabled, rules JSON).
- **User Upgrades**: Added `status` field (Enum `UserStatus` with values `ACTIVE`, `SUSPENDED`, `INACTIVE`) and mapped relations to reports, audits, teams, and cohorts.

### 2. Instant Account Suspension & JWT Blacklist
- **Mechanism**: Administrative suspension endpoint `POST /v1/admin/users/:userId/suspend` marks the user status as `SUSPENDED` in PostgreSQL, destroys all active refresh sessions, and pushes their user ID to a Redis-backed blacklist with a 15-minute TTL (matching access token lifetimes).
- **Enforcement**: Updated `JwtStrategy` and `JwtAuthGuard` to execute a fast, O(1) Redis check on every incoming request, returning `401 Unauthorized` immediately to block suspended accounts without hitting PostgreSQL.

### 3. Institutional Platform & Bulk provisioning
- **Bulk Enrollment**: Administrators can supply a list of emails to enroll in a cohort. For unrecognized emails, the platform provisions "invited shell accounts" (temporary password, status `INVITED`) and triggers email invitations using the Resend API. If the student registers later under that email, the account automatically upgrades to a standard student role.
- **Privacy-Consent Branching**: Cohort analytics (`GET /v1/cohorts/:cohortId/analytics`) branches based on student consent (`shareDataConsent` on `CohortMember`):
  - **With Consent (`true`)**: Renders full student profile data (name, email, exact mastery scores, and streaks) on the dashboard roster.
  - **Without Consent (`false`)**: Masks student names and emails (e.g. `Anonymized Student`) on the roster to ensure data privacy, while keeping their numerical progress aggregated in bulk calculations (such as average cohort mastery and completion rate).

### 4. Teams, Leaderboards & Moderation Queue
- **Study Teams**: Students can create or join study teams using randomly generated secure invite codes (`/v1/community/teams`). Includes a group progress dashboard listing member milestones.
- **Toggled Leaderboards**: Renders global standings alongside a cohort-filtered standings toggle, sorting users dynamically by streak count and level.
- **Entity Validation**: The moderation report queue validates target existence (ensuring reported users, comments, or sessions actually exist) before reporting or resolving.

### 5. AST Plagiarism Detector
- **Engine**: Implemented in [ast-similarity.ts](file:///d:/projects/skillforge/apps/api/src/common/ast-similarity.ts). For JS/TS files, it parses the code using `acorn` into an AST, performs a preorder traversal to strip out user-specific text (variable names, comments, whitespace), and maps node types to compact representation characters.
- **Fallback**: For non-JS/TS tracks (C, C++, Java, Python), the engine executes regex-based structural tokenizations mapping loop bounds, branch statements, function definitions, returns, and variables into normalized sequences.
- **High-Stakes Triggers**: Runs automatically on high-stakes Level 3 Boss Battles for submissions containing $\ge 50$ nodes. Submissions with a Levenshtein similarity metric $\ge 85\%$ are flagged in the administrative moderation queue, decorated with a warning disclaimer stating that AST matches serve as administrative flags for manual code review rather than absolute structural proof of cheating.

---

## Verification & Tests

### 1. E2E Integration Suite Run
All 13 E2E test suites compile cleanly, run in order, and pass successfully:
```
PASS test/onboarding.e2e-spec.ts (28.767 s)
PASS test/boss-session.e2e-spec.ts (5.487 s)
PASS test/community.e2e-spec.ts (6.135 s)
PASS test/users.e2e-spec.ts (9.353 s)
PASS test/learning-loop.e2e-spec.ts (17.905 s)
PASS test/intelligence.e2e-spec.ts (10.969 s)
PASS test/auth.e2e-spec.ts (7.635 s)
PASS test/exams.e2e-spec.ts (6.135 s)
PASS test/interviews.e2e-spec.ts (6.646 s)
PASS test/oauth.e2e-spec.ts (7.385 s)
PASS test/admin.e2e-spec.ts (7.986 s)
PASS test/career.e2e-spec.ts (5.252 s)
PASS test/app.e2e-spec.ts (5.102 s)

Test Suites: 13 passed, 13 total
Tests:       132 passed, 132 total
Snapshots:   0 total
Time:        122.591 s
```

### 2. Browser Walkthrough Verification
All Phase 6 student-facing and admin-facing portals have been verified:

| Portal | Flow | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Community Hub** (`/community`) | Creates a study team, retrieves code, toggles global/cohort leaderboards, and opens moderation reports. | ✅ Verified | Study dashboard, join team modal, leaderboard tabs toggled successfully. |
| **Institutional Analytics** (`/institutions`) | Selects cohorts, bulk-enrolls students via email, and checks roster branching mask. | ✅ Verified | Consent-gated roster correctly hides emails/names of students without consent, and displays full details for students with consent. |
| **Admin Settings** (`/admin`) | Views dashboard metrics, audits logs, and toggles feature flags. | ✅ Verified | Toggle actions update flags in Redis instantly and log security `AuditLog` rows. |
| **Moderation Queue** (`/admin/moderation`) | Views violations queue, resolves tickets, suspends user accounts. | ✅ Verified | Suspension blocks subsequent HTTP request cookies instantly via the 15-minute Redis blacklist. |

---

## Technical Algorithms & Mathematics

### 1. AST Structural Similarity Formula (JS/TS Example)
1. **Acorn AST Parse**: Code is parsed into an abstract syntax tree representation.
2. **Preorder Structural Serialization**:
   - `Program` $\to$ `P`
   - `FunctionDeclaration` $\to$ `F`
   - `IfStatement` $\to$ `I`
   - `ForStatement` $\to$ `L`
   - `VariableDeclaration` $\to$ `D`
   - `BinaryExpression` $\to$ `X`
   - `Literal` $\to$ `l`
3. **Levenshtein Distance**: Calculate the minimum single-character edit operations (insertions, deletions, substitutions) required to transform serialization string $S_1$ to $S_2$:
   $$\text{distance} = \text{Levenshtein}(S_1, S_2)$$
4. **Normalized Similarity Percentage**:
   $$\text{similarity} = 1.0 - \frac{\text{distance}}{\max(\text{len}(S_1), \text{len}(S_2))}$$
5. **Threshold Match**: If $\text{similarity} \ge 0.85$ and $\max(\text{nodes}_1, \text{nodes}_2) \ge 50$, the system creates a plagiarism `Report` record automatically.

### 2. Institutional Aggregated Cohort Analytics
- **Aggregated Mastery**: Calculates mean mastery of *all* cohort members (independent of consent):
  $$\text{Mean Mastery} = \frac{1}{N} \sum_{i=1}^{N} \text{mastery}_i$$
- **PII Branching Logic**:
  $$\text{StudentRosterRow}(i) = \begin{cases} 
    \{\text{name}: \text{user.name}, \text{email}: \text{user.email}, \dots\} & \text{if } \text{shareDataConsent} = \text{true} \\
    \{\text{name}: \text{"Anonymized Student"}, \text{email}: \text{"[PROTECTED]"}, \dots\} & \text{if } \text{shareDataConsent} = \text{false}
  \end{cases}$$

---

## Known Limitations & Planned TODOs

### 1. AST Parser Limitations on Non-JS Languages
- **Limitation**: The fallback tokenizer matches structural statements via token sequences extracted by regular expressions, which is less granular than a full AST parser (like `acorn` for JS).
- **TODO**: In production pipelines, integrate dedicated tree-sitter libraries or parser binaries for Python, Java, C, and C++ to generate fully normalized AST serializations.

### 2. WebRTC Video/Audio streams
- **Limitation**: Video feeds on live collaborative interviews remain mocked on the client UI using fake status signals, due to WebRTC STUN/TURN infrastructure costs.
- **TODO**: Wire up real signaling servers and STUN/TURN credentials to enable direct peer video connections in the career module mock rooms.
