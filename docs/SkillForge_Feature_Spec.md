SKILLFORGE

Complete Feature Specification

AI-Powered Programmer Growth Ecosystem

Version 1.0  |  Deep Specification Document

# Chapter 1: Platform Overview

## 1.1 What is SkillForge?

SkillForge is an AI-powered programmer growth ecosystem that guides learners through every stage of their journey — from writing their first variable to getting hired at top technology companies. Unlike traditional platforms that address only one aspect of learning (coding practice, theory, or interview prep), SkillForge integrates all of them into a single, intelligent, and adaptive platform.

The platform continuously answers five core questions for every learner:

What should I learn next?

What should I practice today?

What am I forgetting?

What are my weak areas?

Am I ready for interviews and jobs?

## 1.2 Core Philosophy

SkillForge is built on three foundational principles:

Personalization: No two learners follow the same path. Every roadmap, recommendation, and world unlock is unique to the individual.

Explainability: Every AI decision is transparent. Learners always know why they are being asked to do something.

Continuity: The platform does not stop at learning. It guides learners through practice, retention, interview prep, resume building, and job readiness.

## 1.3 Platform Architecture Summary


[Table]
| Layer | Description |
| Learner Model | Digital Learning Twin — continuously evolving AI model of each user |
| Intelligence | Recommendation Engine, Memory Intelligence, Forecasting Engine |
| Content | Learning Worlds, Games, Blockly, Roadmaps, Knowledge Graph |
| Practice | Coding Practice Ecosystem integrated with external platforms |
| Assessment | Boss Battles, Mock Exams, Mock Interviews (AI + Human) |
| Career | Resume Builder, LinkedIn Optimizer, Career Readiness Engine |
| Community | Institutional Platform, Teams, Leaderboards, Competitions |
| Operations | Three-Role Ecosystem: Student, Mentor, Admin |


# Chapter 2: Three-Role Ecosystem

SkillForge operates through three distinct roles, each with its own permissions, workflows, and interfaces.

## 2.1 Student / User

### 2.1.1 Description

The Student is the primary learner on the platform. Every feature is designed to serve the student's growth journey. Students interact with learning content, games, roadmaps, assessments, interviews, and the career center.

### 2.1.2 Capabilities

Access learning worlds and complete lessons, games, quests, and boss battles

Follow a personalized AI-generated roadmap

Solve coding problems and link external coding profiles

Take AI and human mock interviews

Build and score resumes

Receive AI mentoring through the AI Mentor

Track progress through the Mission Control dashboard

Join teams, communities, and competitions

Access the Memory Lab for retention management

View Skill DNA and Forecasting reports

### 2.1.3 Onboarding Flow

Select primary goal: Placements, Competitive Programming, DSA Mastery, or Interview Preparation

Optionally link coding profiles: LeetCode, Codeforces, CodeChef, GitHub

Complete an adaptive assessment to measure current knowledge

Platform generates the Digital Learning Twin

First Learning World is unlocked

Personalized Roadmap is generated and displayed

### 2.1.4 Business Rules

Free tier users have access to core learning, games, and basic roadmaps

Premium tier unlocks Memory Lab, advanced analytics, AI Mentor, and advanced assessments

Students cannot access admin or mentor dashboards

Profile data is private by default; students may set visibility to Team Only or Public

## 2.2 Mentor / Reviewer

### 2.2.1 Description

Mentors are verified human experts who conduct interviews, review resumes and exams, and provide personalized guidance to learners. They operate within the Mentor Marketplace and can be senior students, alumni, competitive programmers, trainers, or industry professionals.

### 2.2.2 Verification Process

Mentor submits an application with experience details, coding profiles, and expertise areas

Platform reviews submitted profiles and achievement data

Admin approves or rejects the application

Approved mentors receive a Verified badge and access to the mentor dashboard

### 2.2.3 Capabilities

Conduct live mock interviews (DSA, Coding, System Design, Behavioral, HR)

Review student resumes and provide scored feedback

Evaluate mock exam submissions

Track assigned or booked students

View student learning profiles (with student consent)

Set availability and session pricing

### 2.2.4 Quality Framework

Student Rating: Collected after every session (1–5 stars with comments)

Session Quality Score: Calculated from feedback completeness, on-time rate, and student satisfaction

Rebooking Rate: Percentage of students who book the mentor again

Performance Reviews: Admins may conduct periodic reviews for low-rated mentors

Consequences: Warnings, retraining requirements, suspension, or removal for consistently poor performance

### 2.2.5 Payment Model

Mentors set their own session price (within platform-defined min/max range)

SkillForge takes a platform commission per session (exact % defined in business terms)

Payouts are processed weekly to verified mentor accounts

## 2.3 Admin

### 2.3.1 Description

Admins are platform managers responsible for content quality, user management, institutional relationships, and platform health. They have the highest level of access across the platform.

### 2.3.2 Capabilities

Manage all user accounts (view, suspend, delete, restore)

Approve or reject mentor applications

Manage learning world content, boss battles, exams, and interview tracks

Monitor platform analytics and system health

Manage institutional licenses and cohort configurations

Review community moderation reports and take action

Configure premium features, pricing tiers, and platform policies

### 2.3.3 Edge Cases

If a mentor is reported by multiple students, the admin receives an automatic alert

If a student appeals a boss battle result, admins can review and override

Admins cannot see private interview recordings without student consent

# Chapter 3: Digital Learning Twin

## 3.1 Overview

The Digital Learning Twin (DLT) is the central intelligence of SkillForge. It is a continuously evolving AI model that represents each learner's complete knowledge state. Every recommendation, roadmap, world unlock, and forecast is powered by the DLT. It updates in real time as the learner interacts with the platform.

## 3.2 States Tracked


[Table]
| State | Description |
| Knowledge State | The set of programming concepts the learner has been exposed to and has engaged with |
| Mastery State | A score (0–100%) per topic representing how well the learner understands and can apply it |
| Retention State | How much of previously learned knowledge is likely still remembered, based on time decay and reinforcement |
| Learning Style | Whether the learner prefers visual content, games, reading, or problem-solving — inferred from behavior |
| Consistency State | How regularly the learner practices — daily streaks, session frequency, gap analysis |
| Readiness State | Which topics the learner has sufficient prerequisite knowledge to begin learning next |
| Career State | A composite score reflecting how prepared the learner is for placements and interviews |


## 3.3 How Mastery is Calculated

Mastery for each topic is a weighted composite score derived from multiple signals:

