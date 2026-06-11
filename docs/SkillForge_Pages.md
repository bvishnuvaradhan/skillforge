SKILLFORGE

Pages & Features Per Role

Every page, route, and component for Student, Mentor, and Admin roles

Document 3 of 3  |  SkillForge Technical Series

# Chapter 1: Shared / Public Pages

These pages are accessible to all users including unauthenticated visitors.


[Table]
| /  Landing Page | Marketing page — converts visitors to signups | Hero section: Platform tagline + animated demo preview | Feature highlights: Games, Roadmap, AI Mentor, Career Center | How it works: 3-step visual flow (Assess → Learn → Get Hired) | Social proof: Learner stats, testimonials, institution logos | Pricing section: Free vs Premium comparison table | CTA: Get Started for free (leads to /onboarding) | Footer: Links, legal, social |



[Table]
| /login  Login Page | Authentication — email/password + OAuth | Login form: Email + password | OAuth buttons: Continue with Google, Continue with GitHub | Forgot password link | Link to /signup for new users | Dark themed, centered card layout |



[Table]
| /signup  Signup Page | New user registration | Form: Name, email, password, confirm password | OAuth signup: Google, GitHub | Role selection: I am a Student / I am a Mentor | Terms of service checkbox | Redirects to /onboarding on success |



[Table]
| /onboarding  Onboarding Flow | Multi-step wizard for new students | Step 1: Choose primary goal (Placements / Competitive / DSA / Interviews) | Step 2: Link coding profiles — LeetCode, Codeforces, CodeChef, GitHub (optional) | Step 3: Adaptive assessment — 15–20 questions across core topics | Step 4: Loading screen — 'Building your Digital Learning Twin...' | Step 5: Reveal screen — shows initial mastery scores + first world unlocked | Step 6: Roadmap preview — CTA to enter dashboard |



[Table]
| /pricing  Pricing Page | Plan comparison and upgrade flow | Free vs Premium vs Institutional comparison table | Feature-by-feature checklist | Upgrade CTA for logged-in free users | Institutional inquiry form |


STUDENT ROLE

Primary learner — 20+ pages across learning, practice, career, and community

# Chapter 2: Student Pages

## 2.1 Core App Pages


[Table]
| /dashboard  Mission Control (Dashboard) | Central hub — answers 'What should I do today?' | Daily Focus widget — top 1–3 AI-recommended actions | Recommendations feed — full list with Why/Impact/Effort | Roadmap Preview — next 5 steps highlighted | Memory Snapshot — top 3 topics at risk of forgetting | World Progress map — mini world map with progress indicators | Career Readiness meters — Placement, FAANG, Product, Service | DNA Snapshot card — one-line learning style summary | Streak widget — current streak + activity calendar mini |



[Table]
| /worlds  World Map | Overview of all learning worlds and progress | Interactive world map — each world as a node with connecting paths | Completed worlds: full color + completion badge | In-progress worlds: partial glow + progress ring | Locked worlds: desaturated + lock icon + hover shows unlock criteria | Secret worlds: hidden until discovered | World search/filter by topic | Click on world: opens /worlds/[slug] |



[Table]
| /worlds/[slug]  World Detail Page | Full content for a single Learning World | World header: name, description, topic list, overall progress | Content sections: Introduction, Lessons, Games, Quests, Challenges | Mini Boss card (locked until lessons complete) | World Boss card (locked until Mini Boss beaten) | XP earned in this world + badge display | Recommended next world preview |



[Table]
| /worlds/[slug]/lesson/[id]  Lesson Page | Structured learning content for a topic | Progress bar: lesson N of M in world | Content: text sections + inline code examples + visuals | Concept check: 2–3 inline MCQs to confirm understanding | Navigation: Previous / Next lesson | Mark complete button | Link to related games and coding challenges |



[Table]
| /worlds/[slug]/game/[id]  Game Page | Interactive learning game | Focus mode: sidebar collapsed, right panel hidden | Top bar: game name + score + timer + hints remaining | Game canvas: full interactive puzzle area | Bottom bar: Submit + Use Hint + puzzle progress (1/5) | Post-game: score breakdown + mastery update notification + XP earned | Replay button + Next game button |



