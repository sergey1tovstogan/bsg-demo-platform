# BSG Demo Platform — Deployment Guide

This guide covers how to deploy and run the BSG Demo Platform locally and on Azure.

---

## Local Development

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **MongoDB** connection string (Azure Cosmos DB or local MongoDB)

### Quick Start (Windows)

```cmd
scripts\start-all.bat
```

This starts:
- **Backend** on http://localhost:8000
- **Frontend** on http://localhost:3000

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
- **BSG Guru** uses the production backend (full RAG) when on localhost
- **Deployment Analyzer** uses static fallback when backend is unavailable

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string (required for backend) |
| `RAG_JWT_TOKEN` | Temenos RAG API JWT (optional, for BSG Guru) |
| `RAG_API_URL` | Temenos RAG API base URL |

---

## Azure Deployment

### Production URLs

- **Frontend**: https://demo-platform.bsg.temenos.com
- **Backend**: https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io

### CI/CD

- **Frontend**: GitHub Actions → Azure Static Web Apps (`deploy-staticwebapp.yml`)
- **Backend**: GitHub Actions → Azure Container Apps (`deploy.yml`)

Push to `develop` (or main) to trigger deployment.

### Infrastructure

- **Frontend**: Azure Static Web Apps
- **Backend**: Azure Container Apps
- **Database**: Azure Cosmos DB (MongoDB API)
- **Event Streaming**: Azure Event Hubs (for Data Architecture demo)

---

## Health Checks

- Backend: `GET /api/v1/health`
- Frontend: Served by Azure Static Web Apps

---

For usage instructions, see [USER_GUIDE.md](./USER_GUIDE.md).