Game performance: Scores and completion rates on topic-specific interactive games

Assessment results: Boss battle outcomes, quiz scores, and exam results

Coding practice: Solved problems tagged to the topic, difficulty level, and time taken

Mock interview performance: Technical score on interview questions related to the topic

Retention reinforcement: Whether the learner successfully recalls content in Memory Lab reviews


[Table]
| Mastery Score Formula (Conceptual) | Mastery(topic) = w1 * GameScore + w2 * AssessmentScore + w3 * CodingScore + w4 * InterviewScore + w5 * RetentionScore | Weights (w1–w5) are adjusted based on the learner's primary goal and activity history. | Score decays over time if the topic is not revisited (see Memory Intelligence chapter). |


## 3.4 How the DLT Updates

Learner completes any activity (game, quiz, coding problem, interview)

Activity result is processed by the Analytics Engine

Relevant topic scores are recalculated

DLT states are updated: Mastery, Retention, Readiness, Career State

Recommendation Engine is triggered to refresh action recommendations

Forecasting Engine recalculates future readiness predictions

Dashboard reflects updated state on next load

## 3.5 UI Representation

Students can view their DLT through the Skill DNA panel on the dashboard

Mastery scores are shown as progress bars per topic

Retention risk areas are highlighted in the Memory Snapshot widget

Career State is shown as a readiness percentage per company tier

## 3.6 Edge Cases

New users with no activity have all states at 0%; the adaptive assessment bootstraps initial values

If a user deletes their account and re-registers, the DLT starts fresh

If two data sources conflict (e.g. game score very high but coding score low), the system weights them and flags the inconsistency for review

# Chapter 4: Interactive Learning Games

## 4.1 Overview

Interactive Learning Games are one of SkillForge's most distinctive features. Rather than requiring learners to read theory before writing code, the games teach programming and algorithmic concepts through direct visual interaction and gameplay. Each game is mapped to one or more topics in the Knowledge Graph and contributes to Mastery scores upon completion.

## 4.2 General Game Workflow

Learner enters a Learning World and selects a game

A brief objective is shown (e.g., 'Build a loop that prints 1 to 10')

Learner interacts with the visual game interface

The system validates the learner's actions in real time

Upon success, a score is calculated (accuracy + speed + hints used)

Score is sent to the Analytics Engine to update the DLT

Feedback screen shows what was correct, what was missed, and a tip for improvement

## 4.3 Game Catalog

### 4.3.1 Logic Builder

Concepts Taught: Variables, operators, expressions, type assignment

Mechanic: Learner drags and connects puzzle pieces representing values, operators, and variable names to form valid expressions

Validation: The system evaluates the expression and checks if it produces the expected output

Edge Cases: Invalid operator combinations are highlighted in red; learner cannot submit until expression is syntactically valid

### 4.3.2 If-Else Constructor

Concepts Taught: Conditional logic, boolean expressions, decision trees

Mechanic: Learner builds an if-else decision tree by selecting conditions and outcomes from a visual panel

Validation: A set of test inputs is run through the learner's decision tree and outputs are compared to expected results

Edge Cases: Incomplete branches are flagged; learner must handle all possible input cases before submitting

### 4.3.3 Loop Builder

Concepts Taught: While loops, for loops, nested loops, loop termination

Mechanic: Learner selects loop type, sets initialization, condition, and increment, then observes a live animation of the loop executing

Validation: The system checks whether the loop terminates correctly and produces the expected iteration sequence

Edge Cases: Infinite loop detection: if the loop condition never becomes false within 1000 iterations, the system pauses and warns the learner

### 4.3.4 Recursion Maze

Concepts Taught: Recursive thinking, base cases, call stacks

Mechanic: A maze is displayed. The learner writes a recursive rule (base case + recursive case) and watches an agent navigate the maze using those rules

Validation: The agent must reach the exit using only the learner's defined rules

Edge Cases: Missing base case causes infinite recursion — the system detects this after a depth threshold and shows a stack overflow visualization

### 4.3.5 BFS Explorer

Concepts Taught: Breadth-first search, queues, level-order traversal

Mechanic: A graph is displayed. The learner selects the starting node and watches BFS expand level by level. They can control the expansion speed and must predict the next node to be visited

Validation: Learner's prediction sequence is compared against the correct BFS order

Edge Cases: Disconnected graphs require the learner to identify and handle unvisited components

### 4.3.6 DFS Adventure

Concepts Taught: Depth-first search, stacks, backtracking

Mechanic: An interactive graph world where the learner guides a character using DFS rules — always go deeper before backtracking

Validation: The path taken is checked against valid DFS traversal orders

Edge Cases: Cycles in the graph require the learner to mark visited nodes to avoid infinite loops

### 4.3.7 Sliding Window Challenge

Concepts Taught: Sliding window technique, subarray optimization

Mechanic: An array of numbers is displayed. The learner adjusts a visual window over the array and identifies the window position that satisfies the given condition (e.g., maximum sum of size k)

Validation: The system checks whether the learner's selected window satisfies the constraint

Edge Cases: Edge windows (at array boundaries) must still be handled correctly

### 4.3.8 Dynamic Programming Builder

Concepts Taught: DP table construction, state transitions, memoization

Mechanic: A DP table is shown with some cells filled. The learner must fill in the remaining cells using the recurrence relation shown on screen

Validation: Each cell value is checked against the correct computed value before the learner can proceed

Edge Cases: If a learner fills a cell incorrectly, they receive a hint showing which previous cells are used in the formula

### 4.3.9 Graph Connection Puzzle

Concepts Taught: MST, shortest paths, connectivity, graph traversal

Mechanic: A set of disconnected nodes is displayed. The learner draws edges to connect them while satisfying constraints (e.g., minimum total weight for MST, or shortest path between two nodes)

Validation: The system checks whether the resulting graph satisfies the problem constraints using standard graph algorithms

Edge Cases: Multiple valid solutions exist for some puzzles; all correct solutions are accepted

### 4.3.10 Greedy Strategy Arena

Concepts Taught: Greedy algorithms, local vs global optimum, activity selection

Mechanic: A series of decisions are presented (e.g., which task to pick next). The learner makes greedy choices and observes whether the strategy leads to the global optimum

Validation: The final result is compared against the optimal greedy solution

Edge Cases: Some puzzles intentionally show cases where greedy fails, teaching learners to recognize when greedy is not optimal

## 4.4 Scoring System


