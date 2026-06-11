SKILLFORGE

Security Checklist

Every security requirement before going live — OWASP Top 10 + platform-specific

# Chapter 1: Authentication Security

Authentication is the most critical attack surface. Every item below must be implemented before accepting real users.

## 1.1 JWT Hardening


[Table]
| ✅ | Use short-lived access tokens | JWT expiry: 15 minutes. Use refresh tokens (7 days) stored in httpOnly cookies only. |



[Table]
| ✅ | Never store JWT in localStorage | localStorage is accessible to JavaScript — XSS attack steals the token. Use httpOnly cookies. |



[Table]
| ✅ | Sign JWTs with strong secret | Minimum 256-bit secret. Store in environment variable — never hardcode in source code. |



[Table]
| ✅ | Validate JWT on every request | Verify signature, expiry, and issuer on every protected endpoint — not just at login. |



[Table]
| ✅ | Revoke tokens on logout | Maintain a token blacklist in Redis. Check blacklist on every request. |



[Table]
| ✅ | Rotate refresh tokens | Issue a new refresh token on every use (rotation). Old refresh token becomes invalid immediately. |


## 1.2 Password Security


[Table]
| ✅ | Hash passwords with bcrypt | Use bcrypt with minimum cost factor 12. Never store plain or MD5/SHA passwords. |



[Table]
| ✅ | Enforce password strength | Minimum 8 characters, at least 1 uppercase, 1 number. Validate server-side — not just client-side. |



[Table]
| ✅ | Rate limit login attempts | Maximum 5 failed attempts per IP per 15 minutes. Lockout with exponential backoff. |



[Table]
| ✅ | Secure password reset flow | Reset tokens must be: single-use, expire in 1 hour, hashed in DB, sent only to verified email. |


## 1.3 OAuth Security


[Table]
| ✅ | Validate OAuth state parameter | Generate and verify a CSRF state token on every OAuth flow to prevent CSRF attacks. |



[Table]
| ✅ | Verify OAuth email is confirmed | Only accept OAuth accounts where the provider confirms the email is verified. |



[Table]
| ✅ | Never expose OAuth access tokens | Store OAuth tokens server-side only. Never send them to the frontend. |


# Chapter 2: API Security

## 2.1 Input Validation


[Table]
| ✅ | Validate all request inputs | Use Zod/class-validator on every endpoint. Reject any request with unexpected or malformed fields. |



[Table]
| ✅ | Sanitize all string inputs | Strip or escape HTML special characters from all text inputs to prevent XSS via stored data. |



[Table]
| ✅ | Validate file upload types | For resume uploads: only accept PDF. Check MIME type server-side — not just file extension. |



[Table]
| ✅ | Limit file upload size | Maximum 5MB per file upload. Enforce server-side with Multer limits. |



[Table]
| ✅ | Validate UUIDs in URL params | Every :id param must be validated as a valid UUID before hitting the database. |


## 2.2 Authorization


[Table]
| ✅ | Check ownership on every resource | A student must never be able to access another student's DLT, resume, or interview recordings. |



[Table]
| ✅ | Role-based access control (RBAC) | Every endpoint declares required role. NestJS Guards enforce role check before handler runs. |



[Table]
| ✅ | Prevent horizontal privilege escalation | When fetching resource by ID, always filter by user_id: WHERE id = $1 AND user_id = $2 |



