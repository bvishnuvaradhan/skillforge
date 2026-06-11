SKILLFORGE

API Specification

Every endpoint — method, path, auth, request, response, and error codes

# Chapter 1: API Conventions

## 1.1 Base URL

Production:   https://api.skillforge.app/v1

Development:  http://localhost:3001/v1

## 1.2 Authentication

All protected endpoints require a Bearer JWT token in the Authorization header.

Authorization: Bearer <jwt_token>

Auth levels used throughout this document:

Public — No auth required

Student — Valid JWT with role: student

Mentor — Valid JWT with role: mentor

Admin — Valid JWT with role: admin

Any — Valid JWT, any role

## 1.3 Standard Response Envelope

{

  "success": true,

  "data": { ... },

  "meta": { "page": 1, "total": 100 }

}

## 1.4 Standard Error Response

{

  "success": false,

  "error": {

    "code": "UNAUTHORIZED",

    "message": "Invalid or expired token",

    "details": {}

  }

}

## 1.5 Common Error Codes


[Table]
| HTTP | Code | Meaning |
| 400 | VALIDATION_ERROR | Request body failed validation |
| 401 | UNAUTHORIZED | Missing or invalid JWT token |
| 403 | FORBIDDEN | Valid token but insufficient role/permission |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | Duplicate resource e.g. email already registered |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server error |


# Chapter 2: Auth Endpoints


[Table]
| POST /auth/register | Auth: Public | Register a new student or mentor account | Request Body: | { "name": "string", "email": "string", "password": "string", "role": "student|mentor" } | Response (200): | { "user": { "id": "uuid", "name": "...", "role": "...", "plan": "free" }, "token": "jwt" } | Error Codes: | 400 VALIDATION_ERROR — missing fields or weak password | 409 CONFLICT — email already registered |



[Table]
| POST /auth/login | Auth: Public | Login with email and password | Request Body: | { "email": "string", "password": "string" } | Response (200): | { "user": { "id": "uuid", "name": "...", "role": "...", "plan": "..." }, "token": "jwt" } | Error Codes: | 400 VALIDATION_ERROR | 401 UNAUTHORIZED — wrong password | 404 NOT_FOUND — email not found |



[Table]
| POST /auth/logout | Auth: Any | Invalidate the current session token | Response (200): | { "message": "Logged out successfully" } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| POST /auth/refresh | Auth: Any | Refresh JWT token before expiry | Request Body: | { "token": "string" } | Response (200): | { "token": "new_jwt_token" } | Error Codes: | 401 UNAUTHORIZED — token expired or invalid |



[Table]
| POST /auth/forgot-password | Auth: Public | Send password reset email | Request Body: | { "email": "string" } | Response (200): | { "message": "Reset email sent if account exists" } | Error Codes: | 400 VALIDATION_ERROR |



[Table]
| POST /auth/reset-password | Auth: Public | Reset password with token from email | Request Body: | { "reset_token": "string", "new_password": "string" } | Response (200): | { "message": "Password reset successfully" } | Error Codes: | 400 VALIDATION_ERROR | 401 UNAUTHORIZED — invalid or expired token |



[Table]
| GET /auth/oauth/:provider | Auth: Public | Initiate OAuth login (Google/GitHub) | Response (200): | Redirects to OAuth provider consent screen |



[Table]
| GET /auth/oauth/:provider/callback | Auth: Public | OAuth callback — returns JWT | Response (200): | { "token": "jwt", "user": { ... }, "is_new_user": true } | Error Codes: | 400 — OAuth error or cancelled |


# Chapter 3: User & Profile Endpoints


[Table]
| GET /users/me | Auth: Any | Get current authenticated user's profile | Response (200): | { "user": { "id", "name", "email", "role", "plan", "streak_count", "onboarding_complete", ... } } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| PATCH /users/me | Auth: Any | Update current user's profile | Request Body: | { "name"?: "string", "avatar_url"?: "string", "privacy_setting"?: "private|team|public" } | Response (200): | { "user": { updated user object } } | Error Codes: | 400 VALIDATION_ERROR | 401 UNAUTHORIZED |



