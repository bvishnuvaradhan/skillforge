SKILLFORGE

AI Prompt Templates & User Stories

Every LLM prompt and all user stories with acceptance criteria

# Part A: AI Prompt Templates

All LLM calls in SkillForge use structured prompt templates. Variables in {curly_braces} are injected at runtime. All prompts instruct the model to return structured JSON output to ensure consistent parsing.

## A.1 AI Mentor System Prompt

This is the system prompt injected at the start of every AI Mentor conversation. It gives the LLM full context about the learner.


[Table]
| AI Mentor — System Prompt Template | You are SkillForge AI Mentor, a personalized learning companion for a coding student. | Your job is to guide, motivate, and advise based on this learner's exact profile. | Always be specific, encouraging, and honest. Never give generic advice. | === LEARNER PROFILE === | Name: {user_name} | Primary Goal: {primary_goal} | Current Level: {level} (XP: {xp_total}) | Streak: {streak_count} days | === MASTERY SNAPSHOT === | {top_5_topics_with_scores} | Weakest topics: {bottom_3_topics_with_scores} | === CURRENT ROADMAP === | Current step: {current_roadmap_step} | Next 3 steps: {next_3_roadmap_steps} | === MEMORY RISK === | Topics at risk of being forgotten: {at_risk_topics} | === TODAY'S RECOMMENDATIONS === | {top_3_recommendations} | === CAREER READINESS === | Placement Readiness: {placement_readiness}% | FAANG Readiness: {faang_readiness}% | When answering questions about study plans or preparation, always reference the | learner's actual mastery scores and roadmap — not generic advice. | Keep responses concise (under 200 words) unless the learner asks for detail. | Respond in a warm, peer-to-peer tone — like a senior student helping a junior. |


## A.2 AI Mock Interview — DSA Question Generation

Used to generate DSA interview questions appropriate to the learner's current readiness.


[Table]
| DSA Interview — Question Generation Prompt | You are a technical interviewer at a top tech company. | Generate ONE DSA interview question for a candidate with the following profile: | Candidate Mastery: |   Strong topics: {strong_topics} |   Weak topics: {weak_topics} |   Target company: {target_company} |   Difficulty requested: {difficulty} | Requirements: | - The question should test {primary_topic} concepts | - Difficulty: {difficulty} (easy/medium/hard) | - Do NOT ask about {weak_topics} — candidate is not ready for those | - Include a realistic problem scenario | Return ONLY valid JSON in this exact format (no markdown, no preamble): | { |   "title": "Problem title", |   "description": "Full problem statement", |   "examples": [{ "input": "...", "output": "...", "explanation": "..." }], |   "constraints": ["constraint 1", "constraint 2"], |   "topics": ["array", "two-pointer"], |   "hints": ["hint 1 (vague)", "hint 2 (more specific)"], |   "optimal_approach": "Brief description of optimal solution", |   "time_complexity": "O(n)", |   "space_complexity": "O(1)" | } |


## A.3 AI Mock Interview — Answer Evaluation

Used to evaluate a candidate's response during an AI interview session.


[Table]
| Interview Answer Evaluation Prompt | You are a senior software engineer evaluating a coding interview response. | Question: | {question_text} | Candidate's Response: | {candidate_response} | Candidate's Code (if provided): | {candidate_code} | Evaluate across these dimensions (score each 0.0 to 1.0): | 1. technical_correctness: Is the solution correct? Does it handle edge cases? | 2. approach_quality: Is the approach optimal or reasonable? | 3. code_quality: Is the code clean, readable, well-structured? | 4. communication: Did they explain their thinking clearly? | 5. problem_decomposition: Did they break down the problem logically? | Return ONLY valid JSON: | { |   "scores": { |     "technical_correctness": 0.8, |     "approach_quality": 0.7, |     "code_quality": 0.9, |     "communication": 0.6, |     "problem_decomposition": 0.75 |   }, |   "overall_score": 0.75, |   "strengths": ["Identified optimal approach quickly", "Clean code structure"], |   "improvements": ["Did not handle null input case", "Could explain time complexity better"], |   "next_question": "follow_up" or "new_question" or "end_session", |   "follow_up_question": "If you needed O(1) space, how would you change your approach?" | } |


## A.4 Behavioral Interview — Question Generation


