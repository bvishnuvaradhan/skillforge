SKILLFORGE

UI/UX Design Direction

Visual language, layout system, components, and design philosophy

Document 2 of 3  |  SkillForge Technical Series

# Chapter 1: Design Philosophy

## 1.1 The Core Principle

SkillForge is built for coding students. These are people who spend most of their day in VS Code, terminal windows, and dark browser tabs. The UI must feel like a natural extension of their environment — not a school LMS, not a corporate tool, not a children's game.

The design language is: developer-native, dark-first, data-rich, and gamified without being childish.

## 1.2 Three Words That Define the Visual Identity


[Table]
| Design Identity | DARK       — Dark background primary. Light theme optional. Developers expect dark. | SHARP      — Clean edges, monospace accents, terminal-inspired typography. | ALIVE      — Subtle animations, glowing accents, progress that feels satisfying. |


## 1.3 Inspirations


[Table]
| Platform | What to Borrow |
| VS Code | Dark bg, syntax-colored text, sidebar navigation, panel layout |
| GitHub | Clean data density, badge system, contribution graphs, repository cards |
| Vercel Dashboard | Minimal dark UI, elegant data cards, smooth transitions |
| Linear (app) | Dense information without clutter, keyboard-first design |
| Codeforces | Data-heavy layout — but make it beautiful instead of ugly |


# Chapter 2: Design Tokens

## 2.1 Color Palette


[Table]
| Token | Hex Value | Usage |
| --bg-primary | #0A0E1A | Main app background — deep navy black |
| --bg-secondary | #111827 | Card backgrounds, sidebars |
| --bg-elevated | #1A1F35 | Modals, dropdowns, tooltips |
| --bg-hover | #252B40 | Hover state for interactive elements |
| --brand-cyan | #00B4D8 | Primary brand color — buttons, links, highlights |
| --accent-purple | #7B2FBE | Secondary accent — badges, tags, world colors |
| --accent-green | #06D6A0 | Success states, correct answers, mastery high |
| --accent-orange | #FF6B35 | Warning states, boss battles, streak indicators |
| --accent-red | #EF4444 | Error states, failed attempts, retention low |
| --text-primary | #F1F5F9 | Main body text |
| --text-secondary | #94A3B8 | Subtitles, labels, metadata |
| --text-muted | #475569 | Placeholders, disabled states |
| --border | #1E2B45 | Subtle borders between elements |


## 2.2 Typography


[Table]
| Role | Font | Usage |
| Display / Headings | Space Grotesk | H1, H2, page titles — modern, slightly techy |
| Body Text | Inter | All paragraphs, labels, descriptions |
| Code / Monospace | JetBrains Mono | Code blocks, terminal output, topic tags, stat numbers |
| System Fallback | system-ui, sans-serif | Fallback if Google Fonts fails to load |


## 2.3 Spacing & Sizing Scale

Use a consistent 4px base grid. All padding, margin, and gap values should be multiples of 4.

xs: 4px — tight label spacing

sm: 8px — compact card padding

md: 16px — standard component padding

lg: 24px — section spacing

xl: 32px — page section gaps

2xl: 48px — major layout divisions

## 2.4 Border Radius

Small elements (badges, tags): 4px

Buttons, inputs: 8px

Cards, panels: 12px

Modals: 16px

Circular (avatars, icons): 9999px

## 2.5 Shadows & Glow

Use glow effects sparingly for emphasis on key interactive elements. This adds the 'alive' feel without being distracting.

Default card: box-shadow: 0 1px 3px rgba(0,0,0,0.4)

Hover card: box-shadow: 0 0 0 1px rgba(0,180,216,0.3), 0 4px 16px rgba(0,180,216,0.1)

Active/focus: box-shadow: 0 0 0 2px rgba(0,180,216,0.6) — brand cyan glow

Boss battle card: box-shadow: 0 0 20px rgba(255,107,53,0.3) — orange glow

# Chapter 3: Layout System

## 3.1 Global Layout

The app uses a three-panel layout on desktop, collapsing to a single-column on mobile:


[Table]
| Desktop Layout (3-panel) | [Left Sidebar 240px] | [Main Content flex-1] | [Right Panel 320px optional] | Left Sidebar:   Navigation, world map progress, quick stats | Main Content:   Current page content (games, roadmap, dashboard widgets) | Right Panel:    Context-sensitive (AI Mentor chat, recommendations, hints) |


## 3.2 Left Sidebar — Navigation

The sidebar should feel like a code editor's activity bar + sidebar combined. Key sections:

Top: SkillForge logo + user avatar + XP/level badge

Navigation: Dashboard, Worlds, Roadmap, Practice, Interviews, Career, Community

Middle: Current World progress mini-widget (progress bar + boss health bar)

Bottom: Memory Lab alert badge (if topics at risk), Settings, Help

Active nav item: Left border highlight in brand cyan + slightly elevated background. Exactly like VS Code's active sidebar item.

## 3.3 Main Content Area

Max width: 1200px, centered

Page header: Page title + subtitle + breadcrumb (small, muted)

