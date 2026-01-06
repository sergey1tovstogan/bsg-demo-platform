BSG Demo Platform — COMPONENTS (Authoritative)

Purpose & Scope
---------------
This document defines the component model for the BSG Demo Platform.

It establishes:
- What a “component” is in this system
- How components are named across frontend, backend, and database
- How data ownership is enforced
- How new components must be added

This document is authoritative for component structure and naming.
It must be followed by humans and tooling (Claude, Cursor).

---

What Is a Component?
--------------------
A component represents a **logical demo domain** (e.g. Integration, Security, Data Architecture).

A component is NOT:
- a microservice
- a standalone deployment unit
- a shared utility module

A component IS:
- a cohesive demo area
- independently evolvable
- isolated in data and logic
- rendered as a first-class UI section

---

Canonical Component Identifiers
-------------------------------
Each component has a single canonical identifier: `component_id`.

This identifier is used consistently across:
- frontend routing and folders
- backend APIs and services
- database collections and documents

### Naming Rules (MANDATORY)

| Layer      | Format              | Example              |
|------------|---------------------|----------------------|
| component_id | kebab-case          | data-architecture    |
| frontend folder | kebab-case      | data-architecture    |
| API path   | kebab-case          | /components/data-architecture |
| database collection | snake_case | data_architecture    |

Rules:
- kebab-case for URLs, frontend, API paths
- snake_case for database collections
- No alternative aliases
- No implicit mapping logic

If names do not match exactly, it is a bug.

---

Current Components
------------------
The following components are officially supported:

- integration
- data-architecture
- deployment
- security
- observability
- design-time

### data-architecture Component

**Purpose**: Interactive Temenos data architecture visualization and transaction simulation

**Database Collection**: `data_architecture` (snake_case conversion from component_id)

**Backend Structure**:
- API: `backend/app/api/data_architecture.py`
- Service: `backend/app/services/data_architecture_service.py`
- Endpoints: `/api/v1/components/data-architecture/*`

**Key Features**:
- Interactive architecture diagram with animated data flows
- Three-step transaction simulator (Create Customer → Open Account → Send Payment)
- Real-time Temenos API integration
- Azure Event Hub streaming for Kafka events
- Cross-tab animation synchronization

**External Dependencies**:
- Temenos APIs (via Azure Ingress)
- Azure Event Hub (via EventHub adapter - see CONNECTIVITY.md)

**API Endpoints**:
- GET `/api/v1/components/data-architecture/events` - Get filtered events
- GET `/api/v1/components/data-architecture/events/recent` - Get recent events
- GET `/api/v1/components/data-architecture/events/topics` - List topics
- GET `/api/v1/components/data-architecture/events/health` - Health check

---

Each of these components must:
- exist in the components collection
- have matching frontend and backend representations
- own their data explicitly

---

Frontend Component Structure
----------------------------
Each component owns its UI under a dedicated folder.

Expected structure:
frontend/src/components/<component-id>/

Responsibilities:
- UI rendering
- component-specific views
- component-scoped state
- calling backend APIs for that component

Shared UI primitives live outside component folders and must not be duplicated.

---

Backend Component Structure
---------------------------
Each component owns:
- its API endpoints
- its service-level business logic

Expected locations:
- backend/app/api/v1/endpoints/<component>.py
- backend/app/services/<component>_service.py

Rules:
- No component may import another component’s service directly
- Cross-component reuse must go through shared services
- Business logic must not leak between components

---

Database & Data Ownership
-------------------------
Components own their data.

Two supported patterns exist:

1) Shared content collection
- Shared collections (e.g. content, videos) use `component_id` as a discriminator
- Queries MUST always filter by component_id

2) Component-specific collections
- Some components use a dedicated collection
- Collection name MUST match component_id (snake_case)

Examples:
- data-architecture → data_architecture
- security → security_docs (explicit exception, documented)

Rules:
- Never mix data from multiple components in one document
- Never query shared collections without component_id filtering
- Component data ownership is strict

---

Components Collection (System Registry)
---------------------------------------
All components must be registered in the `components` collection.

Each component entry defines:
- component_id
- display name
- description
- enabled/disabled status
- ordering metadata (if applicable)

The components collection is the source of truth for:
- frontend navigation
- backend validation
- feature toggling

---

Component API Pattern
---------------------
All component APIs follow the same structure:

/api/v1/components/{component-id}/...

Typical endpoints include:
- content
- demo
- videos
- chatbot (if applicable)

Rules:
- No custom top-level APIs per component
- No component-specific versioning
- API structure must be consistent across components

(Concrete endpoint definitions live in API_CONVENTIONS.md.)

---

Adding a New Component (Process)
--------------------------------
Before adding a new component:
1) Confirm it cannot be modeled as part of an existing component
2) Confirm naming does not conflict with existing component_ids

Implementation steps:
1) Register component in the `components` collection
2) Create frontend folder: frontend/src/components/<component-id>/
3) Add backend endpoints and service
4) Create or extend database collection(s)
5) Update documentation:
   - COMPONENTS.md (this file)
   - DATABASE.md if data structures change
   - README.md index if needed

Do NOT:
- Copy another component and rename partially
- Introduce special naming rules
- Skip components collection registration

---

Cross-Component Interaction Rules
---------------------------------
Components must not depend on each other directly.

Allowed:
- Shared services (non-component-specific)
- Shared UI primitives
- Shared adapters

Not allowed:
- Component A importing Component B services
- Writing to another component’s collection
- Frontend components reaching into other component folders

If cross-component interaction is required, it must be explicitly designed and documented.

---

Common Failure Modes (Avoid These)
----------------------------------
- Mismatched naming between frontend and database
- Forgetting component_id filters in shared collections
- Introducing “just one exception” to naming rules
- Hardcoding component lists instead of reading from registry

These lead to data leaks, broken demos, and inconsistent UI behavior.

---

Relationship to Other Documents
-------------------------------
- ARCHITECTURE.md
  Defines overall system shape and architectural principles.

- CONNECTIVITY.md
  Defines how components may access external systems (via adapters only).

- DATABASE.md
  Defines collection structure, indexes, and schema expectations.

- API_CONVENTIONS.md
  Defines endpoint shapes and authentication patterns.

---

Last updated: 2025-12-18
Maintained by the BSG Team