[Table]
| /worlds/[slug]/boss/[level]  Boss Battle Page | Mini, World, or Grand Boss challenge | Dramatic entry screen: Boss name + illustration + health bars | Boss health bar (top) + Student health bar (bottom) | Question displayed as 'attack' with timer | Answer options with instant visual feedback (correct = green, wrong = red) | Health bars animate on each answer | Victory: particle burst + badge award + XP counter + next step CTA | Defeat: performance breakdown + weak areas + retry or review CTA |



[Table]
| /blockly  Blockly Visual Programming | Drag-and-drop visual code builder | Left panel: Block palette organized by category | Center: Drop canvas — blocks snap together | Right panel: Generated code (C++ / Java / Python — switchable tabs) | Bottom: Output panel — run result | Toolbar: Run, Reset, Download Code, Save | Problem list sidebar: select challenges to solve visually | Algorithm Builder mode: pre-built algorithm templates |


## 2.2 Practice & Analytics Pages


[Table]
| /practice  Coding Practice Hub | Central practice page with recommendations | Recommended problems (AI-picked based on DLT) | Filter by: Topic, Difficulty, Platform (LeetCode / Codeforces etc.) | Problem cards: title + difficulty badge + topic tags + solved status | Stats summary: Total solved, current streak, weak topics | Contest calendar: Upcoming Codeforces / LeetCode contests |



[Table]
| /practice/[problemId]  Problem Page | Individual coding problem with editor | Left: Problem statement, examples, constraints, editorial hints | Right: Monaco code editor (C++ / Java / Python selector) | Bottom: Test cases + Run button + Submit button | Top bar: difficulty badge + topic tags + timer | AI hint button: generates a nudge hint without giving the solution | Post-submit: Result + time complexity analysis + better approach suggestion |



[Table]
| /analytics  My Analytics | Deep dive into learning performance | Mastery scores per topic: progress bars + trend arrows | Learning velocity chart: mastery growth over last 30/60/90 days | Weak areas table: topics below 70% mastery | Activity heatmap: GitHub-style calendar of daily practice | Coding platform stats: LeetCode count, Codeforces rating, GitHub commits | Contest performance timeline | Skill growth radar chart across major topic categories |



[Table]
| /roadmap  My Roadmap | Full personalized learning roadmap view | Visual timeline: completed, in-progress, up next, locked | Each step: topic name + estimated time + mastery required | Goal selector: switch between Placements / Competitive / DSA / Interviews | Roadmap recalculates on goal change | Share roadmap button (generates shareable link) |



[Table]
| /memory  Memory Lab | Memory science workspace (Premium) | Memory Health Score: large circular gauge at top | Forgetting Curves: line chart per topic showing projected decay | Retention Heatmap: grid of all topics colored by retention % | Reinforcement Calendar: scheduled review sessions | Risk Areas: list of topics approaching the 70% retention threshold | Quick Review button on each risk topic | Review session: flashcard-style recall challenges |



[Table]
| /skill-dna  Skill DNA | Personal learning profile and forecasts | Learning Style card: Visual / Game-based / Problem-first | Consistency Pattern: session frequency graph | Strengths: top 5 topics with mastery badges | Weaknesses: bottom 5 topics with improvement actions | Growth Opportunities: adjacent topics ready to explore | Forecasting section: readiness predictions with timelines | Historical DNA evolution: how the profile has changed over time |


## 2.3 Interview Pages


[Table]
| /interviews  Interview Hub | Central interview preparation page | AI Interview CTA: Start now — no booking needed | Book Human Interview: browse mentors | Interview history: past sessions with scores | Company readiness cards: Google / Amazon / Microsoft etc. | Recommended interview type based on current readiness |



[Table]
| /interviews/ai  AI Mock Interview | AI-conducted interview session | Interview type selector: DSA / Coding / Behavioral / System Design / HR | Difficulty selector + target company (optional) | Interview screen: problem panel + code editor + AI evaluator | Real-time hint system (optional, costs hint tokens) | Post-interview: full feedback report with scores + improvement plan |



[Table]
| /interviews/mentors  Mentor Marketplace | Browse and book human mentors | Mentor cards: photo, name, expertise, rating, price, availability | Filter: by expertise, rating, price range, language | Mentor profile modal: full bio, experience, session reviews | Book session: calendar picker + time slot selection + payment | Upcoming sessions widget |



