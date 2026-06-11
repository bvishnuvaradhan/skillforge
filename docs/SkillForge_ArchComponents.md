SKILLFORGE

System Architecture & Component Library

Service architecture, data flows, and reusable UI component specifications

# Part A: System Architecture

## A.1 High-Level Architecture

SkillForge is a distributed system with four major service layers: Frontend, Backend API, AI Service, and Databases. Each layer is independently deployable and communicates via well-defined interfaces.


[Table]
| System Overview | ┌─────────────────────────────────────────────────────────────┐ | │                     CLIENTS                                  │ | │  [Next.js Web App]          [React Native Mobile App]       │ | └──────────────────────┬──────────────────────────────────────┘ |                        │ HTTPS / WebSocket | ┌──────────────────────▼──────────────────────────────────────┐ | │                  API GATEWAY (NestJS)                        │ | │  Auth │ Users │ Worlds │ DLT │ Interviews │ Career │ Admin  │ | └──────┬────────────────────────────────────┬─────────────────┘ |        │ Internal HTTP                       │ Internal HTTP | ┌──────▼──────────┐              ┌──────────▼──────────────── │ | │  AI SERVICE     │              │  DATABASES                  │ | │  (Python/       │              │  PostgreSQL (primary)       │ | │   FastAPI)      │              │  Redis (cache + queues)     │ | │                 │              │  Neo4j (Knowledge Graph)    │ | │  DLT Engine     │              │  S3/R2 (file storage)       │ | │  Rec Engine     │              └────────────────────────────┘ | │  Memory AI      │ | │  LLM (Mentor)   │ | └─────────────────┘ |


## A.2 Data Flow: New User Login to Dashboard

This is the most critical user journey. Every component must work for this flow.


[Table]
| Login → Dashboard Flow | 1.  User submits login form (Next.js) | 2.  POST /auth/login → NestJS API | 3.  API validates credentials against PostgreSQL users table | 4.  JWT token generated and returned | 5.  Next.js stores token in httpOnly cookie | 6.  Client requests GET /dlt/me → NestJS API | 7.  API queries PostgreSQL: dlt_states, mastery_scores, retention_scores | 8.  API queries Redis cache: recommendations (cache hit = skip step 9) | 9.  If cache miss: NestJS calls AI Service → recommendation generation | 10. AI Service returns recommendations → cached in Redis (TTL 15 min) | 11. API assembles dashboard payload and returns to client | 12. Next.js renders Mission Control dashboard with all widgets |


## A.3 Data Flow: Completing a Game


[Table]
| Game Completion Flow | 1.  Student submits game attempt: POST /worlds/:slug/games/:id/attempt | 2.  NestJS validates attempt data | 3.  Score calculated: (correct/total) * hint_penalty * time_bonus | 4.  game_attempts row inserted into PostgreSQL | 5.  If new high score: mastery_scores updated for related topics | 6.  DLT recalculation job queued in BullMQ (Redis) | 7.  Response returned immediately to client (fast) | 8.  Background: BullMQ worker picks up DLT recalculation job | 9.  AI Service recomputes mastery, retention, readiness | 10. dlt_states updated in PostgreSQL | 11. Redis recommendation cache invalidated for this user | 12. Socket.io emits 'dlt_updated' event to user's browser | 13. Dashboard widgets refresh automatically |


## A.4 Data Flow: Memory Intelligence (Nightly Job)


[Table]
| Memory Intelligence Nightly Process | 1.  Cron job triggers at 2:00 AM via BullMQ scheduler | 2.  For each active user in the last 30 days: | 3.    For each topic in user's retention_scores: | 4.      Calculate time elapsed since last_reviewed_at | 5.      Apply forgetting curve: retention = stability * e^(-t/stability) | 6.      Update retention and risk_level in PostgreSQL | 7.      Calculate next_review_at from updated stability | 8.      If retention dropped below 70%: create REVIEW recommendation | 9.      If retention dropped below 50%: escalate to CRITICAL risk | 10.   Recommendations arbitration runs for affected users | 11.   Smart nudge notifications queued for users with critical topics | 12.   Notifications delivered via Socket.io (if online) or push/email |


## A.5 Data Flow: AI Mentor Conversation


[Table]
| AI Mentor Flow | 1.  Student sends message: POST /mentor-ai/chat | 2.  NestJS checks daily usage count (Redis counter) | 3.  If free tier limit exceeded: return 402 error | 4.  NestJS fetches user context: DLT state, roadmap, top recommendations | 5.  Context assembled as system prompt for LLM | 6.  Request sent to OpenAI/Anthropic API with: |     - System prompt: user's full learning context |     - User message: student's question | 7.  LLM response streamed back to NestJS | 8.  Response forwarded to client via streaming HTTP response | 9.  Daily usage counter incremented in Redis | 10. Conversation not persisted (privacy protection) |


## A.6 WebSocket Events Reference


