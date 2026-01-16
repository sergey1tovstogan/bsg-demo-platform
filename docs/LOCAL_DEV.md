BSG Demo Platform — LOCAL_DEV (Authoritative)

Purpose & Scope
---------------
This document defines the **single canonical way** to run the BSG Demo Platform locally.

It covers:
- Local prerequisites
- Environment configuration
- How to start, stop, and restart services
- Common local development endpoints
- Local-only troubleshooting guidance

This document does NOT:
- Describe cloud/Azure setup (see AZURE_CONFIGURATION.md)
- Define architecture or component rules (see ARCHITECTURE.md, COMPONENTS.md)
- Define API conventions or database rules

If local behavior differs from this document, the document must be updated.

---

Supported Local Environment
---------------------------
Primary supported local environment:
- **Windows**
- Using provided `.bat` scripts

macOS/Linux:
- Not officially standardized
- Manual startup may work but is not guaranteed
- Scripts are Windows-focused

---

Prerequisites
-------------
Ensure the following are installed locally:

- **Git**
- **Node.js** (LTS recommended)
- **npm** (bundled with Node.js)
- **Python 3.10+**
- **pip**
- **Virtual environment support** (venv)

Optional but useful:
- MongoDB client tools
- curl or HTTP client
- VS Code

---

Repository Setup
----------------
Clone and enter the repository:

```bash
git clone <repository-url>
cd bsg-demo-platform
```

---

Environment Configuration
-------------------------
Local configuration is driven by environment variables.

### Step 1: Create local .env file

Copy the example file:

```bash
copy .env.example .env
```

or manually create `.env` in the repository root.

### Step 2: Configure required variables

Edit `.env` and provide values for required variables.
Do NOT commit `.env` to version control.

The `.env.example` file is the authoritative reference for:
- variable names
- which values are required vs optional

(See CONFIGURATION.md for a full variable reference.)

---

Starting the Platform (Local)
-----------------------------

### Recommended Method (Windows)

Use the provided script:

```bat
scripts\start-all.bat
```

This script is responsible for:
- starting the backend (FastAPI)
- starting the frontend (React dev server)
- ensuring processes run concurrently

### Manual Startup (If Needed)

Backend:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Manual startup is intended for debugging only.
The scripts remain the source of truth.

---

Stopping the Platform
---------------------

To stop all running services:

```bat
scripts\stop-all.bat
```

This ensures:
- backend process is stopped
- frontend dev server is stopped
- ports are released cleanly

---

Restarting the Platform
-----------------------

To restart everything:

```bat
scripts\restart-all.bat
```

This is equivalent to:
1. stop-all
2. start-all

---

Local Endpoints
---------------

Frontend:
- http://localhost:3000

Backend API:
- http://localhost:8000
- OpenAPI / Swagger UI: http://localhost:8000/docs

Health endpoints:
- http://localhost:8000/api/v1/health
- http://localhost:8000/api/v1/ready
- http://localhost:8000/api/v1/live

---

Logs (Local)
------------
Local logs are written to:
- console output
- `logs/` directory (git-ignored)

Rules:
- Do not commit logs
- Do not rely on local logs for production debugging

---

Common Local Issues
-------------------

### Ports Already in Use
Symptoms:
- Frontend fails to start
- Backend fails to bind to port

Solution:
- Stop existing processes
- Use stop-all.bat
- Restart with start-all.bat

---

### Environment Variables Not Loaded
Symptoms:
- Backend fails to connect to database
- Authentication errors

Solution:
- Verify `.env` exists in repo root
- Restart services after changing `.env`
- Check variable names carefully

---

### Frontend Cannot Reach Backend
Symptoms:
- API calls fail in browser
- CORS errors

Solution:
- Ensure backend is running on port 8000
- Ensure frontend dev server is running
- Check API base URL configuration

---

Rules & Expectations
--------------------
- Use the scripts as the primary local workflow
- Keep `.env.example` up to date when variables change
- Do not hardcode local-only behavior into code
- Update this document if local setup changes

---

Relationship to Other Documents
-------------------------------
- CONFIGURATION.md  
  Defines environment variables and configuration contracts.

- ARCHITECTURE.md  
  Defines system structure and principles.

- CONNECTIVITY.md  
  Defines how external systems are accessed.

- TROUBLESHOOTING.md  
  Defines common runtime issues beyond local-only setup.

---

Last updated: 2026-01-16
Maintained by the BSG Team