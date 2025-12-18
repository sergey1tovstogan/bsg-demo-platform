BSG Demo Platform — EVENT HUB (Authoritative)

Purpose & Scope
---------------
This document defines how **Azure Event Hub** is used in the BSG Demo Platform.

Event Hub is a **core capability** of the platform and is used to showcase
event-driven architectures, streaming, and real-time integrations.

This document:
- Explains the role of Event Hub in the platform
- Defines required configuration (names only, no secrets)
- Describes runtime behavior and constraints
- Provides safe, high-level troubleshooting guidance

This document does NOT:
- Contain real connection strings or secrets
- Define adapter rules (see CONNECTIVITY.md)
- Duplicate generic troubleshooting (see TROUBLESHOOTING.md)

_Last updated: 2025-12-18_

---

Role of Event Hub in the Platform
--------------------------------
Event Hub is used to demonstrate:
- Event-driven integration patterns
- Asynchronous data flows
- Near real-time processing and observability

Typical use cases include:
- Ingesting demo events
- Streaming domain events
- Visualizing event flow and consumption behavior

All Event Hub access is **read/write via adapters only**.

---

Architecture Placement
----------------------
High-level flow:

Producer (Demo / Adapter)
   → Event Hub
      → Consumer (Backend Adapter)
         → Processing / Persistence / Visualization

Rules:
- Business logic never talks directly to Event Hub SDKs
- All interaction goes through the Event Hub adapter
- Configuration and credentials are injected via environment variables

Refer to:
- ARCHITECTURE.md
- CONNECTIVITY.md

---

Adapter Model (Mandatory)
-------------------------
Event Hub connectivity is implemented via a dedicated adapter.

Expected location:
- backend/app/adapters/eventhub/

Adapter responsibilities:
- Create and manage Event Hub client connections
- Handle authentication (connection string or Managed Identity)
- Consume and/or publish events
- Apply batching, buffering, and checkpoints where applicable
- Surface errors in a sanitized, observable way

Rules:
- No direct Event Hub SDK usage outside adapters
- No hardcoded connection details
- Adapter selection must go through a factory

---

Configuration (Names Only)
--------------------------
All configuration is provided via environment variables.
Values are set in:
- `.env` (local)
- Azure App Service settings (cloud)

Required / common variables:
- `EVENTHUB_CONNECTION_STRING`
- `EVENTHUB_NAME`
- `EVENTHUB_CONSUMER_GROUP`

Optional tuning variables:
- `EVENTHUB_BUFFER_SIZE`
- `EVENTHUB_BATCH_SIZE`
- `EVENTHUB_POLL_INTERVAL_MS`

See:
- CONFIGURATION.md (full contract)
- AZURE_CONFIGURATION.md (where to set them in Azure)

---

Authentication & Permissions
----------------------------
Supported authentication models:
1) Connection string (shared access policy)
2) Managed Identity (preferred for production where supported)

Required permissions:
- Listen (for consumers)
- Send (for producers)

Rules:
- Use least-privilege access
- Do not reuse overly broad policies
- Never store SAS keys or secrets in Git or docs

---

Runtime Behavior & Constraints
------------------------------
Important considerations:
- Event consumption is asynchronous
- Processing may be delayed under load
- Ordering is partition-scoped, not global

Known constraints:
- Local development may behave differently than Azure App Service
- Checkpointing behavior depends on adapter implementation
- Misconfigured consumer groups can lead to missed or duplicated events

These are expected characteristics of event streaming systems.

---

Observability
-------------
Event Hub interactions must be observable.

Minimum expectations:
- Log consumer startup/shutdown events
- Log connection failures (sanitized)
- Log processing errors with correlation IDs

Metrics (if enabled):
- events consumed per interval
- processing latency
- consumer lag (where measurable)

See:
- OBSERVABILITY.md

---

Testing Event Hub Integration
-----------------------------
Testing principles:
- Never test against production Event Hubs
- Prefer dedicated dev/test namespaces
- Use mock adapters for unit tests

Manual testing:
- Verify connection and consumer startup via logs
- Confirm events are visible in backend processing
- Validate behavior via demo UI components

Automated tests:
- Mock adapter behavior
- Validate factory selection and error handling

---

Troubleshooting (Event Hub–Specific)
------------------------------------
If Event Hub features are not working:

1) Confirm configuration variables are present
2) Restart backend after config changes
3) Check backend logs for adapter initialization
4) Verify consumer group correctness
5) Confirm permissions on the Event Hub namespace

For generic issues (auth, logs, health):
- See TROUBLESHOOTING.md

---

What We Explicitly Do NOT Document Here
---------------------------------------
- Real connection strings or namespace URLs
- CLI commands with secrets
- One-off test scripts containing credentials

Those belong in secure, environment-specific tooling only.

---

Relationship to Other Documents
-------------------------------
- CONNECTIVITY.md
  Adapter rules and factory requirements.

- CONFIGURATION.md
  Environment variable contract.

- AZURE_CONFIGURATION.md
  Azure setup and permissions.

- OBSERVABILITY.md
  Logging and metrics expectations.

- TROUBLESHOOTING.md
  Generic incident handling.

---

Last updated: 2025-12-18
Maintained by the BSG Team