[Table]
| ✅ | Admin endpoints behind admin guard | All /admin/* routes require role: admin. Mentors and students must receive 403. |


## 2.3 Rate Limiting


[Table]
| ✅ | Global rate limit | 100 requests per minute per IP. Return 429 when exceeded. |



[Table]
| ✅ | Auth endpoint rate limit | POST /auth/login and /auth/register: 10 requests per minute per IP. |



[Table]
| ✅ | AI Mentor rate limit | 3 messages/day for free users. 429 with upgrade prompt when exceeded. |



[Table]
| ✅ | Use Redis for rate limit counters | In-memory rate limiting fails on multi-instance deployments. Use Redis counters. |


## 2.4 CORS Configuration


[Table]
| ✅ | Whitelist allowed origins only | Only allow requests from: https://skillforge.app and https://www.skillforge.app. Never use wildcard * in production. |



[Table]
| ✅ | Restrict allowed HTTP methods | Only allow: GET, POST, PATCH, PUT, DELETE. Block OPTIONS except for preflight. |



[Table]
| ✅ | Set credentials flag correctly | If using cookies for auth: set credentials: true in CORS config AND Access-Control-Allow-Credentials: true |


# Chapter 3: Database Security


[Table]
| ✅ | Use parameterized queries only | Never concatenate user input into SQL strings. Prisma handles this automatically — never use $queryRawUnsafe. |



[Table]
| ✅ | Database not exposed to internet | PostgreSQL must only accept connections from the backend service IP. No public internet access. |



[Table]
| ✅ | Separate DB credentials per environment | Development, staging, and production must use different DB credentials. Never share. |



[Table]
| ✅ | Principle of least privilege on DB user | The app's DB user should only have SELECT, INSERT, UPDATE, DELETE. Never GRANT ALL or superuser. |



[Table]
| ✅ | Encrypt sensitive columns | Encrypt: password_reset_tokens, oauth access_tokens, interview recording URLs. Use pgcrypto or app-level AES. |



[Table]
| ✅ | Enable DB connection SSL | Require SSL/TLS on all database connections in staging and production. |



[Table]
| ✅ | Automated daily backups | Configure automated daily backups with 30-day retention. Test restore monthly. |


# Chapter 4: Frontend Security


[Table]
| ✅ | Content Security Policy (CSP) headers | Set strict CSP headers to prevent XSS: restrict script sources to self + known CDNs only. |



[Table]
| ✅ | HTTP security headers | Set: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin. |



[Table]
| ✅ | Sanitize rendered content | Any user-generated content rendered as HTML (e.g. resume descriptions) must be sanitized with DOMPurify. |



[Table]
| ✅ | No sensitive data in URL params | Never put JWTs, user IDs, or session tokens in URL query strings — they appear in logs and browser history. |



[Table]
| ✅ | HTTPS only | Force HTTPS everywhere. Redirect all HTTP to HTTPS. Set HSTS header with min-age 1 year. |



[Table]
| ✅ | Secure cookie attributes | All auth cookies: Secure=true, HttpOnly=true, SameSite=Strict, Path=/ |


# Chapter 5: OWASP Top 10 Coverage


[Table]
| OWASP Risk | Status | How SkillForge Mitigates It |
| A01: Broken Access Control | ✅ Done | RBAC guards on all endpoints, ownership checks on all resource queries |
| A02: Cryptographic Failures | ✅ Done | bcrypt for passwords, JWT RS256, HTTPS everywhere, encrypted sensitive columns |
| A03: Injection | ✅ Done | Prisma ORM parameterized queries, Zod input validation on all endpoints |
| A04: Insecure Design | ✅ Done | Threat modeling documented, security requirements in user stories |
| A05: Security Misconfiguration | ⚠️ Monitor | CORS whitelist, security headers, no debug info in production errors |
| A06: Vulnerable Components | ⚠️ Monitor | npm audit in CI/CD pipeline, Dependabot enabled on GitHub repo |
| A07: Auth Failures | ✅ Done | Short-lived JWTs, rate limiting, bcrypt, token rotation, httpOnly cookies |
| A08: Software Integrity | ⚠️ Monitor | Lockfile committed, verify npm package checksums, signed releases |
| A09: Logging Failures | ✅ Done | Audit logs for all admin actions, error logging via Sentry, no PII in logs |
| A10: SSRF | ✅ Done | Validate and whitelist all external URLs, block private IP ranges in fetch calls |


# Chapter 6: AI & LLM Security


[Table]
| ✅ | Prompt injection prevention | Never concatenate raw user input directly into system prompts. Always use structured template with variable substitution and input length limits. |



[Table]
| ✅ | Limit LLM context window | Cap injected learner context to 2000 tokens. Prevents context stuffing attacks. |



[Table]
| ✅ | Filter LLM outputs | Run LLM responses through a content filter before sending to users. Block jailbreak attempts. |



[Table]
| ✅ | Never expose API keys to frontend | OpenAI/Anthropic API keys stay on the backend only. Never in .env files committed to git. |



[Table]
| ✅ | Rate limit LLM endpoints | LLM calls are expensive. Rate limit per user and set monthly token budgets per tier. |



[Table]
| ✅ | Log all LLM inputs/outputs | For abuse detection and quality monitoring. Scrub PII before logging. Retain for 30 days. |


# Chapter 7: Infrastructure Security


[Table]
| ✅ | Store all secrets in environment variables | No hardcoded API keys, DB URLs, or JWT secrets in source code. Use .env files locally, secrets manager in production. |



[Table]
| ✅ | Never commit .env files | Add .env* to .gitignore immediately. Use .env.example with placeholder values for documentation. |



[Table]
| ✅ | Use secrets manager in production | Use Railway/Render environment variables or AWS Secrets Manager. Never pass secrets as build args. |



[Table]
| ✅ | Separate environments | Three environments: development, staging, production. Each has its own DB, API keys, and secrets. |



[Table]
| ✅ | Enable audit logging for admin actions | All admin actions (suspend user, approve mentor, change feature flags) logged with actor ID and timestamp. |



[Table]
| ✅ | Set up error monitoring | Sentry configured in production. Errors include stack trace and request context but never PII. |



[Table]
| ⚠️ | Penetration testing before launch | Schedule a basic pentest or use a tool like OWASP ZAP before accepting real users and payments. |

