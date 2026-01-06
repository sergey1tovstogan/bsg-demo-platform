BSG Demo Platform — CONNECTIVITY (Authoritative)

Purpose & Scope
---------------
This document defines the mandatory connectivity patterns for the BSG Demo Platform.

It covers:
- How the backend connects to databases, RAG/LLM services, and cloud/third-party APIs
- The adapter and factory patterns that MUST be used
- A repeatable checklist to confirm connectivity works across developer environments

This document intentionally excludes:
- Local run commands and ports (see LOCAL_DEV.md)
- Endpoint listings (see API_CONVENTIONS.md)
- Data schema/collections strategy (see DATABASE.md)
- Azure step-by-step setup (see AZURE_CONFIGURATION.md)

Guiding Rule (Non-Negotiable)
-----------------------------
Core business logic MUST NOT connect directly to any external system.

That means:
- No database drivers in services/endpoints
- No raw http clients (requests/httpx/axios equivalents in backend services) to external systems
- No cloud SDK usage in business logic
- No hardcoded URLs, credentials, or tokens in code

All external connectivity MUST go through adapters.

Adapter Model
-------------
Adapters encapsulate:
- Connection construction
- Authentication/credentials
- Environment selection (dev/prod)
- Retry/timeouts (where applicable)
- Provider-specific request/response mapping

Adapters live under:
- backend/app/adapters/database/
- backend/app/adapters/rag/
- backend/app/adapters/<service>/

Adapters are selected via factories (one place in the codebase decides “which implementation to use”).

Required Layers & Boundaries
----------------------------
Frontend:
- Never connects directly to DB or external services
- Talks only to the backend API

Backend:
- API layer: routes + request/response handling
- Service layer: business logic
- Adapter layer: the only location where external connectivity occurs

External Systems:
- Database (Cosmos DB Mongo API / MongoDB compatible)
- RAG / LLM providers
- Azure resource discovery / cloud APIs
- Any third-party integrations

Database Connectivity
--------------------
MANDATORY: Database operations must use the database adapter pattern.

Rules:
- Use the database adapter factory (single entry point).
- Never import Motor (or any DB driver) into service/business logic.
- Never create connections outside the database adapter layer.
- Business code only sees the adapter interface methods and returned DB handles/collections.

Expected location:
- backend/app/adapters/database/
  - base.py (interface)
  - mongodb_adapter.py (implementation)
  - factory.py (selection logic)

Selection:
- Factory chooses implementation based on configuration (e.g., ENVIRONMENT or adapter type setting).
- Credentials and connection strings are provided via environment configuration (never hardcoded).

Security:
- Secrets must come from environment variables or secret stores, not source code.
- Do not commit connection strings or credentials.

RAG / LLM Connectivity
----------------------
MANDATORY: All RAG / LLM calls must use the RAG adapter pattern.

Rules:
- Use the RAG adapter factory (single entry point).
- Never call external RAG/LLM APIs directly in services.
- Never hardcode endpoints, models, or auth tokens in services.

Expected location:
- backend/app/adapters/rag/
  - base.py (interface)
  - temenos_adapter.py (implementation)
  - factory.py (selection logic)

Behavior:
- Adapter is responsible for mapping platform requests into provider-specific calls.
- Provider switching must not require business logic changes.

EventHub / Event Streaming Connectivity
---------------------------------------
MANDATORY: All EventHub / event streaming operations must use the EventHub adapter pattern.

Rules:
- Use the EventHub adapter factory (single entry point).
- Never import Azure EventHub SDK (or equivalent) in services or API layer.
- Never create EventHub connections outside the adapter layer.
- Never access event streams directly from business logic.

Expected location:
- backend/app/adapters/eventhub/
  - base.py (interface)
  - eventhub_adapter.py (Azure EventHub implementation)
  - factory.py (selection logic)

Behavior:
- Adapter encapsulates event streaming, buffering, and filtering logic.
- Adapter provides methods for:
  - Starting/stopping event consumer
  - Retrieving filtered events (by customer ID, topic, time range)
  - Getting available topics
  - Health checking
