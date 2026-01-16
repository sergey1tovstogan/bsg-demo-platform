BSG Demo Platform — USAGE (Quick Reference)

Purpose
-------
This document is a **quick, task-oriented reference** for using the BSG Demo Platform.
It intentionally stays short and links to authoritative documentation instead of duplicating it.

If you are new to the platform, start with USER_GUIDE.md.

_Last updated: 2026-01-16_

---

Quick Start (Local)
-------------------
1. Clone the repository
2. Configure `.env` (see CONFIGURATION.md)
3. Start all services using scripts

Windows (recommended):
```
scripts\restart-all.bat
```

Local endpoints:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

See LOCAL_DEV.md for full setup details.

---

Using the Platform
------------------
The platform is organized into **components**, each representing a Temenos domain.

Common component features:
- Content: documentation and slides
- Demo: interactive demonstrations (where available)
- BSG‑Guru: AI-powered, component-aware chatbot

Authoritative rules for components:
- COMPONENTS.md

---

Deployment Analyzer (High Level)
--------------------------------
The Deployment component allows Azure resource analysis and cost calculation.

Typical flow:
1. Open Deployment component
2. Connect to Azure (select subscription)
3. Select resource groups
4. Optionally enable cost analysis
5. Review detected Temenos components and costs

Features:
- **Component Discovery**: Automatically identifies Temenos microservices from Azure resources
- **Cost Analysis**: Calculate Azure costs per resource group (requires "Cost Management Reader" role)
- **RAG Integration**: Detailed component information from Temenos knowledge base
- **Architecture Overview**: Azure and AWS deployment patterns in compact sub-cards

Notes:
- Azure permissions and Managed Identity setup are required
- Cost calculation requires "Cost Management Reader" role on subscription
- AKS namespace discovery may differ between local and cloud runtimes

See:
- DEPLOYMENT.md - Deployment procedures
- DEBUGGING.md - How to access logs for troubleshooting
- providers/AZURE_CONFIGURATION.md - Azure setup
- TROUBLESHOOTING.md - Common issues

---

API Usage (Minimal)
-------------------
Authentication uses JWT Bearer tokens.

Example:
```
GET /api/v1/components
Authorization: Bearer <token>
```

Full API rules:
- API_CONVENTIONS.md
- OpenAPI: /docs endpoint

---

When to Use This Document
------------------------
Use this file when you need:
- A quick reminder of how to run or access the platform
- A high-level overview of platform capabilities

For details, always follow links to authoritative docs.

---
Last updated: 2026-01-16
Maintained by the BSG Team
