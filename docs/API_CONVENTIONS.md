BSG Demo Platform — API_CONVENTIONS (Authoritative)

Purpose & Scope
---------------
This document defines the API conventions for the BSG Demo Platform.

It establishes:
- API versioning strategy
- URL and naming conventions
- Standard response and error patterns
- Authentication expectations
- Component API structure rules

This document does NOT:
- List every endpoint in detail (component endpoints should be discoverable via OpenAPI)
- Describe local run commands (see LOCAL_DEV.md)
- Define adapter/connectivity rules (see CONNECTIVITY.md)

---

API Fundamentals
----------------

Base Path:
- All APIs are served under: /api/v1

Versioning:
- URL-based versioning only
- Current version: v1
- New breaking changes require a new version path (/api/v2)

Rules:
- Do not introduce per-component versions
- Do not introduce query-param versions
- Do not introduce header-based versions

---

Resource Naming & URL Conventions
---------------------------------

General rules:
- Use lowercase
- Use kebab-case for path segments
- Use plural nouns for collections/resources
- Avoid verbs in URLs when possible (use HTTP methods instead)

Examples:
- /api/v1/components
- /api/v1/components/{component-id}/content
- /api/v1/components/{component-id}/videos

Identifiers:
- component-id is kebab-case and must match COMPONENTS.md
- database collection naming is irrelevant to the API surface

---

Component API Structure (Mandatory)
-----------------------------------

All component APIs MUST follow this pattern:

/api/v1/components/{component-id}/...

Standard component sub-resources:
- content
- demo
- videos
- chatbot

Rules:
- No custom top-level component routes (e.g., /api/v1/security/*) unless explicitly justified and documented
- Component-specific behavior must still live behind the standard structure
- Prefer adding a sub-resource under the component rather than inventing new top-level groups

Examples:
- GET  /api/v1/components/{component-id}/content
- POST /api/v1/components/{component-id}/content
- GET  /api/v1/components/{component-id}/videos
- GET  /api/v1/components/{component-id}/demo
- POST /api/v1/components/{component-id}/chatbot/query

### Data Architecture Component Endpoints Example

The data-architecture component provides event streaming endpoints following these conventions:

```
GET /api/v1/components/data-architecture/events?customerId={id}&topic={topic}&limit=100
GET /api/v1/components/data-architecture/events/recent?minutes=30&limit=50
GET /api/v1/components/data-architecture/events/topics
GET /api/v1/components/data-architecture/events/health
```

**Example Response** (`/events` endpoint):
```json
{
  "success": true,
  "events": [
    {
      "id": "evt-123",
      "timestamp": 1734544800000,
      "type": "business",
      "topic": "temenos.party.customers.created",
      "partition": 0,
      "offset": 42,
      "payload": {...},
      "transactionType": "CREATE_CUSTOMER"
    }
  ],
  "total": 42,
  "source": "eventhub"
}
```

**Query Parameters**:
- `customerId`: Filter events by customer ID (entityid field)
- `topic`: Filter by event topic name
- `limit`: Maximum events to return (1-1000, default: 100)
- `minutes`: Time window in minutes for `/recent` endpoint (1-60, default: 5)

**Health Check Response** (`/events/health`):
```json
{
  "status": "healthy",
  "connected": true,
  "events_buffered": 42,
  "topic": "modelbank-event-topic",
  "last_event_time": "2024-12-18T10:30:00Z"
}
```

---

Common Platform Endpoints
-------------------------

The platform provides a small set of global endpoints:

- GET /api/v1/health
- GET /api/v1/ready
- GET /api/v1/live
- GET /api/v1/components

Rules:
- Health endpoints must remain lightweight (no expensive calls)
- Health endpoints must not leak secrets
- /components must return the component registry view (source of truth)

---

HTTP Method Semantics
---------------------

Use standard REST semantics:
- GET: read
- POST: create or action under a resource (e.g. chatbot query)
- PUT: replace full resource (use sparingly)
- PATCH: partial update (preferred for updates)
- DELETE: delete resource

Rules:
- Do not overload GET with side effects
- Prefer PATCH over PUT unless full replacement is needed
- Use POST for actions that are not naturally CRUD (e.g. /chatbot/query)

---

Request & Response Conventions
------------------------------

Content Type:
- JSON request/response by default: application/json

Response shape:
- Prefer direct resource responses for simple GETs
- Prefer envelopes for lists and paginated endpoints

Recommended list envelope:
{
  "items": [...],
  "count": <int>
}

Pagination (if used):
- Use query params: limit, offset
- Defaults must be safe and documented per endpoint

Rules:
- Be consistent across endpoints within the same resource group
- Avoid custom pagination schemes unless required

---

Error Handling Conventions
--------------------------

Principles:
- Errors must be actionable and safe
- Do not leak secrets, tokens, connection strings, or stack traces in responses
- Provide stable machine-readable codes where feasible

Recommended error envelope:
{
  "error": {
    "type": "<category>",
    "message": "<human-readable>",
    "details": [
      { "field": "<optional>", "issue": "<optional>" }
    ]
  }
}

HTTP status codes (guidance):
- 400: Validation error / malformed request
- 401: Missing/invalid authentication
- 403: Authenticated but not authorized
- 404: Resource not found
- 409: Conflict (duplicate keys, state conflicts)
- 422: Schema validation error (FastAPI/Pydantic)
- 429: Rate limit exceeded
- 500: Unhandled server error
- 502/503/504: Upstream dependency failure (when applicable)

Rules:
- Use consistent status codes for the same failure class
- Include correlation/request IDs when available (headers preferred)

---

Authentication & Authorization
------------------------------

Authentication:
- JWT Bearer token by default
- Header: Authorization: Bearer <token>

Token behavior:
- Access token: short-lived
- Refresh token: longer-lived
(Exact durations are implementation details and may evolve.)

Authorization:
- Enforce role-based access control where required
- Do not rely on frontend gating for security

Rules:
- Never accept tokens via query params
- Never log tokens
- Never return tokens in error messages

---

Rate Limiting & Abuse Protection
--------------------------------
- Rate limiting should be applied consistently to API endpoints
- Responses to throttling must use 429

Rules:
- Do not implement per-endpoint “custom” throttling behavior unless documented
- Ensure rate limiting does not break health checks

---

OpenAPI / Swagger
-----------------
- OpenAPI docs must remain available in development
- Changes to request/response models should be reflected in OpenAPI automatically

Rules:
- Do not bypass FastAPI typing/modeling in a way that breaks schema generation
- Prefer Pydantic models for request/response bodies

---

CORS & Frontend Integration
---------------------------
- CORS configuration must allow the expected frontend origins (environment-specific)
- CORS rules must be strict in production

Rules:
- Do not set wildcard origins in production unless explicitly approved
- Do not expose sensitive headers unnecessarily

---

Adding or Modifying Endpoints (Process)
---------------------------------------
Before implementing:
1) Identify if this is a component endpoint or a global platform endpoint
2) Reuse existing patterns in the same resource group
3) Ensure naming follows kebab-case and /api/v1 rules
4) Confirm authentication requirements

When changing:
- Update docs only if conventions change
- Prefer backward-compatible additions
- If breaking change is required, plan a new version

---

Relationship to Other Documents
-------------------------------
- COMPONENTS.md
  Defines component_id naming and component boundaries.

- CONNECTIVITY.md
  Defines how APIs may interact with external systems (adapters only).

- DATABASE.md
  Defines data storage rules and schema expectations.

- LOCAL_DEV.md
  Defines local startup and environment configuration.

---
Last updated: 2025-12-18
Maintained by the BSG Team