[Table]
| DELETE /users/me | Auth: Any | Request account deletion (soft delete) | Response (200): | { "message": "Account scheduled for deletion in 30 days" } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /users/me/data-export | Auth: Any | Request full data export (async) | Response (200): | { "message": "Export will be emailed to you within 24 hours" } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /users/:id/profile | Auth: Any | Get public profile of another user | Response (200): | { "profile": { "id", "name", "avatar_url", "badges", "strengths", "activity_calendar" } } | Error Codes: | 403 FORBIDDEN — profile is private | 404 NOT_FOUND |



[Table]
| POST /users/me/coding-profiles | Auth: Student | Link an external coding profile | Request Body: | { "platform": "leetcode|codeforces|codechef|github", "username": "string" } | Response (200): | { "coding_profile": { "id", "platform", "username", "solved_count", "rating" } } | Error Codes: | 400 VALIDATION_ERROR | 409 CONFLICT — platform already linked |



[Table]
| DELETE /users/me/coding-profiles/:platform | Auth: Student | Unlink a coding profile | Response (200): | { "message": "Profile unlinked" } | Error Codes: | 401 UNAUTHORIZED | 404 NOT_FOUND |


# Chapter 4: Onboarding Endpoints


[Table]
| POST /onboarding/goal | Auth: Student | Set primary learning goal | Request Body: | { "goal": "placements|competitive|dsa|interviews" } | Response (200): | { "message": "Goal saved" } | Error Codes: | 400 VALIDATION_ERROR | 401 UNAUTHORIZED |



[Table]
| POST /onboarding/assessment | Auth: Student | Submit adaptive assessment answers | Request Body: | { "answers": [{ "question_id": "string", "answer": "string" }] } | Response (200): | { "results": { "topic_scores": { "arrays": 0.7, "trees": 0.3 } }, "message": "Assessment complete" } | Error Codes: | 400 VALIDATION_ERROR |



[Table]
| POST /onboarding/complete | Auth: Student | Finalize onboarding — generates DLT and roadmap | Response (200): | { "dlt": { "overall_mastery": 0.35, "worlds_unlocked": ["variables-kingdom"] }, "roadmap": { "steps": [...] } } | Error Codes: | 400 — Assessment not completed first |


# Chapter 5: Learning World Endpoints


[Table]
| GET /worlds | Auth: Student | Get all worlds with user's progress | Response (200): | { "worlds": [{ "id", "name", "slug", "status", "user_progress": { "status", "percent_complete" } }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /worlds/:slug | Auth: Student | Get full world detail with content and progress | Response (200): | { "world": { "id", "name", "description", "lessons": [...], "games": [...], "boss_battles": [...], "user_progress": { ... } } } | Error Codes: | 403 FORBIDDEN — world is locked | 404 NOT_FOUND |



[Table]
| GET /worlds/:slug/lessons/:lessonId | Auth: Student | Get a specific lesson | Response (200): | { "lesson": { "id", "title", "content", "order_index", "is_completed" } } | Error Codes: | 403 FORBIDDEN | 404 NOT_FOUND |



[Table]
| POST /worlds/:slug/lessons/:lessonId/complete | Auth: Student | Mark a lesson as completed | Response (200): | { "message": "Lesson completed", "xp_earned": 20, "next_lesson_id": "uuid" } | Error Codes: | 401 UNAUTHORIZED | 404 NOT_FOUND |



[Table]
| GET /worlds/:slug/games/:gameId | Auth: Student | Get game config and user best score | Response (200): | { "game": { "id", "name", "game_type", "config": {...}, "user_best_score": 0.85, "attempts": 3 } } | Error Codes: | 403 FORBIDDEN — game is premium | 404 NOT_FOUND |