Content below: Widget grid or full-width content depending on page type

Dashboard uses a CSS Grid layout: 3 columns on desktop, 1 on mobile

## 3.4 Right Panel

The right panel slides in contextually. It is not always visible. It appears for:

AI Mentor chat (sticky, always accessible via bottom-right FAB button)

Hint panel (during games or coding challenges)

Recommendation detail (when user clicks 'Why?' on a recommendation)

# Chapter 4: Core Components

## 4.1 Mastery Card

Used on the dashboard and in world pages to show a topic's mastery level.


[Table]
| Mastery Card Anatomy | ┌─────────────────────────────────────┐ | │  [Icon]  Dynamic Programming   [48%]│ | │  ████████░░░░░░░░░░░░░░░  48%       │ | │  Last practiced: 3 days ago         │ | │  Retention risk: MEDIUM  ⚠          │ | └─────────────────────────────────────┘ | - Background: --bg-secondary | - Progress bar fill color: based on score (green >80, orange 60-80, red <60) | - Retention risk badge: color-coded pill |


## 4.2 Recommendation Card


[Table]
| Recommendation Card Anatomy | ┌─────────────────────────────────────┐ | │  [🔁]  Review BFS            [Why?] │ | │  Retention dropped to 64%           │ | │  Impact: HIGH  |  Est: 20 min       │ | │  [Start Review]                     │ | └─────────────────────────────────────┘ | - Left accent border color = recommendation type color | - 'Why?' button opens AI explanation in right panel | - CTA button = brand cyan |


## 4.3 World Card


[Table]
| World Card — Map View | ┌─────────────────────────────────────┐ | │  [World Art / Icon]                 │ | │  Graph Kingdom            UNLOCKED  │ | │  ████████████░░░░  12/20 complete   │ | │  Boss: Graph Conqueror   [⚔ Fight!] │ | └─────────────────────────────────────┘ | - Locked worlds shown with blur overlay + lock icon | - Secret worlds shown as '???' until discovered | - Boss battle CTA glows orange when available |


## 4.4 Boss Battle Screen

Boss battles deserve special visual treatment. This is not a quiz — it feels like a battle.

Full-screen dark overlay when entering a boss battle

Boss has a name, avatar/illustration, and a health bar at the top

Student has a health bar at the bottom

Questions appear as attacks — correct answer deals damage to boss

Wrong answer deals damage to student (health drains)

Boss health bar color: red. Student health bar: cyan/green

On victory: full-screen particle explosion + badge award animation

## 4.5 Buttons


[Table]
| Variant | Style | Use Case |
| Primary | bg-cyan, text-dark, border-none | Main CTA: Start, Submit, Confirm |
| Secondary | bg-transparent, border-cyan, text-cyan | Secondary actions: Cancel, Back |
| Danger | bg-red, text-white | Destructive actions: Delete, Reset |
| Ghost | bg-transparent, text-secondary, hover:bg-elevated | Tertiary: Why?, Dismiss |
| Boss | bg-orange glow, text-white | Boss battle CTA only |


## 4.6 Data Visualization Components


[Table]
| Component | Used For | Library |
| Radial Progress Ring | Mastery % per topic (dashboard DNA view) | Custom SVG / Recharts |
| Line Chart | Mastery growth over time, rating history | Recharts |
| Heatmap Grid | Retention heatmap in Memory Lab | D3.js or custom CSS grid |
| Dependency Graph | Knowledge Graph visualization (admin) | D3.js force-directed graph |
| Bar Chart | Topic coverage, weak areas comparison | Recharts |
| Horizontal Gauge | Career readiness percentage per company | Custom CSS + Framer Motion |
| Contribution Graph | Activity calendar (GitHub-style) | Custom CSS grid |


# Chapter 5: Page Design Patterns

## 5.1 Dashboard (Mission Control)

The dashboard should answer 'What should I do today?' in under 3 seconds. The most important widget — Daily Focus — is at the top, full width. Everything else is secondary.


[Table]
| Dashboard Grid Layout | Row 1: [Daily Focus — full width] | Row 2: [Roadmap Preview — 2/3] | [Memory Snapshot — 1/3] | Row 3: [World Progress — 1/2] | [Career Readiness — 1/2] | Row 4: [Recommendations — 2/3] | [DNA Snapshot — 1/3] | All cards: --bg-secondary background, 12px radius, subtle border |


## 5.2 World Map Page

The world map is the emotional center of the platform — it shows the learner's entire journey at a glance. Treat it like a game overworld map.

Large canvas area showing worlds as connected nodes

Completed worlds: Full color, glowing border

In-progress worlds: Partial glow, progress ring overlay

Locked worlds: Desaturated, blur, lock icon, shows unlock requirements on hover

Secret worlds: Hidden completely until discovered, then revealed with a flash animation

Connecting paths between worlds light up as they are unlocked

## 5.3 Game Screen

Game screens are full-focus — sidebar collapses to a thin icon rail, right panel hidden. The game takes center stage.

Top bar: Game name + score + timer + hint count remaining

Main area: The game canvas (drag-and-drop, visual puzzle, etc.)