[Table]
| Event Name | Direction | Trigger | Payload |
| dlt_updated | Server → Client | DLT recalculation complete | { mastery_delta, new_xp, level_up } |
| world_unlocked | Server → Client | New world unlock detected | { world_id, world_name } |
| nudge | Server → Client | Nudge system fires | { type, title, body, action_url } |
| interview_message | Bidirectional | Message in AI/human interview | { message, sender, timestamp } |
| code_sync | Bidirectional | Code change in interview | { code, language, cursor } |
| leaderboard_update | Server → Client | Ranking change in cohort | { top_10, my_rank } |
| boss_result | Server → Client | Boss battle judged | { passed, score, badge } |


## A.7 Cron Jobs & Background Workers


[Table]
| Job Name | Schedule | What It Does |
| memory-intelligence | Daily 2:00 AM | Recalculates retention for all active users, generates review recommendations |
| dlt-recalculate | On demand (BullMQ) | Recalculates DLT state after any scored activity |
| streak-checker | Daily 11:59 PM | Checks which users maintained streaks, updates streak_count |
| nudge-scheduler | Hourly | Checks nudge rules and queues pending notifications |
| forecast-engine | Weekly Sunday | Regenerates forecasts for all premium users |
| skill-dna-compute | Weekly Saturday | Recomputes Skill DNA for all users with enough activity |
| recording-cleanup | Daily 3:00 AM | Deletes interview recordings older than 30 days |
| leaderboard-update | Every 5 min | Updates cached leaderboard rankings in Redis |


# Part B: UI Component Library

Every reusable component in SkillForge is documented here with its props, states, variants, and usage rules. Components use React + TypeScript + Tailwind CSS.

## B.1 MasteryBar

Displays a topic's mastery score with color-coded fill and optional retention risk indicator.