[Table]
| /interviews/[sessionId]  Live Interview Session | Real-time interview with mentor or AI | Video panel: mentor top-right (PiP for student), large for mentor | Problem panel (left 40%) | Code editor (right 60%): Monaco, shared in real-time with mentor | Bottom toolbar: time elapsed, communication hints, submit | Chat panel: text fallback if audio fails | End session button |



[Table]
| /interviews/feedback/[id]  Interview Feedback Report | Post-interview analysis | Overall score donut chart | Dimension scores: Technical, Problem Solving, Communication, Confidence | Strengths observed this session | Specific improvement areas with action items | Recommended next steps | Share report button | Book next session CTA |


## 2.4 Career Pages


[Table]
| /career  Career Center Hub | Central career preparation page | Career Readiness meters: Placement / Product / Service / FAANG / Startup | Resume score summary + Edit Resume CTA | LinkedIn score + Optimize CTA | Company preparation cards (quick access to all tracks) | Upcoming mock exams | What to work on next (AI recommendation for career gap) |



[Table]
| /career/resume  Resume Builder | AI-assisted resume creation | Template selector: ATS / Product / Fresher / Experienced | Resume editor: section-by-section with AI suggestions inline | Auto-filled from profile: skills, achievements, coding stats | Live preview panel (right side): renders resume as you edit | Resume Score panel: live scores updating as you edit | Improvement suggestions list: specific action items | Download PDF button | Save draft button |



[Table]
| /career/linkedin  LinkedIn Optimizer | LinkedIn profile analysis and improvement | Paste/import LinkedIn profile content | Analysis results: LinkedIn Score + Recruiter Visibility Score | Section-by-section breakdown: Headline, About, Skills, Projects | Suggested rewrites for each section | Copy improved text button per section | Re-analyze button after changes |



[Table]
| /career/company/[slug]  Company Preparation Track | Dedicated prep for a specific company | Company overview: interview format, rounds, difficulty | Topic weightage: bar chart of most important topics for this company | Readiness score: how ready the student is for this company now | Practice problems: original problems matching company patterns | Mock round: simulated interview round for this company | Resources: curated reading and practice links |



[Table]
| /exams  Mock Exams | Topic, DSA, and company assessment exams | Exam catalog: Topic Exams, Full DSA, Contest, Company Assessment, Adaptive | Exam card: title + duration + difficulty + number of questions + your last score | Filter by: type, topic, difficulty, completion status | Recommended exam based on current DLT state |



[Table]
| /exams/[id]  Exam Page | Taking a mock exam | Full screen focus mode | Top bar: exam title + time remaining + question count | Question panel: MCQ or coding problem depending on exam type | Navigation: question number grid (shows answered/flagged/unanswered) | Flag for review button | Submit exam CTA (with confirmation modal) |



[Table]
| /exams/results/[id]  Exam Results Page | Post-exam analysis | Overall score + pass/fail status | Section-wise breakdown | Question-by-question review: correct vs submitted answer + explanation | Topic-wise performance chart | Mastery update notification | Recommended next steps |


## 2.5 Community Pages


[Table]
| /community  Community Hub | Teams, leaderboards, competitions | My Team card: current team name + members + leaderboard rank | Active competitions: upcoming and ongoing contests | Global leaderboard: top learners by XP or mastery | Cohort leaderboard (if in institution) | Team Quest progress | Shared challenges feed |



[Table]
| /community/leaderboard  Leaderboard | Rankings across different metrics | Toggle: Global / My Institution / My Team | Ranking metric selector: XP / Mastery / Streak / Contest Rating | Leaderboard table: rank, avatar, name, score, change from last week | My position highlighted even if not in top 10 | Time filter: All time / This month / This week |


## 2.6 Profile & Settings Pages


[Table]
| /profile  My Profile | Public/private learner profile | Avatar + name + title + bio | Badges earned (hexagonal grid) | Achievement highlights: Grand Boss completions | Activity calendar (GitHub-style) | Coding stats summary | Top skills (mastery > 80%) | Edit Profile button |



[Table]
| /settings  Settings | Account and preferences | Account: email, password, delete account | Privacy: profile visibility (Private / Team / Public) | Notifications: nudge frequency, email digest, push notifications | Linked profiles: manage LeetCode / Codeforces / GitHub connections | Appearance: dark / light theme toggle | Accessibility: reduced motion, font size, color-blind mode | Data: Download my data, Delete my data |