Bottom bar: Submit button + 'Use Hint' button + progress (1 of 5 puzzles)

Background: Slightly different dark shade from main app to signal 'focus mode'

## 5.4 Code Editor Screen (Coding Practice)

Split-panel layout inspired by LeetCode but darker and cleaner:

Left panel (40%): Problem statement, examples, constraints, hints

Right panel (60%): Monaco Editor with syntax highlighting

Bottom: Test cases panel + run/submit buttons

Top bar: Problem title + difficulty badge + topic tags + timer

Difficulty badge colors: Easy=green, Medium=orange, Hard=red

## 5.5 Interview Screen

A focused, professional environment. No distractions.

Video panel (top right corner, small, collapsible)

Problem panel (left 40%)

Code editor (right 60%)

Bottom bar: Communication hints, time elapsed, submit button

Mentor mode (human interview): Mentor's video is larger, student's is PiP

# Chapter 6: Gamification Visual Language

## 6.1 XP & Leveling System

Every action earns XP. The XP bar is always visible in the sidebar. Leveling up triggers a full-screen animation.


[Table]
| Action | XP Reward |
| Complete a game (first attempt) | 50 XP |
| Pass a Mini Boss | 100 XP |
| Pass a World Boss | 300 XP |
| Pass a Grand Boss | 1000 XP |
| Daily login streak (7 days) | 200 XP |
| Solve a hard coding problem | 75 XP |
| Complete a mock interview | 150 XP |


## 6.2 Badges & Achievements

Badges are displayed on the learner's profile. They are earned through specific achievements.

Badge design: Hexagonal shape (like programming patches), metallic border

Locked badges: Shown as grey silhouettes with a lock icon — creates curiosity

Rare badges (Grand Bosses): Gold border + glow effect

Secret badges: Only visible after unlocking — not shown as silhouettes

## 6.3 Streak Visualization

Streak counter in sidebar: flame icon + number (turns gold at 30 days, rainbow at 100 days)

Activity calendar: GitHub-style contribution grid on profile page

Streak broken: Red notification + gentle message (never shame the user)

## 6.4 Boss Battle Visual Effects

Entry: Screen darkens with a dramatic 'Boss Encountered' overlay

Health bars: Animated, smooth drain with screen shake on big hits

Victory: Full-screen particle burst + badge float-in animation + XP counter ticking up

Defeat: Screen flashes red + 'Try Again' with specific weak area highlighted

# Chapter 7: Micro-interactions & Animations

## 7.1 Principles

Every interaction gets feedback — no silent button presses

Animations are fast (150–300ms) — never slow or decorative

Reduced motion mode: All animations replaced with instant state changes

## 7.2 Key Animations


[Table]
| Interaction | Animation | Duration |
| World unlock | Card scales up + glows + confetti burst | 800ms |
| Correct answer (game) | Green flash + +XP float indicator | 300ms |
| Wrong answer (game) | Red shake + health bar drain | 400ms |
| Recommendation dismissed | Card slides out left | 200ms |
| Level up | Full-screen glow + level badge bounces | 1000ms |
| Page transition | Fade + slight upward slide | 150ms |
| Mastery score increase | Bar fills with glow, number ticks up | 500ms |
| Boss health drain | Smooth bar drain + screen micro-shake | 600ms |


## 7.3 Loading States

Skeleton screens (not spinners) for all data-loading states

Skeleton uses --bg-elevated color with a shimmer animation

Global page loader: thin progress bar at very top of screen (like GitHub)

## 7.4 Empty States

Empty states should not feel like errors. They should feel like invitations.

No recommendations: 'You are all caught up! Come back after your next session.'

No worlds unlocked yet: 'Complete your assessment to unlock your first world.'

No coding activity: 'Link your LeetCode profile to start tracking your progress.'

Each empty state has a small illustration (not stock art — simple SVG line art, developer-themed).

# Chapter 8: Responsive Design & Accessibility

## 8.1 Breakpoints


[Table]
| Breakpoint | Width | Layout Change |
| mobile | < 768px | Single column, bottom nav bar, sidebar hidden |
| tablet | 768px – 1024px | Two column, collapsible sidebar |
| desktop | 1024px – 1440px | Three panel full layout |
| wide | > 1440px | Max-width 1440px centered, extra whitespace |


## 8.2 Mobile Navigation

On mobile, the left sidebar becomes a bottom navigation bar with 5 icons: Dashboard, Worlds, Practice, Career, Profile. This matches mobile app conventions that students are familiar with from apps like Instagram and YouTube.

## 8.3 Accessibility Checklist

Color contrast ratio: minimum 4.5:1 for all text on backgrounds (WCAG AA)

Focus indicators: Visible cyan ring on all focusable elements

ARIA labels: All icon buttons, charts, and interactive game elements

Keyboard navigation: Full app navigable without mouse

Screen reader: All heatmaps and charts have text alternatives

Motion: prefers-reduced-motion media query respected — all animations disabled

Font size: Body text minimum 16px; never below 12px for any label

Touch targets: Minimum 44x44px for all tappable elements on mobile
