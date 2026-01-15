BSG Demo Platform — USER GUIDE

Purpose
-------
This guide provides a **conceptual and functional overview** of the BSG Demo Platform
for users, demo presenters, and solution engineers.

It explains:
- What the platform is
- What each component does
- How the platform is typically used in demos

It does NOT:
- Document architecture rules (see ARCHITECTURE.md)
- Explain local setup steps (see LOCAL_DEV.md)
- Define configuration contracts (see CONFIGURATION.md)

_Last updated: 2025-12-18_

---

Overview
--------
The BSG Demo Platform is a unified environment for showcasing Temenos products,
architectures, and deployment patterns.

It consolidates:
- technical documentation
- demos and visualizations
- architecture explanations
- AI-assisted knowledge access

The platform is designed for **demo stability**, **reusability**, and **clarity**.

---

Platform Components
-------------------
Each platform area is modeled as a component.

Current components include:
- Integration
- Data Architecture
- Deployment
- Security
- Observability
- Design Time
Component rules and ownership:
- COMPONENTS.md

Each component provides:
- curated content
- optional interactive demos
- a dedicated BSG‑Guru chatbot

Component rules and ownership:
- COMPONENTS.md

### RAG JWT Token Management

The RAG (Retrieval Augmented Generation) API requires a JWT token for authentication. You can manage this token in two ways:

**Option 1: Via Settings Modal (Recommended)**
1. Click the **Settings** icon (gear) in the top navigation
2. Scroll to **RAG API JWT Token** section
3. Enter your JWT token (masked by default, click eye icon to show/hide)
4. Click **Update RAG Token**
5. The token is automatically:
   - Sent to the backend and stored in memory
   - Cached in browser localStorage for future sessions
   - Used for all RAG API calls until a new token is provided

**Option 2: Via Environment Variable**
- Set `RAG_JWT_TOKEN` in `backend/.env` file (for local development)
- Set `RAG_JWT_TOKEN` in Azure App Service Configuration (for production)

**Token Status:**
- The Settings modal displays token information:
  - Expiration status (valid/expired)
  - Days remaining until expiration
  - User email and ID
  - Expiration date

**Token Caching:**
- The token is cached in browser localStorage (`bsg_rag_jwt_token` key)
- When you reopen the application, the cached token is automatically loaded and sent to the backend
- This ensures seamless operation even if the token expires, as you can easily update it via the Settings modal

**Note**: The token is never stored in any files on the server. It's only stored:
- In browser localStorage (client-side, user-specific)
- In backend memory (runtime only, lost on restart)

---

Typical Demo Flow
-----------------
A common demo sequence:
1. Start with Integration or Data Architecture
2. Explore documentation and diagrams
3. Run interactive demos (where available)
4. Use BSG‑Guru to answer deep-dive questions
5. Switch to Deployment for Azure analysis

This flow is flexible and adapts to audience needs.

---

BSG‑Guru Chatbot
----------------
BSG‑Guru is an AI-powered assistant scoped to the active component.

Capabilities:
- answers component-specific questions
- uses curated Temenos knowledge
- avoids cross-component confusion

If responses appear incorrect:
- verify configuration
- consult TROUBLESHOOTING.md

---

Azure Deployment Analyzer
-------------------------
The Deployment component can analyze Azure subscriptions to identify Temenos-related resources.

Key concepts:
- read-only analysis
- Managed Identity authentication
- no resource modification

Azure setup details:
- AZURE_CONFIGURATION.md

Known runtime differences:
- Some discovery features behave differently in cloud vs local

**Update RAG JWT Token:**
```bash
curl -X POST http://localhost:8000/api/v1/deployment/temenos/update-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "token": "your-new-jwt-token"
  }'
```

**Get RAG JWT Token Info:**
```bash
curl -X GET http://localhost:8000/api/v1/deployment/temenos/jwt-info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

Security & Data Handling
-----------------------
The platform:
- uses JWT-based authentication
- does not expose secrets to the frontend
- follows least-privilege access principles

Authoritative security rules:
- SECURITY.md

---

Getting More Detail
------------------
For deeper or technical information:
- Architecture: ARCHITECTURE.md
- APIs: API_CONVENTIONS.md
- Data model: DATABASE.md
- Troubleshooting: TROUBLESHOOTING.md

---
Last updated: 2025-12-18
Maintained by the BSG Team
