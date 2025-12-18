BSG Demo Platform — SECURITY (Authoritative)

Purpose & Scope
---------------
This document defines the security model and security rules for the BSG Demo Platform.

It establishes:
- Authentication and authorization expectations
- Token and secret handling rules
- API-level security controls (CORS, rate limiting, validation)
- Secure logging and error handling requirements

This document is authoritative for security behavior.
It must be followed by humans and tooling (Claude, Cursor).

This document does NOT:
- Provide step-by-step Azure setup (see AZURE_CONFIGURATION.md)
- Define connectivity adapter rules (see CONNECTIVITY.md)
- Define API endpoint structures (see API_CONVENTIONS.md)

---

Security Principles (Non-Negotiable)
------------------------------------
1) **No secrets in the repo**
- Never commit connection strings, SAS keys, JWTs, passwords, or private keys.
- Never paste secrets into documentation or issue comments.
- Use placeholders only.

2) **Least privilege**
- Grant only the minimum required permissions (especially in Azure).
- Prefer scoped roles over broad roles whenever possible.

3) **Secure by default**
- Default to safe configurations (no wildcard CORS in prod, no debug in prod).
- Fail fast and clearly when security requirements are not met.

4) **Defense in depth**
- Combine auth, validation, rate limiting, and safe error handling.
- Do not rely on frontend logic for security.

---

Authentication
--------------
Primary authentication mechanism:
- **JWT Bearer tokens**
- Header: `Authorization: Bearer <token>`

Rules:
- Never accept tokens via query parameters.
- Never store tokens in logs.
- Never return tokens in error messages.
- Prefer short-lived access tokens and longer-lived refresh tokens (implementation detail).

Session / refresh behavior:
- If refresh tokens are used, they must be stored securely and rotated where possible.
- If sessions are persisted (e.g., `user_sessions` collection), treat them as sensitive data.

---

Authorization (RBAC)
--------------------
Authorization model:
- Role-based access control (RBAC) where applicable.

Rules:
- Authorization must be enforced server-side.
- Do not rely on the frontend to hide or disable features as an authorization mechanism.
- If a new endpoint changes access requirements, update docs and tests accordingly.

---

Password Handling (If Applicable)
---------------------------------
If the platform stores passwords:
- Use a secure password hashing algorithm (bcrypt or equivalent)
- Enforce minimum password policies (length, complexity as required)

Rules:
- Never store plaintext passwords.
- Never log password inputs.
- Hashing parameters (e.g., bcrypt rounds) must be configurable.

---

Secrets & Configuration Hygiene
-------------------------------
Secrets sources:
- Local: `.env` (repo root) populated from `.env.example`
- Cloud: Azure App Service Application Settings and/or GitHub Actions Secrets

Rules:
- `.env` must be git-ignored.
- `.env.example` must never contain real secrets.
- Any env var read by the application must appear in `.env.example` and `CONFIGURATION.md`.
- Do not print environment variables during startup (common accidental leak).

---

External Access & Connectivity
------------------------------
All external connectivity MUST go through adapters.
(See CONNECTIVITY.md.)

Security rules for adapters:
- Do not log request headers containing auth.
- Do not log full connection strings.
- Redact secrets from error messages and logs.
- Apply timeouts and retries where appropriate, but avoid retry storms.

---

API Security Controls
---------------------

Input validation:
- Validate all inputs using Pydantic models (or equivalent).
- Reject unknown/unexpected fields where feasible.
- Use strict typing for request bodies.

CORS:
- Development may allow localhost origins.
- Production must be restricted to known frontend origins.

Rules:
- Do not use wildcard origins (`*`) in production unless explicitly approved.
- Do not expose sensitive headers unnecessarily.

Rate limiting:
- Rate limiting should be enabled for API endpoints.
- Exceeding the limit must return HTTP 429.

Rules:
- Health endpoints should not be rate-limited in a way that breaks monitoring.
- Avoid per-endpoint custom throttling unless documented.

---

Error Handling & Information Disclosure
---------------------------------------
Rules:
- Never return stack traces to clients in production.
- Never include secrets, tokens, connection strings, or internal credentials in responses.
- Errors must be actionable but safe (high-level cause, not internal internals).

Recommended error behavior:
- Use consistent status codes and error envelopes (see API_CONVENTIONS.md).
- Include a request/correlation ID header when possible for tracing issues.

---

Logging & Audit
---------------
Logging must be safe by default.

Rules:
- Never log:
  - Authorization headers
  - JWTs or refresh tokens
  - connection strings / SAS keys
  - passwords
- Redact sensitive fields in request logging middleware.
- Prefer structured logging (JSON) for better filtering and auditing.

Audit considerations:
- If admin-level actions exist, log “who did what” at a high level (no secrets).
- If user sessions are stored, protect them like credentials.

---

Cloud Runtime Security (Azure)
------------------------------
Managed Identity:
- Prefer Managed Identity for Azure resource access when available.
- Keep roles scoped; avoid overly broad roles unless required.

Known constraint:
- Do not rely on runtime availability of CLI tools (e.g., `kubectl`) in managed services.

Transport security:
- Enforce HTTPS in production.
- Use TLS/SSL for database connections (Cosmos DB).

---

Security Review Checklist (Use Before Marking Done)
---------------------------------------------------
Before completing any work that touches security, confirm:

1) Secrets
- No secrets added to code, docs, commits, or logs
- `.env` is git-ignored and not committed

2) Auth
- Endpoints require appropriate authentication where needed
- Tokens are handled only via Authorization header

3) Authorization
- RBAC enforced server-side
- Frontend gating is not treated as security

4) CORS & Rate limiting
- CORS is strict in production
- Rate limiting is enabled and consistent

5) Errors & Logs
- No stack traces in prod responses
- Sensitive fields are redacted in logs

If any item cannot be satisfied, state why before proceeding.

---

Relationship to Other Documents
-------------------------------
- API_CONVENTIONS.md
  Defines endpoint conventions, error envelopes, and auth header patterns.

- CONNECTIVITY.md
  Defines adapter-only connectivity to external systems.

- CONFIGURATION.md
  Defines configuration variables and where secrets are stored.

- AZURE_CONFIGURATION.md
  Defines Azure identity setup and operational hardening steps.

---

Last updated: 2025-12-18
Maintained by the BSG Team