[Table]
| Factor | Impact on Score |
| Correct solution | Base score awarded |
| Hints used | Score reduced by 10% per hint |
| Time taken | Bonus points for fast completion |
| First attempt success | Bonus multiplier applied |
| Retry after failure | Partial credit for eventual success |


## 4.5 Business Rules

Games are available in both Free and Premium tiers (basic games free, advanced games premium)

Each game can be replayed; only the highest score per game counts toward Mastery

Game scores decay over time if not replayed (Memory Intelligence applies)

Games can be assigned by Admins as mandatory content within a Learning World

# Chapter 5: Blockly-Style Visual Programming

## 5.1 Overview

The Blockly-style Visual Programming environment allows learners to build programs without writing code first. By dragging and connecting visual blocks, learners construct logic that is automatically translated into C++, Java, or Python. This bridges the gap between conceptual understanding and actual coding.

## 5.2 Block Types


[Table]
| Block Category | Examples |
| Variables | Declare variable, assign value, increment, decrement |
| Conditions | If block, Else block, Else-If block, comparison operators |
| Loops | For loop block, While loop block, Do-While block, Break, Continue |
| Functions | Define function, call function, return value, parameters |
| Arrays | Declare array, access index, insert, delete, iterate |
| Input / Output | Read input block, print block, print line block |


## 5.3 Workflow

Learner opens the Blockly workspace within a Learning World or standalone

A problem statement is shown on the right panel

Learner drags blocks from the left palette onto the canvas

Blocks snap together when compatible; incompatible blocks are visually rejected

Learner can view the generated code at any time by toggling the Code View panel

Learner runs the program — output appears in the output panel

If the output matches the expected output, the task is marked complete

Mastery contribution is recorded for relevant topics

## 5.4 Code Generation

The platform generates clean, readable code from the visual logic. Code generation rules:

Each block maps to a specific code template per language

Indentation is automatically applied based on nesting depth

Variable names used in blocks are preserved in the generated code

Generated code is syntactically valid and can be copied and run in any standard compiler

## 5.5 Algorithm Builder Mode

In Algorithm Builder Mode, learners can construct full algorithms visually before implementing them in code. Pre-built algorithm templates are available for:

BFS and DFS traversal

Bubble Sort, Merge Sort, Quick Sort

Binary Search

Recursive functions (Factorial, Fibonacci, Tower of Hanoi)

Dynamic Programming (Knapsack, LCS)

## 5.6 Business Rules

Blockly workspace is available on both Free and Premium tiers

Algorithm Builder Mode is a Premium-only feature

Saved programs are stored in the learner's profile

Programs saved in Blockly can be exported to the in-platform code editor

## 5.7 Edge Cases

If a learner deletes a block that other blocks depend on, dependent blocks are highlighted in red

Circular function calls (infinite recursion) are detected and the learner is warned before running

Code generated from very large Blockly programs may exceed the output panel display limit — a 'Download Code' option is shown

# Chapter 6: Adaptive Learning Worlds

## 6.1 Overview

Learning Worlds are themed environments that organize all learning content, games, quests, and assessments. Each world covers a specific domain of programming knowledge. Worlds unlock based on actual learner growth, not simple level completion, creating a truly personalized progression system.

## 6.2 World Catalog


[Table]
| World Name | Topics Covered |
| Variables Kingdom | Variables, data types, operators, expressions, type casting |
| Conditions Valley | If-else, switch, boolean logic, nested conditions |
| Loop Forest | For loops, while loops, do-while, nested loops, loop control |
| Array Arena | 1D and 2D arrays, operations, traversal, searching, sorting |
| Function Fortress | Functions, parameters, return values, scope, recursion basics |
| Recursion Caverns | Recursive thinking, base cases, call stacks, backtracking |
| Tree Forest | Binary trees, BST, tree traversal, height, depth |
| Graph Kingdom | Graphs, BFS, DFS, shortest paths, MST, connectivity |
| Dynamic Programming Realm | Memoization, tabulation, classic DP problems |
| Competitive Programming Citadel | Advanced algorithms, contest strategies, optimization |


## 6.3 World Structure

Each world contains the following components in a progressive order:

Introduction: A brief narrative and concept overview

Lessons: Structured learning content (text + visuals)

Games: Interactive learning games for the world's concepts

Blockly Challenges: Visual programming tasks

Quests: Multi-step missions combining multiple concepts

Mini Boss: Concept-level mastery check

Coding Challenges: Practice problems linked to the world's topics

World Boss: Full topic mastery assessment

Secret Area (optional): Unlocked by exceptional performance within the world

## 6.4 Intelligent World Unlocking

### 6.4.1 Unlocking Criteria

Worlds do not unlock by simply completing previous worlds. The platform evaluates a combination of signals:


[Table]
| Signal | What it Measures |
| Mastery Score | Average mastery across all prerequisite topics (threshold: typically 80–90%) |
| Retention Score | Whether prerequisite knowledge is still retained (not just learned and forgotten) |
| Readiness Score | Whether the learner has engaged with all recommended prerequisites |
| Consistency | Whether the learner has been active recently (prevents unlocking based on stale progress) |
| Topic Dependencies | The Knowledge Graph determines which topics must be mastered before a new world is accessible |


### 6.4.2 Unlock Examples


[Table]
| Example Unlock Conditions | Arrays → 90%, Sorting → 88%, Searching → 86%  →  Unlocks: Algorithm Arena | Trees → 90%, DFS → 88%  →  Unlocks: Graph Kingdom | Graphs → 85%, Shortest Paths → 82%  →  Unlocks: Dynamic Programming Realm |


### 6.4.3 Unlock Notification

Learner receives an in-app notification when a new world unlocks

The dashboard shows a visual animation of the new world appearing on the world map

The AI Mentor sends a context-aware message explaining why the world unlocked

## 6.5 Boss Battles

### 6.5.1 Mini Bosses

Mini Bosses appear at the end of each major concept section within a world. They are quick assessments (5–10 questions) that validate understanding of a single concept before the learner proceeds to the next section.

Passing threshold: 70%

On failure: Learner is directed to review specific weak areas and may retry after a cooldown period

### 6.5.2 World Bosses

World Bosses are comprehensive assessments at the end of each world. They test all topics covered in the world across multiple formats: MCQ, code tracing, and short coding problems.

Passing threshold: 80%

On failure: Detailed performance breakdown is shown; learner must review flagged topics before retrying

On success: World completion badge awarded; Mastery scores updated; next world unlock evaluated

