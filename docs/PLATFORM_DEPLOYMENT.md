# BSG Demo Platform — Deployment & Infrastructure

This guide covers how the platform is deployed, what Azure services it uses, and how to run it locally or in production.

For usage instructions, see **[USER_GUIDE.md](./USER_GUIDE.md)**.

---

## 1. Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://demo-platform.bsg.temenos.com |
| **Backend API** | https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io |

---

## 2. Azure Services Used by the Platform

The platform runs on Azure and uses the following services:

### 2.1 Frontend — Azure Static Web Apps

| Property | Value |
|----------|-------|
| **Service** | Azure Static Web Apps |
| **Purpose** | Hosts the React frontend application |
| **Build** | Vite 5, React 18, TypeScript |
| **API Proxy** | Routes `/api/*` to backend Container App via `staticwebapp.config.json` |

**Features**: Automatic HTTPS, global CDN, custom domain support, GitHub Actions CI/CD.

### 2.2 Backend — Azure Container Apps

| Property | Value |
|----------|-------|
| **Service** | Azure Container Apps |
| **Purpose** | Hosts the FastAPI backend application |
| **Runtime** | Python 3.11, FastAPI, Uvicorn/Gunicorn |
| **Registry** | Azure Container Registry (ACR) |

**Features**: Auto-scaling, health checks, environment variables, log streaming.

### 2.3 Database — Azure Cosmos DB (MongoDB API)

| Property | Value |
|----------|-------|
| **Service** | Azure Cosmos DB with MongoDB API |
| **Purpose** | Primary application database |
| **Mode** | Serverless (cost-optimized) |

**Collections**: `users`, `user_sessions`, `components`, `content`, `videos`, `cache`, `settings`, `database_connections`, `security_docs`, `presentations`.

### 2.4 Event Streaming — Azure Event Hubs

| Property | Value |
|----------|-------|
| **Service** | Azure Event Hubs |
| **Purpose** | Real-time event streaming for Data Architecture demo |
| **Usage** | Consumes events from Temenos Transact, buffers for frontend display |

### 2.5 External Database — Azure SQL (TDH)

| Property | Value |
|----------|-------|
| **Service** | Azure SQL Database |
| **Purpose** | External data source for Temenos Data Hub (ODS/SDS) |
| **Usage** | Queries customer and account data for Data Architecture component |

### 2.6 External APIs

| Service | Purpose |
|---------|---------|
| **Temenos RAG API** | AI-powered BSG Guru chatbot, component identification |
| **Temenos Party/Payment APIs** | Data Architecture transaction simulator |

---

## 3. CI/CD Deployment

### Triggers

- Push to `develop` (or `main`) triggers deployment.

### Workflows

| Workflow | Purpose |
|----------|---------|
| `deploy-staticwebapp.yml` | Frontend → Azure Static Web Apps |
| `build-push-acr.yml` | Backend container → Azure Container Registry |
| `deploy.yml` | Backend → Azure Container Apps (pull-based) |
| `test.yml` | TypeScript and Python checks |

### Flow

```
GitHub Push (develop)
    │
    ├─→ Frontend: Vite build → Deploy to Static Web Apps
    │
    └─→ Backend: Docker build → Push to ACR → Deploy to Container Apps
```

---

## 4. Local Development

### Prerequisites

- **Node.js** 18+ (frontend)
- **Python** 3.11+ (backend)
- **MongoDB** connection string (Azure Cosmos DB or local MongoDB)

### Quick Start (Windows)

```cmd
scripts\start-all.bat
```

Starts backend on http://localhost:8000 and frontend on http://localhost:3000.

### Manual Start

**Backend:**
```bash
cd backend
cp ../.env.example .env
# Edit .env with DATABASE_URL, RAG_API_URL, RAG_JWT_TOKEN
py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Local-Only Mode

When running locally without the backend:

- **Observability** content uses cached/static fallback
- **BSG Guru** uses production backend when on localhost
- **Deployment Analyzer** uses static fallback when backend is unavailable

---

## 5. Environment Variables

### Backend (Container Apps / Local)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string (required) |
| `DATABASE_NAME` | Database name (default: `bsg_demo`) |
| `RAG_API_URL` | Temenos RAG API base URL |
| `RAG_JWT_TOKEN` | Temenos RAG API JWT (optional) |
| `EVENTHUB_CONNECTION_STRING` | Azure Event Hub connection string |
| `JWT_SECRET_KEY` | JWT signing secret |
| `ENVIRONMENT` | `production` or `development` |

### Frontend

- Built at deployment time
- Runtime config via `/public/config.json`
- API routing via `staticwebapp.config.json`

---

## 6. Custom Domain

The platform uses `https://demo-platform.bsg.temenos.com` as the custom domain.

**Azure Configuration:**

1. Azure Portal → Static Web Apps → Custom domains → Add
2. Enter: `demo-platform.bsg.temenos.com`
3. Add CNAME record in DNS: `demo-platform.bsg` → `kind-beach-01c0a990f.3.azurestaticapps.net`
4. Wait for validation

**Code**: CORS and API routing already include the custom domain. No code changes needed.

---

## 7. Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Backend health (database, Azure identity) |
| `GET /api/v1/live` | Liveness probe for Container Apps |
| Frontend | Served by Static Web Apps |

---

## 8. Technology Stack

### Backend

- Python 3.11, FastAPI, Uvicorn/Gunicorn
- Motor (async MongoDB), PyODBC (MSSQL)
- Azure SDK (EventHub, Identity)
- Python-JOSE (JWT), Pydantic

### Frontend

- TypeScript 5, React 18, Vite 5
- React Router, Axios, TailwindCSS
- Framer Motion, React Markdown

---

*For how to use the platform, see **[USER_GUIDE.md](./USER_GUIDE.md)**.*