[Table]
| Behavioral Interview — Question Generation Prompt | You are an experienced HR interviewer. | Generate ONE behavioral interview question for a software engineering candidate. | Target company: {target_company} | Interview stage: {interview_stage} (e.g. HR round, hiring manager round) | Topics to explore: {behavioral_topics} (e.g. teamwork, conflict resolution, leadership) | Requirements: | - Use STAR format (Situation, Task, Action, Result) | - Make it realistic for a fresher/junior developer | - Do not repeat previous questions: {previous_questions} | Return ONLY valid JSON: | { |   "question": "Tell me about a time when...", |   "competency": "teamwork", |   "what_we_evaluate": "Ability to collaborate under pressure", |   "ideal_answer_structure": "Situation: ... Task: ... Action: ... Result: ..." | } |


## A.5 Behavioral Answer Evaluation


[Table]
| Behavioral Answer Evaluation Prompt | You are an experienced HR evaluator. | Question asked: {question} | Candidate's answer: {answer} | Evaluate: | 1. star_structure: Did they use Situation/Task/Action/Result? (0.0–1.0) | 2. relevance: Was the story relevant to the question? (0.0–1.0) | 3. communication: Was the answer clear and well-articulated? (0.0–1.0) | 4. confidence: Did they sound confident and composed? (0.0–1.0) | 5. impact: Did the outcome demonstrate positive impact? (0.0–1.0) | Return ONLY valid JSON: | { |   "scores": { "star_structure": 0.7, "relevance": 0.9, "communication": 0.8, "confidence": 0.6, "impact": 0.75 }, |   "overall_score": 0.75, |   "strengths": ["..."], |   "improvements": ["..."], |   "suggested_improvement": "Try to quantify your result with specific metrics" | } |


## A.6 Adaptive Quiz Generation

Used to generate personalized quiz questions for practice and memory reinforcement.


[Table]
| Quiz Generation Prompt | You are a computer science educator creating practice questions. | Topic: {topic_name} | Subtopics to cover: {subtopics} | Difficulty: {difficulty} (easy/medium/hard) | Question type: {question_type} (mcq/code_trace/short_answer) | Number of questions: {count} | Avoid these recently used question patterns: {recent_patterns} | Return ONLY valid JSON array (no markdown): | [ |   { |     "id": "q1", |     "text": "Question text here", |     "type": "mcq", |     "options": ["A", "B", "C", "D"], |     "correct_answer": "B", |     "explanation": "Why B is correct...", |     "topic_id": "bfs", |     "difficulty": "medium" |   } | ] |


## A.7 Resume Scoring Prompt

Used to analyze a resume and generate improvement suggestions.


[Table]
| Resume Scoring Prompt | You are an expert technical recruiter and resume reviewer. | Analyze this resume for a software engineering candidate: | {resume_text} | Candidate's target role: {target_role} | Candidate's experience level: {experience_level} (fresher/junior/mid) | Score each dimension 0–100: | 1. ats_score: ATS keyword optimization and formatting | 2. technical_score: Depth and relevance of technical skills | 3. project_score: Quality and impact of described projects | 4. completeness_score: All important sections present and filled | 5. interview_readiness: Overall readiness to get interview calls | Return ONLY valid JSON: | { |   "overall_score": 78, |   "ats_score": 82, |   "technical_score": 74, |   "project_score": 71, |   "completeness_score": 85, |   "interview_readiness": 76, |   "suggestions": [ |     { "section": "Projects", "issue": "No quantified impact", "fix": "Add metrics: e.g. reduced load time by 40%" }, |     { "section": "Skills", "issue": "Missing DSA section", "fix": "Add LeetCode rating and solved count" } |   ] | } |


## A.8 AI Explainability — Recommendation Explanation


[Table]
| Explainability Prompt | You are the SkillForge AI system explaining a recommendation to a learner. | Learner context: |   Name: {user_name} |   Relevant mastery score: {topic} is at {score}% |   Last practiced {topic}: {days_ago} days ago |   Current goal: {primary_goal} | Recommendation to explain: |   Type: {recommendation_type} |   Action: {recommendation_title} | Write a SHORT, SPECIFIC explanation (2–3 sentences max) of why this | recommendation was generated. Be specific — use actual numbers and topic names. | Write in second person (You). Warm and encouraging tone. | Return ONLY valid JSON: | { |   "title": "Why this recommendation?", |   "explanation": "Your BFS mastery dropped to 64% since you last practiced it 8 days ago...", |   "evidence": ["BFS score: 64%", "Last reviewed: 8 days ago", "Roadmap next step: Graph Kingdom"] | } |


# Part B: User Stories & Acceptance Criteria

User stories follow the standard format. Each story has testable acceptance criteria that serve as the definition of 'done' for that feature.

## B.1 Authentication & Onboarding Stories


[Table]
| US-001 | As a new user | I want to create an account with my email | So that I can access the platform and start learning | Acceptance Criteria: | Given I am on /signup, when I submit a valid name, email, and password, then I receive a JWT and am redirected to /onboarding | When I submit an email that already exists, then I see a '409 Email already registered' error message | When I submit a password shorter than 8 characters, then I see a validation error before form submission | I can also sign up with Google or GitHub OAuth — clicking either button redirects to the provider and creates my account on callback |



