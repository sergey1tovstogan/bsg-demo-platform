BSG Demo Platform — AZURE CONFIGURATION (Authoritative)

Purpose & Scope
---------------
This document defines how the BSG Demo Platform is configured and operated **in Azure**.

It focuses on:
- Azure services used at runtime
- Identity and permission setup
- Where configuration is applied
- How to verify a correct Azure deployment

This document is **operational**.
It intentionally does NOT:
- Define architecture or design decisions (see ARCHITECTURE.md)
- Define adapter rules (see CONNECTIVITY.md)
- Define configuration contracts or env var meanings (see CONFIGURATION.md)
- Duplicate troubleshooting flows (see TROUBLESHOOTING.md)

_Last updated: 2025-12-18_

---

Azure Runtime Overview
---------------------
The platform is deployed using a simple, managed Azure setup optimized for demos.

Primary runtime services:
- **Azure App Service** — backend (FastAPI)
- **Azure Static Web Apps** (or App Service static hosting) — frontend
- **Azure Cosmos DB (MongoDB API)** — primary database
- **Azure Event Hub** — event streaming (core feature)

Supporting services:
- Azure Resource Manager (ARM)
- Azure Monitor / Logs

Conceptual explanation of *why* these services are used:
- See AZURE_SERVICES_EXPLAINED.md

---

Identity & Authentication
-------------------------
### Managed Identity (Preferred)

The backend App Service uses **System-Assigned Managed Identity**.

Why:
- No secrets in code or config
- Automatic credential rotation
- Simpler security posture

Required steps:
1) Enable System-Assigned Managed Identity on the App Service
2) Assign required roles to this identity
3) Restart the App Service after changes

Managed Identity is the default and preferred approach for:
- Azure resource discovery
- Event Hub access (where supported)
- Secure service-to-service calls

---

### Service Principals (Fallback Only)

Service principals may be used only when:
- Managed Identity is not supported by a dependency
- Local tooling explicitly requires it

Rules:
- Store credentials in Azure App Service settings or GitHub Secrets
- Never commit them to Git
- Clearly document why Managed Identity could not be used

---

Azure Permissions & Roles
------------------------
Assign roles using **least privilege** principles.

Common required roles:

Backend App Service identity:
- **Reader** — subscription/resource-group discovery
- **Azure Event Hubs Data Receiver** — consume events
- **Azure Event Hubs Data Sender** — publish events
- **Cosmos DB Account Reader Role** (or equivalent) — metadata access

If AKS discovery is enabled:
- **Azure Kubernetes Service Cluster User Role**

Rules:
- Prefer role assignment at the smallest possible scope
- Avoid Contributor/Owner unless explicitly required
- Document any non-standard role assignments

---

Configuration Application
-------------------------
Azure configuration is applied via:

### App Service → Configuration → Application settings
- Runtime environment variables
- Secrets (connection strings, tokens)

Rules:
- Variable names must match CONFIGURATION.md
- Restart App Service after any change
- Never rely on partial restarts

### GitHub Actions (CI/CD)
- Secrets injected at build/deploy time
- No secrets checked into workflows

See:
- CONFIGURATION.md
- CONTRIBUTING.md

---

Database (Cosmos DB)
-------------------
Runtime expectations:
- Azure Cosmos DB using MongoDB API
- TLS/SSL connections only
- Access via database adapter

Rules:
- Do not expose connection strings in logs
- Do not hardcode database names or hosts
- Use environment variables exclusively

Schema and collection rules:
- See DATABASE.md

---

Event Hub Configuration (High Level)
-----------------------------------
Event Hub is a **core platform capability**.

Azure-side expectations:
- Event Hub namespace exists
- Required hubs and consumer groups are created
- Appropriate access is granted to backend identity

Details:
- EVENTHUB.md (authoritative provider doc)

Rules:
- Never document real SAS keys or connection strings
- Prefer Managed Identity where supported

---

Frontend Hosting
----------------
The frontend is hosted using:
- Azure Static Web Apps, or
- Static content served by App Service

Rules:
- Frontend must communicate only with backend APIs
- Backend base URL must be configured explicitly
- CORS must be restricted in production

See:
- SECURITY.md
- API_CONVENTIONS.md

---

Verification Checklist
----------------------
After deployment, verify:

1) Backend
- App Service is running
- `/api/v1/health` returns HTTP 200
- Logs show clean startup

2) Identity
- Managed Identity is enabled
- Role assignments are effective

3) Configuration
- Required env vars exist
- App Service was restarted after changes

4) Event Hub
- Adapter initializes successfully
- Consumer group is correct
- Events are visible in logs or demo UI

5) Frontend
- Frontend loads
- API calls succeed without CORS errors

For failures:
- Use TROUBLESHOOTING.md

---

What We Explicitly Avoid
-----------------------
- Hardcoding Azure resource names in code
- Relying on Azure CLI tools at runtime
- Embedding secrets in docs or scripts
- Treating Azure setup as “tribal knowledge”

---

Relationship to Other Documents
-------------------------------
- CONFIGURATION.md
  Environment variable contract.

- CONNECTIVITY.md
  Adapter-only access to external systems.

- EVENTHUB.md
  Event Hub provider specifics.

- SECURITY.md
  Identity, secrets, and access rules.

- OBSERVABILITY.md
  Logs and health signals.

- TROUBLESHOOTING.md
  Incident handling.

---

Last updated: 2025-12-18
Maintained by the BSG Team