[Table]
| POST /worlds/:slug/games/:gameId/attempt | Auth: Student | Submit a game attempt | Request Body: | { "score": 0.9, "hints_used": 1, "time_seconds": 120, "answers": {...} } | Response (200): | { "result": { "passed": true, "score": 0.9, "xp_earned": 45, "mastery_update": { "topic": "bfs", "new_score": 0.78 } } } | Error Codes: | 400 VALIDATION_ERROR | 403 FORBIDDEN |



[Table]
| GET /worlds/:slug/boss/:level | Auth: Student | Get boss battle details | Response (200): | { "boss": { "id", "name", "level", "questions": [...], "user_best_score": null, "attempts": 0 } } | Error Codes: | 403 FORBIDDEN — prerequisites not met | 404 NOT_FOUND |



[Table]
| POST /worlds/:slug/boss/:level/attempt | Auth: Student | Submit a boss battle attempt | Request Body: | { "answers": [{ "question_id": "string", "answer": "string" }], "time_seconds": 300 } | Response (200): | { "result": { "passed": true, "score": 0.85, "xp_earned": 300, "badge_earned": { "id", "name" } } } | Error Codes: | 400 VALIDATION_ERROR | 429 — cooldown active, try again later |


# Chapter 6: Digital Learning Twin & Intelligence