[Table]
| /notifications  Notifications Page | All nudges and system notifications | Chronological feed of all nudges and alerts | Filter: All / Memory / Streak / Interview / Roadmap / System | Mark all as read | Notification preferences shortcut |


MENTOR ROLE

Verified expert — conducts interviews, reviews resumes, guides learners

# Chapter 3: Mentor Pages


[Table]
| /mentor/dashboard  Mentor Dashboard | Mentor's central hub | Upcoming sessions: next 3 booked interviews with time and student name | Pending reviews: resumes and exams awaiting review | Earnings summary: this month + total + pending payout | Rating overview: average rating + recent reviews | Quick actions: Set availability, View requests, Withdraw earnings | Student progress feed (assigned students only) |



[Table]
| /mentor/profile/setup  Mentor Profile Setup | Build mentor public profile | Photo upload | Bio and headline | Expertise areas: multi-select tags (DSA, System Design, Behavioral etc.) | Experience: company history, years of experience | Coding profiles: link LeetCode, Codeforces, GitHub | Certifications and achievements | Session pricing: set price per session | Availability: weekly schedule builder | Submission for admin approval |



[Table]
| /mentor/sessions  Sessions Management | All sessions — upcoming, past, pending | Upcoming sessions tab: date, time, student name, interview type, join button | Pending requests tab: accept / decline booking requests | Past sessions tab: completed sessions with feedback submitted status | Session detail modal: student profile preview, problem to discuss, notes field | Cancel session button (with policy reminder) |



[Table]
| /mentor/session/[id]  Live Session Page | Real-time interview room | Same layout as student interview screen | Mentor has larger video panel | Code editor: read + write access (can annotate student code) | Evaluation panel (mentor-only): slide-in panel with scoring rubric | Notes field: private mentor notes during session | End session + Submit Feedback CTA |



[Table]
| /mentor/feedback/[sessionId]  Submit Feedback | Post-session evaluation form | Student name + session summary | Score sliders: Technical (0–10), Problem Solving (0–10), Communication (0–10), Confidence (0–10) | Strengths text field | Improvement areas text field | Recommended next steps text field | Overall recommendation: Ready / Needs More Prep / Strong Candidate | Submit button (cannot be edited after submission) |



[Table]
| /mentor/reviews  Resume & Exam Reviews | Pending review queue | Review queue: student name + type (resume / exam) + submitted date | Resume review view: renders the student's resume + scoring rubric panel | Exam review view: student's answers + correct answers + comment field | Score inputs for each dimension | Submit review CTA | Review history tab: completed reviews |



[Table]
| /mentor/students  My Students | Students assigned or who have booked the mentor | Student cards: name, avatar, goal, last session date, overall readiness | Click student: mini profile with mastery summary and session history | Notes field per student: private mentor notes | Send message button (in-platform message) |



[Table]
| /mentor/earnings  Earnings & Payouts | Revenue tracking | Total earned all time | This month earnings chart | Pending payout amount | Session earnings table: date, student, session type, amount | Request payout button | Payout history |



[Table]
| /mentor/availability  Availability Settings | Manage schedule and pricing | Weekly calendar: toggle available slots hour by hour | Session price: update price per session | Session duration: 30 / 45 / 60 minutes | Buffer time: minimum gap between sessions | Block out dates: mark unavailable periods | Instant booking toggle: allow students to book without approval |


ADMIN ROLE

Platform manager — content, users, institutions, analytics, moderation

# Chapter 4: Admin Pages


[Table]
| /admin/dashboard  Admin Dashboard | Platform health overview | Key metrics: Total users, DAU, new signups today, active premium users | Revenue summary: MRR, new subscriptions, marketplace transactions | Platform health: error rate, API latency, uptime status | Pending actions: mentor approvals, reports, content reviews | Recent activity feed: significant platform events | Quick action buttons: Approve mentors, Review reports, Manage content |



[Table]
| /admin/users  User Management | All student and mentor accounts | Searchable user table: name, email, role, join date, plan, status | Filter by: role, plan, status (active/suspended), institution | User detail modal: full profile, activity summary, DLT state | Actions: Suspend, Restore, Delete, Change plan, Reset password | Bulk actions: export CSV, bulk suspend | Impersonate user button (for debugging — logged in admin audit trail) |