[Table]
| MasteryBar Props | interface MasteryBarProps { |   topic:       string;          // Topic display name |   score:       number;          // 0.0 to 1.0 |   retention?:  number;          // 0.0 to 1.0 (optional) |   riskLevel?:  'low'|'medium'|'high'|'critical'; |   lastActive?: string;          // ISO date string |   showLabel?:  boolean;         // default true |   size?:       'sm'|'md'|'lg'; // default 'md' | } |


States & Variants:

score >= 0.8: bar fills green (#06D6A0), label shows 'Strong'

score 0.6–0.79: bar fills orange (#FF6B35), label shows 'Moderate'

score < 0.6: bar fills red (#EF4444), label shows 'Weak'

riskLevel = 'critical': pulsing warning icon appears right of bar

Loading state: skeleton shimmer animation replaces bar

## B.2 RecommendationCard

Displays a single AI recommendation with metadata and action button.


[Table]
| RecommendationCard Props | interface RecommendationCardProps { |   id:           string; |   type:         'learn'|'review'|'practice'|'reinforce'|'interview'|'career'|'consistency'; |   title:        string; |   description:  string; |   why:          string; |   impact:       'low'|'medium'|'high'; |   effortMins:   number; |   confidence:   number; |   actionUrl:    string; |   onDismiss:    (id: string) => void; |   onSnooze:     (id: string, days: number) => void; | } |


Type → Left border color mapping:

learn → brand cyan (#00B4D8)

review → orange (#FF6B35)

practice → purple (#7B2FBE)

reinforce → yellow (#EAB308)

interview → green (#06D6A0)

career → blue (#3B82F6)

consistency → red (#EF4444)

## B.3 WorldCard

Displays a Learning World with progress and lock state.


[Table]
| WorldCard Props | interface WorldCardProps { |   world: { |     id:           string; |     name:         string; |     slug:         string; |     description:  string; |     iconUrl:      string; |   }; |   progress: { |     status:           'locked'|'unlocked'|'in_progress'|'completed'; |     percentComplete:  number;  // 0–100 |     lessonsComplete:  number; |     totalLessons:     number; |     bossAvailable:    boolean; |   }; |   isSecret?:     boolean; |   unlockCriteria?: string;  // shown on hover when locked | } |


State rendering rules:

status='locked': desaturated filter, lock icon overlay, hover shows unlock criteria tooltip

status='in_progress': glowing cyan border, animated progress ring

status='completed': solid green border, checkmark badge

isSecret=true && status='locked': renders as '???' card with mystery styling

bossAvailable=true: orange Boss Battle CTA button with glow effect

## B.4 BossBattleScreen

Full-screen boss battle interface. Manages its own game state internally.


[Table]
| BossBattleScreen Props | interface BossBattleScreenProps { |   bossId:        string; |   bossName:      string; |   bossLevel:     'mini'|'world'|'grand'; |   questions:     Question[]; |   passThreshold: number; |   xpReward:      number; |   onVictory:     (score: number) => void; |   onDefeat:      (score: number, weakAreas: string[]) => void; |   onExit:        () => void; | } | interface Question { |   id:       string; |   text:     string; |   type:     'mcq'|'code_trace'|'short_answer'; |   options?: string[];  // for MCQ |   answer:   string; |   topicId:  string; | } |


Internal state machine:

ENTRY → shows boss intro animation (1.5s)

BATTLE → questions appear one by one with timer

EVALUATING → processes answer, animates health bars

VICTORY → particle burst, badge reveal, XP counter

DEFEAT → breakdown screen, retry/review CTA

## B.5 CodeEditor

Monaco-based code editor with language switching and run/submit capability.


[Table]
| CodeEditor Props | interface CodeEditorProps { |   defaultLanguage?:  'cpp'|'java'|'python';  // default 'cpp' |   defaultCode?:      string; |   readOnly?:         boolean; |   height?:           string;  // default '400px' |   onCodeChange?:     (code: string, language: string) => void; |   onRun?:            (code: string, language: string) => void; |   onSubmit?:         (code: string, language: string) => void; |   collaborativeMode?:boolean;  // for live interview sync |   sessionId?:        string;   // for Socket.io sync | } |


Features:

Language tab switcher: C++ / Java / Python — switches Monaco language mode

Theme: custom dark theme matching SkillForge color tokens

In collaborative mode: code changes broadcast via Socket.io to sessionId room

Mobile: CodeEditor is replaced with read-only CodeViewer component

## B.6 RetentionHeatmap

Grid visualization of retention scores across all learned topics.


[Table]
| RetentionHeatmap Props | interface RetentionHeatmapProps { |   topics: Array<{ |     id:         string; |     name:       string; |     retention:  number;  // 0.0 to 1.0 |     riskLevel:  'low'|'medium'|'high'|'critical'; |   }>; |   onTopicClick?: (topicId: string) => void; | } |


Color mapping (color-blind safe — also uses pattern labels):

retention >= 0.85: deep green — 'Strong'

retention 0.70–0.84: light green — 'Good'

retention 0.55–0.69: yellow — 'At Risk'

retention 0.40–0.54: orange — 'Fading'

retention < 0.40: red — 'Critical'

Each cell shows topic initial + retention % on hover

## B.7 AImentorChat

Floating chat interface for the AI Mentor.


[Table]
| AIMentorChat Props | interface AIMentorChatProps { |   isOpen:      boolean; |   onClose:     () => void; |   isPremium:   boolean; |   usageToday:  number; |   dailyLimit:  number; | } |


Behavior:

Renders as a floating panel anchored to bottom-right corner

On mobile: renders as full-screen overlay

Messages stream character by character (typing effect)

Suggested prompts shown as chips on first open

Usage counter shown when near limit: '2 of 3 messages used today'

Premium upgrade CTA shown when limit reached

## B.8 CareerReadinessMeter

Horizontal gauge showing readiness percentage for a specific company tier.


[Table]
| CareerReadinessMeter Props | interface CareerReadinessMeterProps { |   company:    string;  // 'Google' | 'Amazon' | 'Placement' | etc. |   score:      number;  // 0.0 to 1.0 |   trend?:     'up'|'down'|'flat'; |   trendDelta?:number;  // +0.05 or -0.02 | } |


Rendering rules:

score < 0.3: red fill — 'Not Ready'

score 0.3–0.59: orange fill — 'Preparing'

score 0.6–0.79: yellow fill — 'Getting Close'

score >= 0.8: green fill — 'Interview Ready'

trend arrow shown with delta: '↑ +5% this week'

## B.9 StreakWidget

Displays current streak with flame icon and activity calendar.


[Table]
| StreakWidget Props | interface StreakWidgetProps { |   streakCount:     number; |   lastActiveDate:  string;  // ISO date |   activityDates:   string[]; // ISO dates of active days |   compact?:        boolean;  // sidebar compact mode | } |


Variants:

streak 1–6: standard orange flame icon

streak 7–29: flame icon with glow

streak 30–99: gold flame icon

streak 100+: rainbow animated flame icon

compact=true: shows only flame + number (for sidebar)

Streak broken today: red flame with gentle 'Restart your streak' message

## B.10 Component Naming Conventions


[Table]
| Category | Prefix/Pattern | Examples |
| Page components | Page suffix | DashboardPage, WorldMapPage, ResumePage |
| Layout components | Layout suffix | AppLayout, AuthLayout, FocusLayout |
| Feature components | Feature name | MasteryBar, WorldCard, BossBattleScreen |
| UI primitives | No prefix | Button, Input, Badge, Card, Modal, Tooltip |
| Chart components | Chart suffix | MasteryLineChart, RetentionHeatmap, RadarChart |
| Hook naming | use prefix | useDLT, useRecommendations, useWorldProgress |
| Context naming | Context suffix | AuthContext, ThemeContext, SocketContext |


## B.11 State Management Patterns

### Global State (Zustand)

auth — current user, JWT token, role

theme — dark/light mode, accessibility preferences

socket — WebSocket connection state and event handlers

### Server State (React Query)

DLT data — cached, invalidated on game/assessment completion

Recommendations — cached 15 min, background refetch

World progress — cached per world slug

Roadmap — cached, refetched on goal change

### Local State (useState/useReducer)

Game state — puzzle progress, current question, score

Boss battle state — health bars, question index, timer

Form state — resume editor, profile edit forms

UI state — modal open/close, panel visibility, tabs