- Business services use the adapter via factory pattern:
  ```python
  from app.adapters.eventhub import get_eventhub_adapter

  class MyService:
      def __init__(self):
          self.eventhub = get_eventhub_adapter()

      async def get_events(self):
          events = await self.eventhub.get_events(limit=100)
          return events
  ```

Configuration:
- Environment variable: EVENTHUB_CONNECTION_STRING
- Consumer group: Configured via EVENTHUB_CONSUMER_GROUP
- Topic: Configured via EVENTHUB_NAME
- Buffer size: Configured via EVENTHUB_BUFFER_SIZE

Lifecycle:
- Adapter is initialized at application startup (in main.py lifespan)
- Background consumer task runs continuously
- Events are buffered in-memory for quick retrieval
- Adapter is stopped gracefully at application shutdown

Azure / Cloud / Third-Party Connectivity
----------------------------------------
MANDATORY: Any interaction with Azure services, Kubernetes, or third-party APIs must use an adapter.

Rules:
- No Azure SDK usage in business logic
- No shelling out to platform-specific tooling (e.g., kubectl) inside cloud runtime paths
- Use a dedicated adapter under backend/app/adapters/<service>/

Known operational constraint to respect:
- If namespace discovery currently relies on kubectl, it may work locally but not in Azure App Service where kubectl is not available.
- Any solution intended for cloud must avoid depending on kubectl availability in the runtime environment.

Factory Pattern Requirements
----------------------------
Each adapter group must have:
- An interface (base/abstract class)
- One or more implementations
- A factory that selects the implementation based on configuration

Factories must:
- Centralize selection logic (no scattered “if ENV then …”)
- Fail fast with clear errors if configuration is missing/invalid
- Avoid importing heavy provider SDKs unless needed (keep startup lean)

Adding a New External Connection (Process)
------------------------------------------
Before implementing:
1) Search for an existing adapter that already covers the need (reuse first).
2) If none exists, propose:
   - adapter name and responsibility
   - interface methods (minimal, stable)
   - where configuration will live
   - how it will be tested/mocked

Implementation steps:
1) Create interface in app/adapters/<category>/base.py (or extend existing base).
2) Implement provider-specific adapter in app/adapters/<category>/<provider>_adapter.py.
3) Update app/adapters/<category>/factory.py to select the new implementation.
4) Update docs:
   - CONNECTIVITY.md (this file) only if rules change
   - AZURE_CONFIGURATION.md / LOCAL_DEV.md if configuration/setup changes

Do NOT:
- Add direct connectivity in services “just to get it working”
- Introduce a second adapter pattern for the same category
- Hardcode credentials, URLs, model IDs, or subscription IDs

Connectivity Confirmation Checklist (Use Every Time)
----------------------------------------------------
When implementing or modifying connectivity, explicitly confirm:

1) Adapter Use
- Which adapter is used?
- Which factory selects it?
- Which interface methods are called?

2) Configuration Sources
- Which env vars/settings are required?
- Are any defaults assumed?
- Are secrets kept out of code and docs?

3) Environment Compatibility
- Does it work locally?
- Does it work in the cloud runtime?
- Are there runtime dependencies (e.g., kubectl) that won’t exist in production?

4) Failure Behavior
- What happens when credentials are missing?
- What happens when the external system is unreachable?
- Are error messages actionable?

5) Reuse
- Did you reuse an existing adapter or pattern?
- If not, why not?

If any checklist item cannot be satisfied, state why before proceeding.

Testing Strategy (Recommended)
------------------------------
- Prefer mock adapters for service-layer tests.
- Unit tests should validate:
  - adapter factory selection logic
  - interface contract behavior
  - error handling and timeouts
- Integration tests (optional) can validate real connectivity in controlled environments.

Documentation Touchpoints
-------------------------
This file defines rules and process. Other documents define details:

- LOCAL_DEV.md
  How to run locally, required environment variables, ports, and commands.

- DATABASE.md
  Collections, indexing, component data ownership, and data consistency rules.

- API_CONVENTIONS.md
  API versioning, standard endpoints, auth headers, and response patterns.

- AZURE_CONFIGURATION.md / AZURE_SERVICES_EXPLAINED.md
  Azure resource setup and operational details.

---
Last updated: 2025-12-18
Maintained by the BSG Team