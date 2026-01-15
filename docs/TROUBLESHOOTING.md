BSG Demo Platform — TROUBLESHOOTING (Authoritative)

Purpose & Scope
---------------
This document provides **incident-driven troubleshooting guidance** for the BSG Demo Platform.

It is intended to answer:
- “Something is broken — where do I look first?”
- “What are the most likely causes?”
- “What is the fastest path to diagnosis?”

This document does NOT:
- Define architecture or rules (see ARCHITECTURE.md, CONNECTIVITY.md)
- Duplicate configuration contracts (see CONFIGURATION.md)
- Replace Azure setup documentation (see AZURE_CONFIGURATION.md)

_Last updated: 2025-12-18_

---

How to Use This Document
-----------------------
1) Identify the symptom closest to what you are seeing  
2) Follow the **diagnostic checklist** in order  
3) Use links to authoritative docs for deeper detail  

Always start with:
- **Health endpoints**
- **Logs**
- **Configuration presence**

---

Quick Health Checks (Always First)
----------------------------------

### Backend health
```bash
curl https://<backend-host>/api/v1/health
```

Expected:
- HTTP 200
- Fast response

If this fails:
- Backend is down, misconfigured, or unreachable
- Check backend logs immediately

### Readiness / Liveness
```bash
curl https://<backend-host>/api/v1/ready
curl https://<backend-host>/api/v1/live
```

Use these to distinguish:
- process down
- dependency unavailable
- partial startup failures

See OBSERVABILITY.md for semantics.

---

Common Incident Scenarios
-------------------------

### Frontend shows “Backend API Not Reachable”
**Most common causes:**
- Backend App Service is stopped
- Incorrect API base URL
- Backend deployment failed
- CORS misconfiguration

**Checklist:**
1) Verify backend is running (Azure Portal → App Service → Overview)
2) Call `/api/v1/health` directly
3) Verify frontend API base URL:
   - Local: `http://localhost:8000/api/v1`
   - Prod: `https://<app>.azurewebsites.net/api/v1`
4) Check backend logs for startup or CORS errors

Related docs:
- LOCAL_DEV.md
- API_CONVENTIONS.md
- SECURITY.md (CORS rules)

---

### Azure Authentication / Authorization Errors
**Symptoms:**
- “Unable to connect to Azure”
- Azure SDK authentication failures
- Resource discovery returning empty results

**Primary cause:**
- Managed Identity not enabled or under‑privileged

**Checklist:**
1) Confirm Managed Identity is enabled on the App Service
2) Verify role assignments at the **subscription level**
3) Restart App Service after identity changes
4) Check backend logs for Azure auth errors

Preferred approach:
- Managed Identity (see AZURE_CONFIGURATION.md)

Fallback:
- Service Principal (only if MI is not viable)

Related docs:
- AZURE_CONFIGURATION.md
- SECURITY.md

---

### AKS Namespace Discovery Returns “No namespaces found”
**What this means:**
- The application could not list namespaces from AKS

**Important context:**
- Local dev works because Azure CLI + kubectl are available
- App Service runtime is more constrained

**Checklist:**
1) Check backend logs for namespace discovery attempts
2) Verify Managed Identity has:
   - “Azure Kubernetes Service Cluster User Role”
3) Confirm kubectl availability (if used as fallback)
4) Prefer Kubernetes Python client over shelling out

If this persists:
- Treat as a **known runtime limitation**
- Do not assume application logic is broken

Related docs:
- CONNECTIVITY.md (adapter rules)
- AZURE_CONFIGURATION.md

---

### RAG / Chatbot Features Not Working
**Symptoms:**
- Chatbot fails silently
- Errors referencing missing tokens

**Checklist:**
1) Verify `RAG_JWT_TOKEN` exists:
   - GitHub Secrets (CI/CD)
   - Azure App Service settings (runtime)
2) Restart App Service after setting secrets
3) Redeploy backend if secrets were added post-deployment
4) Check backend logs for token validation errors

Related docs:
- CONFIGURATION.md
- SECURITY.md

---

### Deployment Succeeds but App Is Broken
**Common causes:**
- Environment variables missing
- Backend restarted without new config
- Frontend build artifacts missing

**Checklist:**
1) Verify App Service Application Settings
2) Restart App Service
3) Confirm static frontend assets exist on backend
4) Review latest GitHub Actions logs

Related docs:
- CONFIGURATION.md
- LOCAL_DEV.md

---

### Slow or Failing Deployments
**Symptoms:**
- GitHub Actions timeouts
- App Service restarts repeatedly

**Checklist:**
1) Review GitHub Actions logs for slow steps
2) Check deployment package size
3) Verify `.deploymentignore` effectiveness
4) Confirm App Service SKU is adequate

Expected timings:
- First deploy: ~10–15 minutes
- Subsequent deploys: ~5–8 minutes

---

Logs & Evidence Collection
--------------------------
Always collect:
- Timestamp
- Request ID / correlation ID
- Exact error message (sanitized)
- Which environment (local / prod)

Where to look:
- Azure App Service → Log stream
- GitHub Actions logs
- Local console output

See OBSERVABILITY.md for logging rules.

---

When to Escalate
----------------
Escalate or open an issue when:
- Health endpoints are green but functionality is broken
- Permissions look correct but Azure APIs still fail
- Behavior differs between identical environments

Include:
- What you expected
- What actually happened
- Logs (sanitized)
- Relevant configuration changes

---

Relationship to Other Documents
-------------------------------
- OBSERVABILITY.md — logging, health, tracing
- CONFIGURATION.md — environment variables
- SECURITY.md — auth & secrets
- CONNECTIVITY.md — adapter rules
- AZURE_CONFIGURATION.md — Azure setup

This document is intentionally procedural and symptom-driven.

---
Last updated: 2025-12-18
Maintained by the BSG Team
