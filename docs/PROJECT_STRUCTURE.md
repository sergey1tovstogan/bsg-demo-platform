BSG Demo Platform — PROJECT_STRUCTURE (Authoritative)

Purpose & Scope
---------------
This document describes **where things live** in the BSG Demo Platform repository.
It is a navigation and orientation guide that also defines **file placement expectations**
to keep the codebase maintainable and tool-friendly.

It establishes:
- High-level folder responsibilities
- Where to find code, docs, scripts, and infrastructure
- File placement rules (backend + frontend)

This document does NOT:
- Define architecture principles (see ARCHITECTURE.md)
- Define component boundaries (see COMPONENTS.md)
- Define connectivity or adapter rules (see CONNECTIVITY.md)
- Duplicate documentation content

_Last updated: 2025-12-18_

---

Repository Root Structure
-------------------------
```
bsg-demo-platform/
├── backend/              # FastAPI backend application
├── frontend/             # React frontend application
├── infrastructure/       # CI/CD and deployment infrastructure
├── docs/                 # Authoritative documentation
├── scripts/              # Root-level start/stop utilities
├── tools/                # Development and maintenance tools
├── logs/                 # Runtime logs (git-ignored)
├── .claude/              # Claude configuration
├── .cursor/              # Cursor IDE configuration
├── .github/              # GitHub configuration
├── README.md             # Project entry point
├── .env.example          # Configuration contract (no secrets)
└── .gitignore            # Git ignore rules
```

---

Backend (`/backend`)
--------------------
Contains the FastAPI backend application.

### Key areas
- `app/api/`  
  API route handlers (see API_CONVENTIONS.md)

- `app/services/`  
  Business logic and orchestration  
  (must respect component boundaries — see COMPONENTS.md)

- `app/adapters/`  
  External system adapters (database, RAG, Event Hub, etc.)  
  (rules defined in CONNECTIVITY.md)

- `app/models/`  
  Pydantic request/response and domain models

- `app/middleware/`  
  Request/response middleware (auth, logging, correlation IDs)

- `app/core/`  
  Core configuration and application setup

- `app/utils/`  
  Shared helpers (pure functions preferred, no external connectivity)

### Backend scripts and utilities
- `backend/scripts/`  
  One-off operational scripts (seeders, validators, export helpers)

- `backend/tests/`  
  Automated tests

- `backend/uploads/`  
  Runtime uploads (git-ignored)

- `backend/README.md`  
  Backend-specific notes (if needed)

### Backend file placement rules (MANDATORY)
These rules prevent “floating scripts” and keep structure predictable:

- **No executable scripts directly under `backend/`**
  - Move one-off scripts to `backend/scripts/`
  - Test scripts belong in `backend/tests/`

- **No “loose” modules directly under `backend/app/`**
  - `backend/app/` is a package root only (e.g., `main.py`, `__init__.py`)
  - Functional code MUST live under a subpackage:
    - API → `app/api/`
    - business logic → `app/services/`
    - external systems → `app/adapters/`
    - config/bootstrap → `app/core/`
    - middleware → `app/middleware/`
    - shared helpers → `app/utils/`

- **Seeders and data population**
  - Prefer `backend/scripts/` for runnable seed scripts
  - Keep DB interaction behind adapters (see CONNECTIVITY.md)

---

Frontend (`/frontend`)
----------------------
Contains the React frontend application.

### Key areas
- `src/components/`  
  Reusable UI components

- `src/pages/`  
  Page-level composition and routing

- `src/services/`  
  API client layer (must follow API_CONVENTIONS.md)

- `src/types/`  
  Shared TypeScript types

- `src/utils/`  
  Shared helpers

- `src/assets/`  
  App-bundled images/icons/fonts used by the UI

### Static assets
- `public/`  
  Publicly served static assets (not imported via bundler).  
  Examples: favicons, robots.txt, documentation/specs intended to be fetched as files.

### Frontend file placement rules (MANDATORY)
- **No images/media at the `frontend/` root**
  - UI-used images → `frontend/src/assets/`
  - Public/static files → `frontend/public/` (or a subfolder like `public/images/`)

- **Do not commit build output or dependencies**
  - `dist/` and `node_modules/` must remain git-ignored

- **Specs and documentation artifacts**
  - If the frontend must serve them as files → `public/` (e.g., `public/api-specs/`)
  - Otherwise keep documentation under `/docs`

---

Infrastructure (`/infrastructure`)
----------------------------------
Contains deployment and automation artifacts.

Includes:
- `.github/workflows/` — GitHub Actions CI/CD pipelines
- Shell and batch scripts for deployment or setup

Rules:
- Infrastructure scripts must not embed secrets
- Environment-specific configuration lives in Azure or CI secrets

---

Documentation (`/docs`)
-----------------------
The **single source of truth** for project documentation.

See `docs/README.md` for the documentation index.

Rules:
- Do not duplicate rules across documents
- Link to authoritative docs instead of restating content

---

Scripts (`/scripts`)
--------------------
Root-level utility scripts for local operation.

Includes:
- `start-all.bat` — start frontend & backend
- `stop-all.bat` — stop all services
- `restart-all.bat` — restart all services

These scripts are the canonical local workflow  
(see LOCAL_DEV.md).

---

Tools (`/tools`)
----------------
Developer utilities and maintenance scripts.

Rules:
- Tools must be safe to run locally
- Tools must not access production systems by default

---

Logs (`/logs`)
--------------
Runtime logs directory (git-ignored).

Rules:
- Logs must never be committed
- Logs may be archived locally for debugging
- Production logs are accessed via Azure (see OBSERVABILITY.md)

---

Navigation & Pointers
---------------------
- Entry point: README.md
- Local setup: LOCAL_DEV.md
- Architecture overview: ARCHITECTURE.md
- Component rules: COMPONENTS.md
- Contribution rules: CONTRIBUTING.md

---
Last updated: 2025-12-18
Maintained by the BSG Team