[Table]
| /admin/mentors  Mentor Management | Approve and manage mentor accounts | Pending applications tab: new mentor applications awaiting review | Application detail: submitted profile, coding achievements, experience | Approve / Reject with reason | Active mentors tab: all verified mentors with rating and session count | Low-performing mentors alert: automatically flagged below threshold | Actions: Warn, Suspend, Remove verification, Restore |



[Table]
| /admin/content  Content Management | Learning worlds, games, exams, interview tracks | World manager: create, edit, publish, unpublish Learning Worlds | Lesson editor: rich text editor for lesson content | Game configuration: set game parameters, difficulty, mastery contribution | Boss battle builder: create Mini, World, and Grand Boss challenges | Exam builder: create question banks and assemble exams | Interview track editor: configure company-specific preparation tracks | Content publish queue: review AI-generated content before publishing |



[Table]
| /admin/knowledge-graph  Knowledge Graph Manager | Edit topic relationships | Visual graph: D3.js force-directed visualization of all topics | Add topic node: name, description, mastery threshold | Add prerequisite edge: connect two topics with direction | Edit existing relationships | Impact preview: shows how a change affects existing learner roadmaps | Publish changes button (with rollback option) |



[Table]
| /admin/institutions  Institution Management | College and training institute accounts | Institution list: name, type, license plan, cohort size, renewal date | Institution detail: admin contacts, cohort list, usage stats | Create institution: setup wizard for new institutional accounts | Manage cohorts: add/remove students, assign mentors | Generate placement readiness report for institution | Renewal and billing management |



[Table]
| /admin/analytics  Platform Analytics | Deep platform performance data | User growth chart: signups over time | Engagement: DAU/MAU ratio, session duration, feature usage breakdown | Learning outcomes: average mastery growth, world completion rates | Revenue: MRR, churn rate, plan distribution | Geographic distribution map | Top performing worlds and games | Dropout funnel: where students disengage | Export all data as CSV |



[Table]
| /admin/moderation  Community Moderation | Reports and fair play enforcement | Reports queue: all user-submitted reports sorted by severity | Report detail: reporter, reported user, category, evidence, context | Actions: Dismiss, Warn user, Remove content, Suspend, Ban | Resolved reports history | Competition integrity: flagged submissions with similarity analysis | Automated detection alerts: copy-paste detections, unusual activity |



[Table]
| /admin/notifications  Notification Management | Platform-wide nudge and announcement system | Create announcement: title + body + target audience (all / premium / students / mentors) | Schedule: immediate or scheduled date/time | Notification history: all sent notifications with open rate | Nudge configuration: adjust nudge frequency thresholds | A/B test notifications: test two variants of a nudge message |



[Table]
| /admin/settings  Platform Settings | Global configuration | Feature flags: enable/disable features globally or per tier | Pricing configuration: update plan prices and features | XP and gamification settings: adjust XP rewards per action | Maintenance mode: toggle with custom message | API key management: third-party integrations | Email template editor | Privacy policy and terms of service editor |


# Chapter 5: Page Count Summary


[Table]
| Role | Page Count | Key Areas |
| Shared / Public | 4 pages | Landing, Login, Signup, Onboarding |
| Student | 25+ pages | Dashboard, Worlds, Practice, Memory, Interviews, Career, Community, Profile |
| Mentor | 9 pages | Dashboard, Sessions, Live Interview, Feedback, Reviews, Students, Earnings |
| Admin | 9 pages | Dashboard, Users, Mentors, Content, Knowledge Graph, Institutions, Analytics, Moderation, Settings |
| Total | 47+ pages | Complete platform coverage |



[Table]
| Build Order Recommendation | Phase 1 (build first):  /login, /signup, /onboarding, /dashboard, /worlds, /worlds/[slug]/lesson/[id], /worlds/[slug]/game/[id] | Phase 2:  /roadmap, /memory, /skill-dna, /practice, /analytics, /worlds/[slug]/boss/[level] | Phase 3:  /interviews/*, /career/*, /exams/*, /community/* | Phase 4:  /mentor/*, /admin/* | Always build the student experience first. Admin and mentor pages can be minimal until you have real users. |