### 6.5.3 Grand Bosses

Grand Bosses are major milestone challenges that appear at key progression points (e.g., after completing Trees and Graphs, after completing all DP worlds). They test cross-topic integration.

Examples: Graph Conqueror, DP Architect, Algorithm Master, Interview Champion

Grand Bosses require human review for certain formats (system design, open-ended problems)

Awarded certifications are displayed on the learner's profile

## 6.6 Secret Worlds

Secret Worlds are hidden premium environments that unlock only for exceptional learners. They are not shown on the world map until unlock requirements are met.


[Table]
| Secret World | Unlock Requirements |
| Interview Dungeon | Mastery > 90% across Trees, Graphs, DP; Interview Readiness > 80% |
| Competitive Legends Arena | Codeforces rating > 1600 or equivalent platform achievement |
| Championship Realm | Completed all Grand Bosses with > 85% score |
| AI Strategy Lab | Consistency > 80% over 90 days; Mastery > 90% overall |


## 6.7 Edge Cases

If a learner's Mastery score drops below the unlock threshold (due to retention decay), the world remains accessible but the learner is nudged to reinforce prerequisites

If an admin removes or updates a world, learners who have completed it retain their progress and badges

Worlds in Phase 2 (not yet built) show as 'Coming Soon' on the world map

# Chapter 7: Memory Intelligence & Memory Lab

## 7.1 Overview

Memory Intelligence is one of SkillForge's most advanced and differentiating systems. Rather than waiting for learners to forget, the platform proactively predicts when forgetting is likely to occur and schedules reinforcement before the knowledge is lost. This is based on the well-established science of spaced repetition and the Ebbinghaus forgetting curve.

## 7.2 How Memory Intelligence Works

### 7.2.1 Retention Tracking

Every concept the learner engages with receives an initial retention score based on how well they performed. This score decays over time according to a forgetting curve model. The decay rate is adjusted based on:

How strongly the concept was initially learned (higher mastery = slower decay)

How many times the learner has reviewed the concept (more reviews = slower decay)

The learner's historical retention patterns for similar concepts

### 7.2.2 Forgetting Curve Model


[Table]
| Retention Decay Model | Retention(t) = Initial_Retention * e^(-t / Stability) | Where t = time since last review, Stability = strength of memory | Stability increases with each successful review. | When Retention(t) drops below 70%, a reinforcement recommendation is triggered. |


### 7.2.3 Reinforcement Triggers

When predicted retention for a topic drops below 70%, the Recommendation Engine generates a 'Review' action

If multiple topics are at risk, they are prioritized by importance to current roadmap goals

The Smart Nudge System sends a notification reminding the learner before retention becomes critical

## 7.3 Memory Lab Interface

The Memory Lab is a dedicated workspace where learners can view and manage their memory health. It is a Premium tier feature.

### 7.3.1 Memory Health Score

A single composite score (0–100) representing the overall health of the learner's retained knowledge. Calculated as the weighted average of retention scores across all learned topics, weighted by topic importance.

### 7.3.2 Forgetting Curves

A visual graph showing the predicted retention decay curve for each topic over the coming days and weeks. Learners can see exactly when a topic is expected to drop below the safe retention threshold.

### 7.3.3 Retention Heatmap

A grid visualization showing all learned topics color-coded by retention level. Green = high retention, Yellow = moderate risk, Red = high risk of forgetting.

### 7.3.4 Reinforcement Calendar

A calendar view showing scheduled review sessions. Each session is optimally timed based on the forgetting curve to maximize retention with minimum review effort.

### 7.3.5 Risk Areas

A list of topics currently at risk of being forgotten, sorted by urgency. Each entry shows the topic name, current retention %, days until critical threshold, and a one-click button to begin review.

### 7.3.6 Review Suggestions

AI-generated review tasks for at-risk topics. These may include quick quizzes, game replays, or coding problems tagged to the topic.

## 7.4 Business Rules

Memory Lab is a Premium tier feature

Free tier users receive basic retention alerts through the Smart Nudge system only

Retention scores are factored into world unlock eligibility (not just mastery)

If a learner completes a review task, the stability of the topic increases and the decay curve resets

## 7.5 Edge Cases

If a learner has not logged in for 30+ days, the system flags all topics as 'High Risk' and shows a recovery plan on next login

Topics not yet learned have no retention curve and are shown as 'Not Started'

If retention drops to 0% for a critical prerequisite, the system may temporarily reduce the learner's world access and prompt a review before continuing

# Chapter 8: Recommendation Intelligence & Arbitration

## 8.1 Overview

The Recommendation Engine continuously generates personalized action recommendations for every learner. These are not generic suggestions — each recommendation is grounded in the learner's current DLT state, roadmap, retention, and career goals. The Arbitration System ensures learners receive only the most valuable, non-conflicting, non-overwhelming set of actions at any time.

## 8.2 Recommendation Types


[Table]
| Type | Example |
| Learn | Start the BFS Explorer game in Graph Kingdom |
| Review | Review Arrays — retention has dropped to 64% |
| Practice | Solve 3 Binary Search problems on LeetCode |
| Reinforce | Retake the Recursion Mini Boss |
| Interview Prep | Attempt an AI mock DSA interview — you are 80% ready |
| Career | Update your resume's Projects section |
| Consistency | You haven't practiced in 3 days — complete a 15-minute session today |


## 8.3 Recommendation Metadata

Every recommendation includes full context so learners understand why it is being shown:

Why: The specific DLT signal that triggered this recommendation

Impact: Expected improvement in Mastery, Retention, or Readiness if completed

Effort: Estimated time to complete (e.g., 15 min, 30 min)

Confidence: How confident the system is that this recommendation is appropriate (%)

Dependencies: What other recommendations or topics this action depends on

## 8.4 Recommendation Arbitration

At any given time, dozens of potential recommendations may be generated. The Arbitration System filters and prioritizes them to prevent learner overwhelm.

### 8.4.1 Arbitration Steps

Deduplication: Remove identical or near-identical recommendations

Conflict resolution: If two recommendations conflict (e.g., 'Practice Arrays' vs 'Review Arrays'), select the higher-priority one

Cooldown enforcement: A recommendation that was recently completed or dismissed cannot reappear for a defined cooldown period

Load balancing: No more than 5–7 recommendations are shown at once

Priority scoring: Rank remaining recommendations by urgency, impact, and alignment with current goals

