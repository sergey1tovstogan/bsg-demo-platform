BSG Demo Platform — AZURE SERVICES EXPLAINED

Purpose & Scope
---------------
This document explains **why** specific Azure services are used in the BSG Demo Platform.
It is a **conceptual and explanatory** document intended for onboarding, demos, and
high-level architectural understanding.

This document:
- Explains service choices and trade-offs
- Provides mental models for demos and discussions
- Avoids configuration, secrets, and step-by-step setup

This document does NOT:
- Contain Azure setup instructions (see AZURE_CONFIGURATION.md)
- Define environment variables (see CONFIGURATION.md)
- Describe adapter or connectivity rules (see CONNECTIVITY.md)

_Last updated: 2025-12-18_

---

Design Goals
------------
The Azure setup for the BSG Demo Platform is guided by the following goals:

- **Demo reliability** — predictable behavior during live demos
- **Low operational overhead** — minimal infrastructure to manage
- **Security by default** — no secrets in code, managed identity preferred
- **Scalability (when needed)** — services scale without redesign
- **Clarity** — easy to explain to technical and non-technical audiences

---

Core Azure Services
-------------------

### Azure App Service (Backend)
Role:
- Hosts the FastAPI backend
- Handles API requests and background processing
- Acts as the integration point for Azure services

Why App Service:
- Managed runtime (no VM or cluster management)
- Integrated logging and monitoring
- Native support for Managed Identity
- Predictable behavior for demos

Trade-offs:
- Less control than raw VMs or AKS
- Some tooling (CLI utilities) may not be available at runtime

---

### Azure Static Web Apps / Static Hosting (Frontend)
Role:
- Hosts the React frontend
- Serves static assets globally

Why static hosting:
- Simple deployment model
- Low latency and cost
- Clear separation between frontend and backend

Trade-offs:
- Frontend must rely entirely on backend APIs
- No server-side rendering in this setup

---

### Azure Cosmos DB (MongoDB API)
Role:
- Primary data store for the platform

Why Cosmos DB (MongoDB API):
- Managed, scalable NoSQL database
- MongoDB-compatible API lowers development friction
- TLS-encrypted connections by default

Trade-offs:
- Slight behavioral differences vs self-hosted MongoDB
- Cost considerations at high throughput

Data ownership and collection rules:
- See DATABASE.md

---

### Azure Event Hub
Role:
- Event streaming backbone
- Demonstrates event-driven architectures

Why Event Hub:
- High-throughput, low-latency event ingestion
- Native Azure integration
- Well-suited for demoing asynchronous systems

Trade-offs:
- Event ordering is partition-scoped
- Requires careful consumer group management

Event Hub is a **core feature** of the platform.
Details:
- EVENTHUB.md

---

Supporting Azure Capabilities
-----------------------------

### Managed Identity
Role:
- Secure authentication to Azure services without secrets

Why Managed Identity:
- Eliminates credential leakage
- Automatic rotation
- Simplifies security model

Details:
- AZURE_CONFIGURATION.md
- SECURITY.md

---

### Azure Monitor & Logs
Role:
- Observability for backend services

Why:
- Integrated with App Service
- Supports log streaming and diagnostics
- Minimal setup required for demos

Observability standards:
- OBSERVABILITY.md

---

What This Document Is (and Is Not)
----------------------------------
This document is:
- A **storytelling aid** for demos
- A **mental model** for new contributors
- A justification of architectural choices

This document is NOT:
- A setup guide
- A troubleshooting manual
- A source of truth for configuration

For those, always refer to the linked authoritative docs.

---

Relationship to Other Documents
-------------------------------
- ARCHITECTURE.md — overall system structure
- AZURE_CONFIGURATION.md — how Azure is configured
- EVENTHUB.md — Event Hub provider details
- DATABASE.md — data model and ownership
- SECURITY.md — identity and secret handling

---

Last updated: 2025-12-18
Maintained by the BSG Team