[Table]
| US-002 | As a new student | I want to complete the onboarding assessment | So that I get a personalized roadmap matching my current skill level | Acceptance Criteria: | Given I completed goal selection and optionally linked coding profiles, I am shown a 15-question adaptive assessment | When I complete the assessment, I see a loading screen while my Digital Learning Twin is generated | After generation, I see my initial mastery scores for at least 5 topics | I am shown my first unlocked Learning World and my personalized roadmap | If I skip the assessment, my DLT starts at zero and roadmap begins from Variables Kingdom |


## B.2 Learning World Stories


[Table]
| US-010 | As a student | I want to see my world progress on the world map | So that I know exactly where I am and what to unlock next | Acceptance Criteria: | Given I am on /worlds, I see all worlds displayed as a connected map | Completed worlds show a green border and completion badge | In-progress worlds show a cyan glowing border with a % completion ring | Locked worlds show a desaturated appearance with a lock icon | When I hover over a locked world, I see the specific mastery thresholds I need to meet | Secret worlds are not visible until unlocked — they reveal with an animation on discovery |



[Table]
| US-011 | As a student | I want to complete a learning game | So that my mastery score for that topic updates | Acceptance Criteria: | Given I am in a Learning World, when I open a game and complete it successfully, my score is submitted | My mastery score for all related topics updates within 30 seconds of submission | I see a feedback screen showing: score, XP earned, hints used, and 1 improvement tip | If I already have a higher score for this game, my mastery is not reduced | A replay button is always available — replaying never reduces my best score |



[Table]
| US-012 | As a student | I want to fight a World Boss | So that I can prove my mastery and earn a badge | Acceptance Criteria: | Given I completed all lessons and games in a world, the World Boss is unlocked | During the boss battle, I see my health bar and the boss health bar at opposite ends of the screen | Each correct answer reduces boss health; each wrong answer reduces my health | When I score above 80%, I pass — I see a victory animation and receive a badge | When I score below 80%, I see a detailed breakdown of which topics I failed on | After failing, I cannot retry for 24 hours — a cooldown timer is displayed |


## B.3 Memory Intelligence Stories


[Table]
| US-020 | As a student | I want to see which topics I'm about to forget | So that I can review before forgetting happens rather than after | Acceptance Criteria: | Given I am on /memory, I see a Memory Health Score as a large circular gauge | I see a retention heatmap showing all my learned topics color-coded by retention level | Topics with retention below 70% are marked with a warning indicator | I see a Reinforcement Calendar showing when each topic needs review | Clicking 'Quick Review' on any topic opens a 5-question flash review session | This feature requires Premium — Free users see a preview with an upgrade prompt |



[Table]
| US-021 | As a student | I want to receive memory nudge notifications | So that I am reminded to review topics before I forget them | Acceptance Criteria: | When a topic's predicted retention drops below 70%, I receive an in-app notification | The notification is specific: 'Your BFS retention is at 67% — review recommended' | I receive maximum 2 nudges per day — no notification spam | I can configure nudge frequency in Settings (Off / Low / Normal / High) | If I am not logged in, the nudge is queued and shown on next login |


## B.4 Recommendation & Roadmap Stories


[Table]
| US-030 | As a student | I want to see personalized recommendations on my dashboard | So that I always know the most valuable next action to take | Acceptance Criteria: | Given I am on /dashboard, I see 3–5 active recommendations in the Recommendations widget | Each recommendation shows: title, type, why it was generated, impact level, and estimated effort | Clicking 'Why?' on any recommendation opens a 2–3 sentence explanation from the AI | I can dismiss or snooze (1, 3, or 7 days) any recommendation | Recommendations refresh after every learning activity I complete |



[Table]
| US-031 | As a student | I want to view my personalized roadmap | So that I have a clear structured path toward my goal | Acceptance Criteria: | Given I am on /roadmap, I see a visual timeline of topics from my current state to my goal | Completed topics show a checkmark; current topic is highlighted; locked topics are greyed | Each step shows: topic name, estimated days to complete, mastery threshold required | If I change my goal, the roadmap recalculates within 10 seconds | The roadmap automatically updates when I complete a boss battle or mastery score changes significantly |


## B.5 Interview Stories