Final selection: Top 3–5 recommendations are surfaced on the dashboard

## 8.5 Explainability

Every recommendation is fully explainable. Learners can tap 'Why?' on any recommendation to see a detailed explanation from the AI Mentor, including which DLT signal triggered it and what the expected outcome of completing it is.

## 8.6 Business Rules

Recommendations update after every learner activity

Learners can dismiss a recommendation (it re-evaluates after cooldown)

Learners can snooze a recommendation for 1, 3, or 7 days

Admins can inject platform-wide recommendations (e.g., 'New World Unlocked' announcements)

# Chapter 9: Personalized Roadmaps & Knowledge Graph

## 9.1 Personalized Learning Roadmaps

### 9.1.1 Overview

Every learner receives a unique personalized roadmap generated by the platform. The roadmap is a structured, ordered sequence of topics that takes the learner from their current state to their stated goal. Unlike a fixed curriculum, the roadmap adapts continuously as the learner's DLT evolves.

### 9.1.2 Roadmap Generation Inputs

Learner's stated goal (Placements, Competitive Programming, DSA Mastery, Interview Preparation)

Current Mastery scores across all topics

Current Retention scores

Topic dependencies from the Knowledge Graph

Readiness State from the DLT

Learning history (what has already been completed)

### 9.1.3 Roadmap Structure

The roadmap is displayed as a visual timeline with the following sections:

Completed: Topics already mastered with high retention

In Progress: Topics currently being learned

Up Next: Topics the learner is ready to begin

Locked: Topics the learner is not yet ready for (prerequisites not met)

Goal Milestone: A visual indicator showing how close the learner is to their stated goal

### 9.1.4 Roadmap Updates

The roadmap recalculates and updates when any of the following occur:

A new topic is mastered or a Mastery score changes significantly

A retention score drops, requiring re-sequencing to include review tasks

The learner changes their primary goal

A new Learning World unlocks

The learner completes a boss battle

### 9.1.5 Roadmap Example


[Table]
| Sample Roadmap Sequence (Placements Goal) | Arrays → Binary Search → Sorting Algorithms → Two Pointers → Sliding Window | → Linked Lists → Stacks & Queues → Trees → BST → DFS/BFS | → Graphs → Shortest Paths → Dynamic Programming → System Design Basics | → Mock Interviews → Resume Building → Company-Specific Prep |


## 9.2 Knowledge Graph

### 9.2.1 Overview

The Knowledge Graph is a directed graph that maps all programming concepts and their dependency relationships. It is the foundation of the roadmap generator, the world unlock system, and the recommendation engine. The graph is maintained and extended by platform admins and content experts.

### 9.2.2 Node Types

Concept Node: A single programming topic (e.g., Binary Search, BFS)

World Node: A Learning World that groups related concepts

Milestone Node: A grand boss or certification checkpoint

### 9.2.3 Edge Types

Prerequisite Edge: Topic A must be mastered before Topic B can be learned

Related Edge: Topic A and Topic B are related and learning one improves understanding of the other

Reinforces Edge: Practicing Topic A reinforces retention of Topic B

### 9.2.4 Graph Examples


[Table]
| Knowledge Graph Paths | Arrays → Prefix Sum → Sliding Window → Two Pointers | Trees → DFS → Graphs → BFS → Shortest Paths → MST | Recursion → Dynamic Programming → Advanced DP Problems |


### 9.2.5 Business Rules

The Knowledge Graph is maintained by platform admins; students cannot edit it

New topics added to the graph automatically propagate to affected roadmaps

If a topic's prerequisites change, learners who previously unlocked it retain access

# Chapter 10: Skill DNA & Forecasting Engine

## 10.1 Skill DNA

### 10.1.1 Overview

Skill DNA is a personalized learning profile that captures the learner's unique behavioral and cognitive patterns. It goes beyond mastery scores to explain how the learner learns, where they are consistent, and what their growth opportunities are.

### 10.1.2 DNA Components


[Table]
| Component | Description |
| Learning Style | Visual / Game-based / Reading / Problem-solving — inferred from which content types produce the best outcomes |
| Consistency Pattern | Daily, bursty, or irregular — based on session frequency and gap analysis over time |
| Exploration Behavior | Whether the learner prefers to finish one topic deeply before moving on, or prefers to explore broadly |
| Strengths | Top 3–5 topics where the learner consistently performs above average |
| Weaknesses | Topics where the learner struggles repeatedly despite multiple attempts |
| Growth Opportunities | Topics adjacent to the learner's strengths that they have not yet explored but are well-positioned to learn |


### 10.1.3 UI Representation

Skill DNA is displayed as a visual card on the dashboard (Skill DNA Snapshot)

Full Skill DNA report available in the learner's profile

Learners can see how their DNA has evolved over time

### 10.1.4 Business Rules

Skill DNA is generated after at least 7 days of platform activity

DNA updates weekly based on accumulated behavior patterns

Skill DNA is private by default and not shared with institutions without learner consent

## 10.2 Forecasting Engine

### 10.2.1 Overview

The Forecasting Engine predicts future outcomes based on the learner's current trajectory. Rather than reacting to problems after they occur, the engine allows both the learner and the platform to take proactive action.

### 10.2.2 Forecasts Generated


[Table]
| Forecast Type | Example Output |
| Topic Readiness | At current pace, learner will be ready for Dynamic Programming in 14 days |
| Retention Risk | Graph retention predicted to drop below 70% in 5 days — review recommended |
| Rating Growth | Expected Codeforces rating growth of +120 over next 30 days if current practice continues |
| Placement Readiness | At current pace, learner will reach 80% placement readiness in 45 days |
| Interview Readiness | Learner is on track to be ready for Amazon interviews in 3 weeks |


### 10.2.3 How Forecasts Are Generated

The engine extrapolates from the learner's current Mastery growth rate across each topic

Retention decay curves are projected forward in time

Goal gap analysis: How far is the learner from the readiness threshold for their stated goal?

Historical patterns from similar learners are used to calibrate predictions

### 10.2.4 Business Rules

Forecasts are updated daily

Forecasts are shown on the dashboard (Career Readiness section) and in the Skill DNA report

Forecasts are informational — learners can override their pace by adjusting goals

# Chapter 11: Dashboard (Mission Control)

## 11.1 Overview

The Dashboard, called Mission Control, is the central workspace that every learner sees upon logging in. Its primary purpose is to answer one question immediately: 'What should I do today?' Every element on the dashboard is personalized based on the learner's current DLT state.

