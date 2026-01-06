BSG Demo Platform — DATABASE (Authoritative)

Purpose & Scope
---------------
This document defines the database rules and data ownership model for the BSG Demo Platform.

It establishes:
- Which database technologies are used
- How collections are structured and named
- How components own and access data
- Indexing and consistency expectations
- What is allowed vs forbidden when working with data

This document is authoritative for database usage.
It must be followed by humans and tooling (Claude, Cursor).

This document does NOT:
- Provide connection strings or credentials (see AZURE_CONFIGURATION.md / LOCAL_DEV.md)
- Describe adapter construction (see CONNECTIVITY.md)
- List API endpoints (see API_CONVENTIONS.md)

---

Database Technology
-------------------
Primary database:
- Azure Cosmos DB using the MongoDB API (MongoDB-compatible)

Characteristics:
- Schema-less document store
- SSL/TLS encrypted connections
- No traditional migrations
- Indexes must be created programmatically

All database access MUST go through the database adapter.

---

Canonical Naming Rules (MANDATORY)
----------------------------------
Consistency across layers is critical.

| Concept              | Convention     | Example              |
|----------------------|----------------|----------------------|
| component_id         | kebab-case     | data-architecture    |
| database collection  | snake_case     | data_architecture    |
| document fields      | snake_case     | component_id         |

Rules:
- Collection names MUST be snake_case
- component_id values MUST be kebab-case
- Do not invent alternative naming conventions
- Do not translate names dynamically

If naming does not match exactly, it is a bug.

---

Collections Overview
--------------------

### Core System Collections
These collections support platform-wide functionality:

- users  
  User accounts and authentication metadata.

- user_sessions  
  Active sessions, refresh tokens, and session tracking.

- components  
  Registry of available components (source of truth).

- content  
  Shared component content (slides, explanations, documents).

- videos  
  Video metadata and references.

- presentations  
  Presentation materials and assets.

---

### Component-Specific Collections
Some components use dedicated collections.

Rules:
- Collection name MUST match component_id in snake_case
- The owning component is the only writer
- No cross-component writes allowed

Examples:
- data-architecture → data_architecture
- integration → integration
- observability → observability

Explicit exceptions (documented):
- security → security_docs

---

Data Ownership Model
--------------------
Each document belongs to exactly one component.

Rules:
- Every document in shared collections MUST include component_id
- Queries against shared collections MUST always filter by component_id
- Never store data for multiple components in the same document
- Never infer component ownership implicitly

Component data ownership is strict and enforced by convention.

---

Document Structure & IDs
------------------------
Documents should:
- Use explicit, stable identifiers where appropriate (e.g. content_id)
- Avoid relying on MongoDB ObjectId semantics in business logic
- Be self-describing enough to support demo scenarios

Rules:
- Do not expose internal _id values to the frontend unless required
- Prefer domain-specific IDs (content_id, video_id, etc.)

---

Indexing Strategy
-----------------
Indexes must be created programmatically at startup or initialization time.

Minimum expectations:
- Index on component_id for shared collections
- Index on frequently queried fields (e.g. content_id, video_id)
- Compound indexes where access patterns require them

Rules:
- Do not rely on default indexing behavior
- Do not create indexes manually in production without documenting them
- Index definitions must live close to adapter initialization logic

---

Query & Access Rules
--------------------
All queries MUST:
- Go through the database adapter
- Be explicit about filters
- Avoid full collection scans in hot paths

Forbidden:
- Querying shared collections without component_id filters
- Writing to another component’s collection
- Ad-hoc queries created outside adapter or service layers

Allowed:
- Read-only analytics queries (if explicitly documented)
- Aggregations scoped to a single component

---

Schema Evolution
----------------
Because MongoDB is schema-less:
- Schema changes must be backward-compatible where possible
- Code must handle missing or optional fields gracefully

Rules:
- Never assume all documents have the newest fields
- Introduce new fields as optional first
- Avoid destructive schema changes without a migration strategy

If a breaking change is unavoidable, it must be explicitly documented.

---

Data Consistency & Integrity
----------------------------
The platform favors:
- Simplicity
- Predictability
- Demo stability

Rules:
- Avoid multi-document transactions unless absolutely necessary
- Prefer denormalized documents for read-heavy demo use cases
- Keep write paths simple and explicit

Referential integrity is enforced at the application level, not the database.

---

Testing & Validation
--------------------
Recommended practices:
- Mock the database adapter for unit tests
- Use isolated test databases for integration tests
- Validate data shapes with Pydantic models where applicable

Rules:
- Do not test against production databases
- Do not rely on manual data fixes

---

Common Failure Modes (Avoid These)
----------------------------------
- Forgetting component_id filters in shared collections
- Mixing data from multiple components
- Silent schema drift without documentation
- Hardcoding collection names in services
- Leaking database-specific behavior into business logic

---

Relationship to Other Documents
-------------------------------
- ARCHITECTURE.md  
  Defines overall system structure and principles.

- COMPONENTS.md  
  Defines component boundaries and ownership.

- CONNECTIVITY.md  
  Defines how database connections are created and managed.

- API_CONVENTIONS.md  
  Defines how data is exposed via APIs.

- LOCAL_DEV.md  
  Defines local database configuration and startup.

---

Last updated: 2025-12-18
Maintained by the BSG Team