[Table]
| US-040 | As a student | I want to start an AI mock interview instantly | So that I can practice whenever I want without booking | Acceptance Criteria: | Given I am on /interviews, when I click 'Start AI Interview', I choose type and difficulty | The AI generates an appropriate question within 5 seconds | I can write and run code in the embedded editor | When I submit, the AI evaluates my solution and gives feedback within 10 seconds | I receive scores across: Technical, Problem Solving, Communication, Confidence | Free tier users can do 3 AI interviews per month; Premium users have unlimited access |



[Table]
| US-041 | As a student | I want to book a human mock interview | So that I can get real feedback from an experienced mentor | Acceptance Criteria: | Given I am on /interviews/mentors, I see verified mentor cards with ratings and availability | I can filter mentors by expertise, rating, and price | When I select a slot and confirm payment, I receive a booking confirmation | The mentor receives a notification and can accept or decline within 24 hours | If declined, I receive a full refund automatically | I receive a reminder notification 30 minutes before the session |


## B.6 Career Stories


[Table]
| US-050 | As a student | I want to build my resume on the platform | So that I get a professional resume that reflects my actual skills | Acceptance Criteria: | Given I open the Resume Builder, my skills (mastery > 75%), achievements, and coding stats are pre-filled | I can select from 4 templates (ATS / Product / Fresher / Experienced) | I see a live preview panel that updates as I edit | When I click 'Score My Resume', I receive scores across 6 dimensions within 15 seconds | I receive specific, actionable improvement suggestions for each low-scoring section | I can download my resume as a PDF at any time |



[Table]
| US-051 | As a student | I want to see my career readiness for specific companies | So that I know how close I am to being interview-ready | Acceptance Criteria: | Given I am on /career, I see readiness percentages for: Placement, Product, Service, Startup, FAANG | Each readiness score updates as my mastery, interview results, and resume improve | Clicking any company card opens the dedicated company preparation track | The system tells me which specific topics I need to improve to raise my readiness score |


## B.7 Mentor Stories


[Table]
| US-060 | As a mentor | I want to manage my availability calendar | So that students can only book me during times I am available | Acceptance Criteria: | Given I am on /mentor/availability, I see a weekly calendar grid (Mon–Sun, hourly slots) | I can toggle individual hour slots on/off by clicking them | I can block entire days using the 'Block Date' option | Changes save immediately — students cannot book blocked slots | I can set a buffer time (15–60 min) between sessions so I am not double-booked |



[Table]
| US-061 | As a mentor | I want to submit detailed feedback after a session | So that the student gets actionable improvement guidance | Acceptance Criteria: | Given a session is marked complete, I see a feedback form for that student | I score 4 dimensions: Technical, Problem Solving, Communication, Confidence (each 0–10) | I write free-text for: Strengths, Improvements, Next Steps | I select an overall recommendation: Ready / Needs More Prep / Strong Candidate | After I submit, the student immediately receives the feedback report | I cannot edit my feedback after submission |


## B.8 Admin Stories


[Table]
| US-070 | As a admin | I want to approve or reject mentor applications | So that only qualified mentors can conduct sessions on the platform | Acceptance Criteria: | Given I am on /admin/mentors/pending, I see all pending applications in a queue | Each application shows: bio, expertise tags, linked coding profiles, submitted documents | I can approve with one click — the mentor immediately receives a Verified badge | I can reject with a mandatory reason — the applicant receives an email with the reason | Approved mentors appear in the student-facing mentor marketplace within 1 hour |



[Table]
| US-071 | As a admin | I want to resolve community reports | So that harmful behavior is addressed quickly | Acceptance Criteria: | Given I am on /admin/moderation, I see all open reports sorted by severity | Each report shows: category, reporter, reported user, description, and any evidence | I can take one of 4 actions: Dismiss, Warn, Suspend (with duration), Permanent Ban | All actions are logged in audit_logs with my admin ID | If I suspend a user, they receive an email with the reason and duration | Dismissed reports are archived and not shown in the active queue |


## B.9 Accessibility Stories


[Table]
| US-080 | As a student using a screen reader | I want to navigate the entire platform without a mouse | So that I have equal access to all learning features | Acceptance Criteria: | All interactive elements have descriptive ARIA labels | Games have text-based alternatives for all visual puzzle elements | Charts and heatmaps have text descriptions (e.g. 'BFS retention: 64%, at risk') | Focus order follows logical reading order on all pages | No content is accessible only via hover — all hover content is also keyboard accessible |



[Table]
| US-081 | As a student with motion sensitivity | I want to disable all animations | So that I can use the platform without visual discomfort | Acceptance Criteria: | When I enable Reduced Motion in Settings (or it is enabled at OS level), all animations stop | Transitions become instant state changes instead of animated movements | Boss battle health bars update instantly instead of draining with animation | The world unlock celebration shows a static badge instead of a particle burst | This setting persists across sessions |