## 11.2 Dashboard Widgets


[Table]
| Widget | Content |
| Daily Focus | Top 1–3 actions the learner should take today, selected by the Recommendation Engine |
| Recommendations | Full list of current personalized recommendations with Why/Impact/Effort metadata |
| Progress Tracking | Visual progress bars for each Learning World currently in progress |
| Roadmap Preview | Next 3–5 steps on the learner's personalized roadmap |
| Memory Snapshot | Top 3 topics at risk of being forgotten, with quick-review buttons |
| DNA Snapshot | One-line summary of the learner's current Skill DNA profile |
| World Progress | Map of all Learning Worlds showing completed, in-progress, and locked worlds |
| Readiness Metrics | Career readiness percentages: Placement, FAANG, Product, Service, Startup |


## 11.3 Workflow

Learner logs in

Dashboard loads with all widgets populated from the current DLT state

Daily Focus widget is shown prominently at the top

Learner clicks on a Daily Focus action — they are taken directly to the relevant content

After completing an action, the dashboard refreshes and updates

## 11.4 Mobile vs Desktop

Mobile: Shows Daily Focus, Recommendations, and Memory Snapshot only (scrollable)

Desktop: Full dashboard with all widgets visible simultaneously

## 11.5 Business Rules

Dashboard is available to all users (Free and Premium)

Free users see limited widget details (Memory Snapshot shows only 1 topic; Readiness Metrics are hidden)

Premium users see full widget data and can customize widget layout

# Chapter 12: AI Mentor

## 12.1 Overview

The AI Mentor is an intelligent, context-aware conversational companion that understands the learner's complete history. It is not a generic chatbot — it has access to the learner's DLT, roadmap, recommendations, mastery scores, and career goals, allowing it to give highly personalized guidance.

## 12.2 Capabilities

Answer questions about the learner's roadmap and why it is structured the way it is

Explain why specific recommendations are being made

Provide guidance on how to prepare for specific companies

Explain programming concepts in depth with examples

Motivate and re-engage learners who have become inactive

Summarize the learner's recent progress and highlight wins

## 12.3 Sample Interactions


[Table]
| Learner Question | AI Mentor Response Approach |
| What should I study next? | Reads roadmap and DLT — recommends the next unlocked topic with reasoning |
| Why is DP prioritized? | Explains that Arrays and Recursion mastery are high, making DP the logical next step |
| How do I prepare for Google? | Pulls the Google preparation track — recommends specific topics and mock interview types |
| Why did Graph Kingdom unlock? | Explains the mastery thresholds that were met and the Knowledge Graph path followed |
| I haven't practiced in a week | Acknowledges the gap, summarizes what was last done, suggests an easy re-entry task |


## 12.4 Technical Approach

The AI Mentor is powered by an LLM (Large Language Model) with the learner's DLT data injected as context

Each conversation is scoped to the learner — the model is given the learner's full profile summary as a system prompt

Responses are generated in real time

The AI Mentor does not store conversation history beyond the current session (privacy protection)

## 12.5 Business Rules

AI Mentor is a Premium tier feature

Free tier users see a limited version: 3 questions per day maximum

The AI Mentor cannot give medical, legal, or financial advice

Conversations are not reviewed by humans unless flagged for abuse or safety concerns

## 12.6 Edge Cases

If the learner asks about a topic not in the Knowledge Graph, the Mentor responds with general programming guidance and notes the limitation

If the learner expresses frustration or burnout, the Mentor shifts tone to supportive mode and suggests a shorter, easier activity

# Chapter 13: Mock Interview Platform

## 13.1 Overview

SkillForge provides a comprehensive mock interview system with two modes: AI-powered interviews for daily practice, and human-reviewed interviews conducted by verified mentors for serious placement preparation. Both modes provide structured feedback across multiple dimensions.

## 13.2 AI Interviews

### 13.2.1 Use Cases

Daily practice without scheduling overhead

Building confidence before booking a human session

Immediate feedback for quick improvement cycles

### 13.2.2 Workflow

Learner selects interview type (DSA, Coding, Behavioral, HR)

Learner selects difficulty level and target company (optional)

AI generates a problem or question appropriate to the learner's current readiness

Learner responds (typed code, spoken answer, or written explanation depending on type)

AI evaluates the response in real time

Feedback report is generated with scores across all dimensions

Feedback is used to update the learner's DLT (Interview Readiness signal)

### 13.2.3 Interview Types


[Table]
| Type | Format |
| DSA | Algorithmic problem — learner writes code in the in-platform editor |
| Coding | Implementation problem — focus on clean, working code |
| System Design | Open-ended design question — learner provides a written/spoken design |
| Behavioral | STAR-format questions — learner provides structured responses |
| HR | General fit questions — tone, communication, and professionalism evaluated |


## 13.3 Human Interviews

### 13.3.1 Trigger Conditions

Learner manually requests a human session through the Mentor Marketplace

System recommends a human interview when Interview Readiness crosses a defined threshold

Required for some Grand Boss certifications that need human validation

### 13.3.2 Workflow

Learner browses available mentors filtered by expertise, rating, and availability

Learner books a session and pays the session fee

Mentor receives booking notification and confirms

Session occurs via the platform's integrated video/audio interface

Mentor submits a structured feedback report after the session

Report is delivered to the learner and updates their DLT

## 13.4 Feedback Report


[Table]
| Dimension | What is Evaluated |
| Technical Score | Correctness of the solution, edge case handling, algorithmic approach |
| Problem Solving Score | How the learner approached and broke down the problem |
| Communication Score | Clarity of explanation, ability to discuss trade-offs |
| Confidence Score | Inferred from pace, self-corrections, and question-asking behavior |
| Improvement Suggestions | Specific, actionable steps to improve in each dimension |


## 13.5 Business Rules

AI interviews are available unlimited times on Premium tier; 3 per month on Free tier

Human interview pricing is set by the mentor; SkillForge takes a commission

Interview recordings are stored for 30 days; learner can download before expiry

Learner can opt out of recording at any time

# Chapter 14: Career Center

## 14.1 Overview

The Career Center is a comprehensive career-preparation hub that integrates directly with the learner's DLT. Unlike generic resume builders, SkillForge's Career Center knows the learner's skills, projects, coding achievements, and interview readiness — and uses all of this to generate and score career materials.

## 14.2 Resume Builder

### 14.2.1 Data Sources

The Resume Builder automatically pulls from the learner's profile:

