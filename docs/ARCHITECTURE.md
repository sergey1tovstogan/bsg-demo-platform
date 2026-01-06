
BSG Demo Platform — Architecture (Authoritative)

Purpose & Scope
---------------
This document defines the architectural design of the BSG Demo Platform. It describes the system shape, component boundaries, and mandatory architectural patterns.

This document intentionally excludes:
- Environment variables and secrets
- Local development commands or ports
- Detailed API endpoint listings
- Cloud-specific setup steps

Those topics are covered in dedicated documents under /docs.

System Overview
---------------
The BSG Demo Platform is a component-based demo application designed to showcase Temenos products through a unified frontend and backend.

At a high level:
- A React frontend renders demo components
- A FastAPI backend provides APIs and orchestration
- Azure Cosmos DB (MongoDB API) stores component data
- All external systems are accessed exclusively through adapters

The system is designed to be modular, predictable, and tool-friendly for both humans and LLM-based tooling (Claude, Cursor).

High-Level Architecture
-----------------------
Frontend (React)
  |
  | HTTP / REST
  v
Backend (FastAPI)
  |
  | Adapter Interfaces
  v
External Systems
(Database, RAG APIs, Cloud Services)

Key characteristics:
- Frontend never connects directly to databases or external APIs
- Backend business logic never imports drivers or SDKs directly
- All integrations are abstracted behind adapters

Core Architectural Principles
-----------------------------

1. Component Isolation
Each demo domain is implemented as an independent component.
- No direct inter-component dependencies
- Shared functionality lives in common services
- Clear ownership of data per component

2. Adapter-First Integration (Mandatory)
All external connectivity is handled through adapters.
- No direct database clients in business logic
- No direct HTTP clients to external APIs
- No cloud SDK usage outside adapters

Adapters encapsulate configuration, credentials, and connectivity details.
(Concrete rules live in CONNECTIVITY.md.)

3. Single Source of Truth
- /docs defines how the system works
- Code must follow documented architecture
- Tooling must reference documentation instead of guessing

When architecture changes, documentation must be updated.

Component Model
---------------
A component represents a logical demo domain (e.g. Integration, Data Architecture, Security).

Each component typically includes:
- Frontend UI elements
- Backend API handlers
- Data stored in a dedicated or component-scoped collection
- Optional demo assets (videos, content)

Component boundaries are enforced both structurally (folders) and logically (data ownership).
Detailed naming and mapping rules live in COMPONENTS.md.

Adapter & Integration Model
---------------------------
Adapters form the only allowed boundary between core logic and external systems.

Adapter types include:
- Database adapters
- RAG / LLM adapters
- Cloud service adapters
- Third-party API adapters

Adapters:
- Implement explicit interfaces
- Are selected via factories
- Hide credentials and configuration
- Allow implementation switching without business logic changes

This pattern ensures testability, portability, and architectural consistency.

Data Flow Overview
------------------
Typical request flow:
1. Frontend requests component data
2. Backend routes request to component service
3. Component service uses adapters as required
4. Adapters interact with external systems
5. Data flows back through the same layers

At no point does:
- The frontend access the database
- Business logic access drivers or SDKs directly

Deployment Model (Conceptual)
-----------------------------
The architecture supports:
- Local single-machine development
- Cloud-hosted deployments

The architecture does not assume:
- Containers
- Specific orchestration platforms
- A single cloud provider

Deployment specifics are intentionally decoupled from architectural design.

Non-Goals & Explicit Exclusions
-------------------------------
The architecture explicitly avoids:
- Microservice over-fragmentation
- Cross-component data coupling
- Hidden side effects in adapters
- Environment-specific logic in business code

Any requirement pushing toward these patterns must be reviewed explicitly.

---
Suggested Additional Documentation Files
----------------------------------------

To keep Architecture.md lean and authoritative, the following files should exist:

- CONNECTIVITY.md
  Concrete adapter rules, factories, connectivity assumptions, and confirmation checklist.

- COMPONENTS.md
  Component naming, component_id rules, frontend/backend/data mapping.

- API_CONVENTIONS.md
  API versioning, endpoint structure, authentication patterns.

- DATABASE.md
  Collections, indexing strategy, schema expectations, component data ownership.

- LOCAL_DEV.md
  Local setup, ports, commands, environment configuration.

---
Last updated: 2025-12-18
Maintained by the BSG Team