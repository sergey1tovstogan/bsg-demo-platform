BSG Demo Platform — OBSERVABILITY (Authoritative)

Purpose & Scope
---------------
This document defines the observability standards for the BSG Demo Platform.

It establishes:
- What we log and what we never log
- Correlation/request ID expectations
- Health/readiness/liveness semantics
- Where to find logs locally and in Azure
- Recommended metrics/tracing direction (without over-engineering)

This document is authoritative for observability behavior.
It must be followed by humans and tooling (Claude, Cursor).

This document does NOT:
- Define security rules (see SECURITY.md)
- Define API structure (see API_CONVENTIONS.md)
- Define connectivity patterns (see CONNECTIVITY.md)
- Provide Azure setup steps (see AZURE_CONFIGURATION.md)

---

Guiding Principles
------------------
1) **Useful, not noisy**
- Prefer structured, queryable logs over verbose text logs.
- Log key events and failures; avoid logging full payloads by default.

2) **Safe by default**
- Never log secrets or credentials.
- Redact sensitive data.

3) **Traceable**
- Every request should be traceable end-to-end using a correlation/request ID.

4) **Actionable**
- Errors should include enough context to debug (without leaking internals).

---

Logging Standards
-----------------

### Format
- Prefer **structured JSON logs** (recommended for backend).
- Include consistent fields to support filtering and correlation.

Recommended common fields:
- timestamp
- level
- service (frontend/backend)
- environment
- request_id / correlation_id
- method
- path
- status_code
- duration_ms
- component_id (when applicable)
- error_type / error_code (when applicable)

### What to Log
- Application startup/shutdown events
- Configuration state at a high level (e.g., which adapters are enabled), without secrets
- Incoming requests (method, path, status, duration, request_id)
- External dependency failures (sanitized)
- Business-level events relevant to demos (e.g., “Event Hub consumer started”), without sensitive data

### What NOT to Log (Mandatory)
- Authorization headers
- JWTs / refresh tokens
- Connection strings / SAS keys
- Passwords / PII fields
- Full request/response bodies by default

If payload logging is needed for debugging:
- Make it opt-in
- Redact sensitive fields
- Never enable in production by default

---

Correlation IDs
---------------
The backend must support correlation IDs for request tracing.

Rules:
- If the client sends a correlation ID header, preserve it.
- If not provided, generate one.
- Include the correlation ID in:
  - response headers
  - structured logs
  - error logs

Recommended header names:
- `X-Request-Id` (preferred) or `X-Correlation-Id`

Consistency matters more than the specific name; pick one and standardize.

---

Health, Readiness, Liveness
---------------------------

The platform exposes standard health endpoints:

- `/api/v1/health`  — overall health signal
- `/api/v1/ready`   — readiness for traffic
- `/api/v1/live`    — liveness / process up

Rules:
- These endpoints must be lightweight and fast.
- They must not leak sensitive information.
- They must not trigger expensive downstream calls unless explicitly documented.

Recommended semantics:
- **/live**: returns OK if the process is running and the web server is responsive.
- **/ready**: returns OK if required dependencies (minimum set) are reachable.
- **/health**: returns a general health summary (may include dependency status in a safe, non-sensitive form).

If dependency checks are included:
- Provide boolean status, not connection details.
- Use timeouts to avoid hanging requests.

---

Frontend Observability (Minimal Standards)
------------------------------------------
Frontend observability should focus on:
- API error visibility (status codes, failure reasons)
- Basic performance timing (optional)
- User-facing error messages (non-technical)

Rules:
- Do not log tokens or user secrets in console.
- Do not leak backend internal errors to users.

If client-side monitoring is introduced (future):
- Document the provider and data policy
- Ensure GDPR/privacy alignment for production

---

Local Logs
----------
Local logs are primarily available via:
- console output (frontend + backend)
- `logs/` directory (git-ignored)

Rules:
- Do not commit logs.
- Keep log files out of PRs/issues unless sanitized.

See `LOCAL_DEV.md` for how to run locally.

---

Azure Logs (Production)
-----------------------
Backend (Azure App Service):
- Primary source: App Service log stream and application logs
- Logs should be structured to support filtering

Rules:
- Do not enable overly verbose debug logging in production.
- If debugging production incidents, prefer temporary, scoped increases in logging.

Frontend (Azure Static Web Apps):
- Basic access/error insight is limited; rely on:
  - backend logs for API issues
  - browser devtools for client issues
  - any optional monitoring provider (if configured)

---

Metrics (Optional, Recommended Direction)
-----------------------------------------
Metrics are not required for the demo platform to function, but they help.

If metrics are implemented:
- Prefer a minimal set first:
  - request count by route/status
  - request duration (p50/p95)
  - external dependency failure count
  - Event Hub consumer lag/buffer size (if relevant)

Rules:
- Do not emit high-cardinality labels (e.g., user ids).
- Document any metrics endpoints and secure them appropriately.

---

Tracing (Optional, Future)
--------------------------
Distributed tracing (e.g., OpenTelemetry) is optional.

If introduced:
- Trace IDs must align with request_id/correlation_id
- Exporter configuration must be environment-based
- Sampling must be enabled to control cost/noise

---

Operational Playbook (Quick Checks)
-----------------------------------

### If the frontend is slow or broken
- Check backend health endpoints
- Check browser devtools Network tab for failing API calls
- Check backend logs for request_id and matching errors

### If the backend is failing
- Check `/api/v1/live` first (process up)
- Check `/api/v1/ready` (dependency readiness)
- Inspect App Service logs for sanitized dependency failures

### If external dependencies fail (DB/RAG/EventHub)
- Confirm the relevant adapter is in use (CONNECTIVITY.md)
- Confirm configuration variables are present (CONFIGURATION.md)
- Look for sanitized error logs with request_id/correlation_id

---

Relationship to Other Documents
-------------------------------
- LOCAL_DEV.md
  Local startup and where logs appear locally.

- SECURITY.md
  Sensitive data handling rules for logs and errors.

- API_CONVENTIONS.md
  Error envelope guidance and status code conventions.

- CONNECTIVITY.md
  External dependency access through adapters, including failure behavior.

- AZURE_CONFIGURATION.md
  Where to access logs and configure runtime settings in Azure.

---

Last updated: 2025-12-18
Maintained by the BSG Team