[Table]
| GET /dlt/me | Auth: Student | Get current Digital Learning Twin state | Response (200): | { "dlt": { "overall_mastery": 0.65, "overall_retention": 0.72, "learning_style": "game_based", "consistency_score": 0.8, "career_readiness": { "placements": 0.55, "faang": 0.3 }, "xp_total": 4200, "level": 12 } } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /mastery | Auth: Student | Get mastery scores for all topics | Response (200): | { "mastery": [{ "topic_id": "bfs", "score": 0.78, "last_activity_at": "..." }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /retention | Auth: Student | Get retention scores for all known topics | Response (200): | { "retention": [{ "topic_id": "arrays", "retention": 0.64, "risk_level": "medium", "next_review_at": "..." }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /recommendations | Auth: Student | Get current active recommendations | Response (200): | { "recommendations": [{ "id", "type", "title", "description", "why", "impact", "effort_minutes", "confidence", "action_url" }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| PATCH /recommendations/:id | Auth: Student | Dismiss or snooze a recommendation | Request Body: | { "action": "dismiss|snooze", "snooze_days"?: 1 } | Response (200): | { "message": "Recommendation updated" } | Error Codes: | 400 VALIDATION_ERROR | 404 NOT_FOUND |



[Table]
| GET /roadmap | Auth: Student | Get current personalized roadmap | Response (200): | { "roadmap": { "goal": "placements", "steps": [{ "topic_id", "title", "status", "estimated_days", "mastery_required" }], "current_step_index": 5 } } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| PATCH /roadmap/goal | Auth: Student | Change roadmap goal — triggers recalculation | Request Body: | { "goal": "placements|competitive|dsa|interviews" } | Response (200): | { "roadmap": { updated roadmap } } | Error Codes: | 400 VALIDATION_ERROR |



[Table]
| GET /skill-dna | Auth: Student | Get Skill DNA profile (Premium) | Response (200): | { "dna": { "learning_style", "consistency_pattern", "exploration_behavior", "strengths": [], "weaknesses": [], "growth_opportunities": [] } } | Error Codes: | 402 PAYMENT_REQUIRED — Premium feature | 401 UNAUTHORIZED |



[Table]
| GET /forecasts | Auth: Student | Get forecasting engine predictions (Premium) | Response (200): | { "forecasts": [{ "type", "topic_id", "predicted_value", "predicted_at_date", "confidence" }] } | Error Codes: | 402 PAYMENT_REQUIRED | 401 UNAUTHORIZED |



[Table]
| GET /memory/lab | Auth: Student | Get Memory Lab data (Premium) | Response (200): | { "memory_health_score": 74, "risk_areas": [{ "topic_id", "retention", "days_until_critical" }], "review_suggestions": [...] } | Error Codes: | 402 PAYMENT_REQUIRED | 401 UNAUTHORIZED |



[Table]
| GET /explain/:type/:id | Auth: Student | Get AI explanation for a decision | Response (200): | { "explanation": { "title": "Why this recommendation?", "body": "...", "evidence": ["..."] } } | Error Codes: | 400 — invalid type | 404 NOT_FOUND |


# Chapter 7: AI Mentor Endpoints


[Table]
| POST /mentor-ai/chat | Auth: Student | Send a message to the AI Mentor | Request Body: | { "message": "string", "session_id"?: "string" } | Response (200): | { "reply": "string", "session_id": "uuid" } | Error Codes: | 402 PAYMENT_REQUIRED — Free tier limit exceeded | 401 UNAUTHORIZED |



[Table]
| GET /mentor-ai/usage | Auth: Student | Get AI Mentor daily usage count | Response (200): | { "messages_today": 2, "limit": 3, "is_premium": false } | Error Codes: | 401 UNAUTHORIZED |


# Chapter 8: Interview Endpoints


[Table]
| POST /interviews/ai/start | Auth: Student | Start an AI mock interview session | Request Body: | { "interview_type": "dsa|coding|behavioral|system_design|hr", "difficulty"?: "easy|medium|hard", "target_company"?: "string" } | Response (200): | { "session": { "id", "type": "ai", "interview_type", "status": "in_progress", "first_question": "..." } } | Error Codes: | 402 PAYMENT_REQUIRED — monthly limit exceeded |



[Table]
| POST /interviews/:sessionId/message | Auth: Student | Send answer or message in AI interview | Request Body: | { "message": "string" } | Response (200): | { "response": "string", "is_complete": false } | Error Codes: | 404 NOT_FOUND | 400 — session already complete |



[Table]
| POST /interviews/:sessionId/complete | Auth: Student | End an AI interview session | Response (200): | { "feedback": { "technical_score", "problem_solving_score", "communication_score", "confidence_score", "overall_score", "strengths", "improvements", "next_steps" } } | Error Codes: | 404 NOT_FOUND |



[Table]
| GET /interviews/mentors | Auth: Student | List available mentors for booking | Response (200): | { "mentors": [{ "id", "name", "headline", "expertise", "rating_average", "session_price", "availability_slots": [...] }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| POST /interviews/book | Auth: Student | Book a human mentor interview | Request Body: | { "mentor_id": "uuid", "interview_type": "string", "slot_datetime": "ISO8601", "recording_consent": true } | Response (200): | { "session": { "id", "mentor_id", "scheduled_at", "status": "scheduled", "price_paid": 799 } } | Error Codes: | 400 VALIDATION_ERROR | 409 CONFLICT — slot no longer available | 402 PAYMENT_REQUIRED |



[Table]
| GET /interviews | Auth: Student | List all interview sessions for current user | Response (200): | { "sessions": [{ "id", "type", "interview_type", "status", "scheduled_at", "overall_score" }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /interviews/:sessionId/feedback | Auth: Student | Get feedback for a completed session | Response (200): | { "feedback": { full feedback object } } | Error Codes: | 403 FORBIDDEN — not your session | 404 NOT_FOUND |


# Chapter 9: Career Endpoints


[Table]
| GET /career/readiness | Auth: Student | Get career readiness scores | Response (200): | { "readiness": { "placement": 0.55, "product": 0.42, "service": 0.71, "startup": 0.60, "faang": 0.31 } } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /resumes | Auth: Student | List all resumes | Response (200): | { "resumes": [{ "id", "name", "template", "updated_at", "resume_score" }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| POST /resumes | Auth: Student | Create a new resume | Request Body: | { "name"?: "string", "template": "ats|product|fresher|experienced" } | Response (200): | { "resume": { "id", "name", "template", "content": {} } } | Error Codes: | 402 PAYMENT_REQUIRED — Free tier template limit |



[Table]
| PATCH /resumes/:id | Auth: Student | Update resume content | Request Body: | { "content": { full resume JSON structure } } | Response (200): | { "resume": { updated resume } } | Error Codes: | 404 NOT_FOUND | 403 FORBIDDEN |



[Table]
| POST /resumes/:id/score | Auth: Student | Trigger resume scoring (Premium) | Response (200): | { "scores": { "overall": 78, "ats": 82, "technical": 74, "project": 71, "completeness": 90, "interview_readiness": 69 }, "suggestions": [...] } | Error Codes: | 402 PAYMENT_REQUIRED | 404 NOT_FOUND |



[Table]
| GET /resumes/:id/download | Auth: Student | Download resume as PDF | Response (200): | Binary PDF file stream | Error Codes: | 404 NOT_FOUND | 403 FORBIDDEN |



[Table]
| POST /career/linkedin/analyze | Auth: Student | Analyze LinkedIn profile (Premium) | Request Body: | { "profile_text": "string" } | Response (200): | { "linkedin_score": 67, "recruiter_visibility": 72, "suggestions": { "headline": "...", "about": "...", "skills": "..." } } | Error Codes: | 402 PAYMENT_REQUIRED | 400 — profile text too short |



[Table]
| GET /exams | Auth: Student | List available mock exams | Response (200): | { "exams": [{ "id", "title", "type", "duration_minutes", "question_count", "difficulty", "last_score" }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| POST /exams/:id/start | Auth: Student | Start an exam attempt | Response (200): | { "attempt": { "id", "exam_id", "questions": [...], "started_at", "time_limit_seconds" } } | Error Codes: | 409 CONFLICT — attempt already in progress |



[Table]
| POST /exams/attempts/:attemptId/submit | Auth: Student | Submit a completed exam | Request Body: | { "answers": [{ "question_id": "string", "answer": "string" }] } | Response (200): | { "result": { "score": 0.82, "passed": true, "topic_scores": {...}, "feedback": "..." } } | Error Codes: | 400 — time expired | 404 NOT_FOUND |


# Chapter 10: Community Endpoints


[Table]
| GET /community/leaderboard | Auth: Any | Get leaderboard rankings | Response (200): | { "leaderboard": [{ "rank": 1, "user_id", "name", "avatar_url", "score", "change" }], "my_rank": 47 } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| GET /teams/me | Auth: Student | Get current user's team | Response (200): | { "team": { "id", "name", "members": [...], "rank", "xp_total" } } | Error Codes: | 404 NOT_FOUND — not in a team |



[Table]
| POST /teams | Auth: Student | Create a new team | Request Body: | { "name": "string" } | Response (200): | { "team": { "id", "name", "invite_code", "created_by" } } | Error Codes: | 400 VALIDATION_ERROR |



[Table]
| POST /teams/join | Auth: Student | Join a team by invite code | Request Body: | { "invite_code": "string" } | Response (200): | { "team": { "id", "name", "members": [...] } } | Error Codes: | 404 NOT_FOUND — invalid code | 409 CONFLICT — already in a team |



[Table]
| POST /reports | Auth: Any | Submit a community report | Request Body: | { "reported_user_id"?: "uuid", "category": "spam|harassment|fake_mentor|cheating|other", "description": "string" } | Response (200): | { "report": { "id", "status": "open" } } | Error Codes: | 400 VALIDATION_ERROR |


# Chapter 11: Mentor Role Endpoints


[Table]
| GET /mentor/dashboard | Auth: Mentor | Get mentor dashboard summary | Response (200): | { "upcoming_sessions": [...], "pending_reviews": [...], "earnings_month": 12500, "rating_average": 4.7 } | Error Codes: | 401 UNAUTHORIZED | 403 FORBIDDEN |



[Table]
| GET /mentor/sessions | Auth: Mentor | List all mentor sessions | Response (200): | { "sessions": [{ "id", "student_id", "student_name", "interview_type", "status", "scheduled_at" }] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| PATCH /mentor/sessions/:id/accept | Auth: Mentor | Accept a pending booking request | Response (200): | { "session": { "id", "status": "scheduled" } } | Error Codes: | 404 NOT_FOUND | 400 — session not in pending state |



[Table]
| PATCH /mentor/sessions/:id/cancel | Auth: Mentor | Cancel a scheduled session | Request Body: | { "reason": "string" } | Response (200): | { "message": "Session cancelled", "refund_processed": true } | Error Codes: | 404 NOT_FOUND | 400 — cancellation policy violation |



[Table]
| POST /mentor/feedback/:sessionId | Auth: Mentor | Submit post-session feedback | Request Body: | { "technical_score": 7.5, "problem_solving_score": 8, "communication_score": 7, "confidence_score": 6.5, "strengths": "string", "improvements": "string", "next_steps": "string", "recommendation": "ready|needs_prep|strong_candidate" } | Response (200): | { "feedback": { submitted feedback } } | Error Codes: | 400 VALIDATION_ERROR | 409 — feedback already submitted |



[Table]
| GET /mentor/earnings | Auth: Mentor | Get earnings summary and history | Response (200): | { "total_earned": 45000, "this_month": 8500, "pending_payout": 3200, "sessions": [...] } | Error Codes: | 401 UNAUTHORIZED |



[Table]
| PATCH /mentor/profile | Auth: Mentor | Update mentor profile | Request Body: | { "bio"?: "string", "headline"?: "string", "expertise"?: [], "session_price"?: 799 } | Response (200): | { "profile": { updated profile } } | Error Codes: | 400 VALIDATION_ERROR |


# Chapter 12: Admin Endpoints


[Table]
| GET /admin/stats | Auth: Admin | Get platform-wide statistics | Response (200): | { "total_users": 12400, "dau": 3200, "mrr": 850000, "new_signups_today": 47, "pending_mentor_approvals": 3, "open_reports": 8 } | Error Codes: | 401 UNAUTHORIZED | 403 FORBIDDEN |



[Table]
| GET /admin/users | Auth: Admin | List all users with filters | Response (200): | { "users": [{ "id", "name", "email", "role", "plan", "status", "created_at" }], "meta": { "total", "page" } } | Error Codes: | 403 FORBIDDEN |



[Table]
| PATCH /admin/users/:id | Auth: Admin | Update user account (suspend, change plan) | Request Body: | { "status"?: "active|suspended", "plan"?: "free|premium" } | Response (200): | { "user": { updated user } } | Error Codes: | 404 NOT_FOUND | 403 FORBIDDEN |



[Table]
| GET /admin/mentors/pending | Auth: Admin | List mentor applications awaiting review | Response (200): | { "applications": [{ "user_id", "name", "bio", "expertise", "submitted_at" }] } | Error Codes: | 403 FORBIDDEN |



[Table]
| PATCH /admin/mentors/:userId/verify | Auth: Admin | Approve or reject mentor application | Request Body: | { "action": "approve|reject", "reason"?: "string" } | Response (200): | { "message": "Mentor approved/rejected" } | Error Codes: | 404 NOT_FOUND | 400 VALIDATION_ERROR |



[Table]
| GET /admin/reports | Auth: Admin | List community reports | Response (200): | { "reports": [{ "id", "category", "status", "reporter", "reported_user", "created_at" }] } | Error Codes: | 403 FORBIDDEN |



[Table]
| PATCH /admin/reports/:id | Auth: Admin | Resolve a community report | Request Body: | { "action": "dismiss|warn|suspend|ban", "note"?: "string" } | Response (200): | { "report": { "id", "status": "resolved" } } | Error Codes: | 404 NOT_FOUND | 403 FORBIDDEN |



[Table]
| GET /admin/feature-flags | Auth: Admin | List all feature flags | Response (200): | { "flags": [{ "name", "is_enabled", "enabled_for_plans" }] } | Error Codes: | 403 FORBIDDEN |



[Table]
| PATCH /admin/feature-flags/:name | Auth: Admin | Toggle a feature flag | Request Body: | { "is_enabled": true, "enabled_for_plans"?: ["premium"] } | Response (200): | { "flag": { updated flag } } | Error Codes: | 404 NOT_FOUND | 403 FORBIDDEN |