Skills derived from Mastery scores (topics with Mastery > 75% are listed as skills)

Projects added by the learner in their profile

Achievements: Boss battle completions, Grand Boss certifications, contest results

Coding profiles: LeetCode solved count, Codeforces rating, GitHub contributions

Certifications earned on SkillForge

Internships and experience manually entered by the learner

### 14.2.2 Resume Templates


[Table]
| Template | Best For |
| ATS-Friendly | Optimized for Applicant Tracking Systems — plain formatting, keyword-rich |
| Product Company Resume | Clean, impact-focused layout for product companies |
| Fresher Resume | Structured for students with no work experience |
| Experienced Resume | Highlights work history and impact metrics |


### 14.2.3 Workflow

Learner opens Resume Builder

Platform pre-fills available data from the learner's profile

Learner reviews and edits each section

Learner selects a template

Resume is generated and displayed

Resume Score Engine analyzes the resume

Improvement suggestions are shown

Learner downloads the final resume as PDF

## 14.3 Resume Score Engine

Every resume is analyzed across six dimensions:


[Table]
| Score | What It Measures |
| Overall Resume Score | Composite score across all dimensions (0–100) |
| ATS Compatibility Score | How well the resume will be parsed by automated screening systems |
| Technical Strength Score | Depth and relevance of technical skills and projects |
| Project Quality Score | Whether projects demonstrate impact, complexity, and real outcomes |
| Profile Completeness Score | Whether all important resume sections are filled |
| Interview Readiness Score | Whether the resume reflects interview-ready skills based on the DLT |


## 14.4 LinkedIn Optimization

### 14.4.1 How It Works

Learners paste or import their LinkedIn profile content into the LinkedIn Optimizer. The system analyzes:

Headline: Is it keyword-optimized and role-specific?

About Section: Does it tell a compelling story and include relevant keywords?

Skills Section: Do listed skills align with the learner's actual mastery and target roles?

Projects and Experience: Are descriptions quantified and impactful?

### 14.4.2 Output

LinkedIn Score (0–100)

Recruiter Visibility Score: Estimated likelihood of appearing in recruiter searches

Improvement Suggestions: Specific rewrites for each section

## 14.5 Career Readiness Engine

Combines all signals — coding performance, interview results, resume quality, assessment scores, and learning progress — to estimate readiness for different company tiers:

Placement Readiness: General campus placement readiness

Product Company Readiness: Mid-tier product companies

Service Company Readiness: TCS, Infosys, Cognizant, Accenture

Startup Readiness: Early-stage startup environment readiness

FAANG Readiness: Google, Meta, Amazon, Apple, Netflix level

## 14.6 Company-Specific Preparation Tracks

Dedicated preparation tracks exist for major companies. Each track includes:

Interview pattern analysis: Types of questions commonly asked

Topic weightage: Which DSA topics are most important for this company

Original practice questions: Platform-created questions inspired by patterns (not copied)

Mock rounds: Simulated interview rounds matching the company's interview structure

Readiness score: Company-specific readiness percentage


[Table]
| Available Company Tracks | Google, Microsoft, Amazon, Meta, Adobe, Atlassian, Uber, Goldman Sachs, | Walmart Global Tech, TCS, Infosys, Accenture, Cognizant |


## 14.7 Business Rules

Resume Builder is available on Free tier (1 template); Premium unlocks all templates

Resume Score Engine is available on Premium tier

LinkedIn Optimizer is available on Premium tier

Career Readiness scores update as the learner's DLT evolves

Company tracks are updated periodically by the admin team based on current interview trends

# Chapter 15: Community & Institutional Platform

## 15.1 Overview

SkillForge supports collective learning through its community and institutional features. Colleges, coding clubs, training institutes, and student communities can create cohorts, run competitions, and track placement readiness across groups of learners.

## 15.2 Supported Entities

Colleges and universities

Coding clubs and societies

Training institutes

Student peer communities

## 15.3 Features


[Table]
| Feature | Description |
| Team Dashboards | Admins and mentors can view aggregated progress for their cohort |
| Cohort Analytics | Placement readiness distribution, mastery heatmaps, activity trends across the cohort |
| Team Quests | Collaborative missions where team members contribute to shared goals |
| Competitions | Internal contests with custom problems and leaderboards |
| Shared Challenges | Problem sets shared across a cohort for synchronized practice |
| Leaderboards | Ranked view of cohort members by mastery, activity, or readiness score |
| Placement Readiness Reports | Exportable reports showing cohort-wide placement readiness for institution administrators |


## 15.4 Community Safety & Moderation

### 15.4.1 Reporting System

Any user can report content or behavior through the Report button on any post, leaderboard entry, competition submission, or user profile. Reportable categories:

Spam or irrelevant content

Harassment or abusive behavior

Fake mentor credentials

Cheating in competitions or assessments

### 15.4.2 Admin Actions

Review flagged reports within 48 hours

Remove offending content

Issue warnings to users

Suspend or permanently ban accounts for serious violations

### 15.4.3 Fair Play Monitoring

Competition submissions are analyzed for suspicious patterns (identical solutions, abnormal speed)

Leaderboard entries from flagged accounts are placed under review

Automated detection of copy-paste in coding submissions

## 15.5 Business Model — Institutional Licensing

Institutions pay a per-seat or cohort-based annual subscription

Includes cohort analytics dashboard, placement readiness reports, and admin access

Institutions can white-label the platform with their branding (enterprise tier)

Dedicated account manager assigned for enterprise institutional clients

# Chapter 16: Privacy, Accessibility & Mobile Strategy

## 16.1 Privacy & Trust

### 16.1.1 Data Visibility Controls


[Table]
| Setting | Who Can See This Data |
| Private (Default) | Only the learner themselves |
| Team Only | Learner + their institution / team admin + assigned mentors |
| Public | All platform users can see the profile summary |


### 16.1.2 Additional Controls

Download My Data: Learners can request a full export of their platform data at any time

Delete My Data: Learners can request complete account and data deletion

Interview Recording Permissions: Learners must explicitly consent before each recorded session

Consent-Based Data Usage: Learner data is never used for advertising or sold to third parties

### 16.1.3 Business Rules

Institutional admins can only see aggregated cohort data, not individual learner data, without explicit learner consent

Data retention policy: Activity logs retained for 2 years; deleted account data purged within 30 days

## 16.2 Accessibility

SkillForge is designed to be accessible to all learners regardless of ability:


[Table]
| Feature | Details |
| Keyboard Navigation | All interactive elements are fully keyboard-accessible |
| Screen Reader Support | ARIA labels on all UI components; tested with NVDA and VoiceOver |
| Focus Indicators | Visible focus rings on all interactive elements |
| Reduced Motion Mode | All animations can be disabled for users with motion sensitivity |
| Adjustable Font Sizes | Text size can be increased up to 200% without layout breakage |
| Color-Blind Friendly | All color-coded elements (heatmaps, mastery bars) include pattern and text labels |


## 16.3 Mobile-First Strategy

### 16.3.1 Mobile-Optimized Features

Learning Games: Touch-optimized drag-and-drop interactions

AI Mentor: Conversational interface works seamlessly on small screens

Daily Recommendations: Designed as a card-swipe interface on mobile

Memory Lab: Simplified heatmap and calendar view for mobile

Quizzes and Mini Bosses: Tap-based answer selection

Progress Tracking: Condensed progress indicators

### 16.3.2 Desktop-Optimized Features

Full code editor for coding practice and Blockly programming

Resume Builder with full template preview

Video interviews with mentor

Advanced analytics dashboards with full chart sets

### 16.3.3 Sync

Progress is synced in real time across mobile and desktop

Offline mode (planned Phase 3): Basic games and quizzes available offline with sync on reconnect

# Chapter 17: Smart Nudge System & Business Model

## 17.1 Smart Nudge & Motivation System

### 17.1.1 Overview

The Smart Nudge System keeps learners consistent through timely, context-aware notifications. Nudges are not generic reminders — they reference the learner's specific situation.

### 17.1.2 Nudge Types


[Table]
| Nudge Type | Example Message |
| Memory Reminder | Graph concepts may need reinforcement this week — retention is at 67% |
| Streak Reminder | You are one session away from a 30-day streak. Keep it going! |
| Interview Nudge | Your Amazon readiness reached 80%. Consider booking a mock interview. |
| Roadmap Nudge | Completing Binary Search unlocks your next Learning World. |
| Inactivity Nudge | You haven't practiced in 4 days. A 15-minute session today keeps your streak alive. |
| Achievement Nudge | You are 2 problems away from your weekly practice goal. |


### 17.1.3 Nudge Delivery Channels

In-app notification (all users)

Push notification via mobile app (if push enabled)

Email digest (weekly summary, opt-in)

### 17.1.4 Business Rules

Maximum 2 nudges per day to avoid notification fatigue

Learners can configure nudge frequency (Off, Low, Normal, High)

Nudge content is never promotional or advertising-related

## 17.2 Business Model

### 17.2.1 Free Tier

Core learning worlds (Variables Kingdom through Array Arena)

All standard interactive games

Basic roadmap (no weekly updates)

Basic dashboard (limited widget data)

3 AI mock interviews per month

1 resume template

Basic coding practice tracking

### 17.2.2 Premium Tier

All learning worlds including secret worlds

Full Memory Lab

AI Mentor (unlimited)

Unlimited AI mock interviews

Full dashboard with all widgets

Advanced analytics and Skill DNA

All resume templates + Resume Score Engine

LinkedIn Optimizer

Company-specific preparation tracks

Forecasting Engine

### 17.2.3 Mentor Marketplace

Pay-per-session human mock interviews

Pay-per-session resume reviews

Pay-per-session career mentoring

Mentors set their own pricing; SkillForge takes a platform commission

### 17.2.4 Institutional Licensing

Annual subscription for colleges, coding clubs, and training institutes

Cohort analytics, placement reports, team dashboards, admin tools

Volume pricing for large cohorts

Enterprise tier: White-labeling, dedicated support, custom integrations

# Chapter 18: Content Creation & Regional Language Expansion

## 18.1 Content Creation Strategy

### 18.1.1 Human-Created Content

Core platform content is created by domain experts and educators:

Learning World structure, lessons, and narrative

Core interactive games and Blockly challenges

Roadmap sequences and prerequisite mappings in the Knowledge Graph

Boss battle problems and assessment question banks

Company-specific interview track designs

Exam blueprints and competition problem sets

### 18.1.2 AI-Generated Content

The platform uses AI to scale content creation for personalization:

Personalized quiz variants for each learner (same concept, different problems)

Practice problem variants at different difficulty levels

Reinforcement tasks for memory review sessions

Adaptive challenges that adjust difficulty based on current performance

Explanations and hints for incorrect answers

### 18.1.3 Quality Control

All AI-generated content is reviewed by admins before being marked as 'verified'

Learners can flag incorrect content — flagged content is reviewed within 48 hours

Content freshness: Interview tracks are reviewed quarterly for relevance

## 18.2 Regional Language Expansion (Phase 2)

### 18.2.1 Planned Languages

Hindi

Telugu

Tamil

Kannada

Malayalam

### 18.2.2 What Gets Translated

Onboarding flow and goal selection

AI Mentor conversations

Explanations and hints

Recommendations and nudge messages

Help content and FAQs

### 18.2.3 What Stays in English

All programming content, code examples, and technical terms

Coding problems and assessment questions

Resume and LinkedIn content

### 18.2.4 Business Rules

Language is selected during onboarding and can be changed at any time in settings

Translation quality is human-reviewed before regional language launch

Programming terminology is kept in English even in translated content (industry standard)

# Chapter 19: Explainability Center

## 19.1 Overview

Transparency is a core principle of SkillForge. Every major AI decision — roadmap changes, world unlocks, recommendation generation, confidence score updates, and focus shifts — can be explained to the learner in plain language. This builds trust and helps learners understand and engage with the platform's intelligence.

## 19.2 Questions Answered

Why was this recommendation generated? — Shows the DLT signal that triggered it

Why did my roadmap change? — Explains which mastery or retention event caused the re-sequencing

Why did this world unlock? — Shows the mastery thresholds that were crossed

Why did my focus shift? — Explains why the Daily Focus today is different from yesterday

Why is my confidence score low? — Identifies which signals are pulling the score down

## 19.3 Explainability UI

Every recommendation card has a 'Why?' button that opens a plain-language explanation

World unlock notifications include a full breakdown of the criteria met

Roadmap changes are announced with a brief explanation message

The Explainability Center is accessible as a dedicated page in the learner's profile

## 19.4 Business Rules

Explainability is available to all users (Free and Premium)

Explanations are generated in real time by the AI layer, not pre-written templates

Learners can ask the AI Mentor to explain any decision in more depth
