# BSG Demo Platform - Architecture Documentation

This document describes the current architecture and deployment setup for the BSG Demo Platform.

## Overview

The BSG Demo Platform is a full-stack application consisting of a React frontend and FastAPI backend, with data stored in Azure Cosmos DB (MongoDB API).

---

## LOCAL (Windows Machine)

### Frontend (React/Vite)

- **Port**: 3000
- **Process**: Node.js
- **Type**: Development server running directly on your machine
- **Framework**: React 18+ with Vite
- **URL**: http://localhost:3000
- **Status**: Running

**To Start:**
```bash
cd frontend
npm run dev
```

### Backend (FastAPI)

- **Port**: 8000
- **Process**: Python
- **Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Type**: Python process running directly (not in container)
- **Framework**: FastAPI (Python)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health
- **Status**: Running and connected to Azure MongoDB

**To Start:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Environment Variables Required:**
```bash
DATABASE_URL=mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@
DATABASE_NAME=bsg_demo
ENVIRONMENT=development
DEBUG=True
```

---

## CLOUD (Azure)

### MongoDB Database (Azure Cosmos DB)

- **Account**: bsg-demo-platform-mongodb
- **Host**: bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255
- **Database**: bsg_demo
- **Resource Group**: bsg-demo-platform
- **Status**: Cloud-hosted, accessible via connection string
- **Type**: Fully managed MongoDB service in Azure
- **API**: MongoDB API (compatible with MongoDB 4.2.0)
- **Connection**: SSL/TLS encrypted

**Collections:**
- `users` - User accounts and authentication
- `user_sessions` - Active user sessions
- `components` - Component definitions
- `content` - Component content
- `videos` - Video metadata and references
- `security_docs` - Security documentation
- `presentations` - Presentation materials

**Connection String:**
```
mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL (Windows Machine)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Frontend   │         │   Backend    │                 │
│  │  React/Vite  │────────▶│   FastAPI    │                 │
│  │  Port: 3000  │  HTTP   │  Port: 8000  │                 │
│  │  Node.js     │         │  Python      │                 │
│  └──────────────┘         └──────┬───────┘                 │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                     │ MongoDB Connection
                                     │ (SSL/TLS)
                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD (Azure)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Azure Cosmos DB (MongoDB API)                │          │
│  │  Account: bsg-demo-platform-mongodb           │          │
│  │  Database: bsg_demo                           │          │
│  │                                                │          │
│  │  Collections:                                  │          │
│  │  • users                                       │          │
│  │  • user_sessions                               │          │
│  │  • components                                  │          │
│  │  • content                                     │          │
│  │  • videos                                      │          │
│  │  • security_docs                               │          │
│  │  • presentations                               │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Service URLs

### Development Environment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health
- **Readiness Probe**: http://localhost:8000/api/v1/ready
- **Liveness Probe**: http://localhost:8000/api/v1/live

---

## Technology Stack

### Frontend
- React 18+
- Vite (build tool)
- TypeScript
- Tailwind CSS
- Axios (HTTP client)

### Backend
- Python 3.11
- FastAPI
- Motor (async MongoDB driver)
- Pydantic v2 (validation)
- Uvicorn (ASGI server)

### Database
- Azure Cosmos DB for MongoDB API
- MongoDB 4.2.0 compatible
- Motor async driver

---

## Data Storage

### MongoDB Collections

1. **users** - User accounts and authentication data
2. **user_sessions** - Active user sessions and refresh tokens
3. **components** - Component definitions and metadata
4. **content** - Component content (slides, explanations, etc.)
5. **videos** - Video metadata and references
6. **security_docs** - Security documentation and materials
7. **presentations** - Presentation materials and slides

---

## Development Workflow

### Starting Services

1. **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Environment Setup

Backend requires the following environment variables (set in PowerShell):
```powershell
$env:DATABASE_URL="mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@"
$env:DATABASE_NAME="bsg_demo"
$env:ENVIRONMENT="development"
$env:DEBUG="True"
```

---

## Notes

- All services run locally for development
- Database is hosted in Azure Cloud
- No Docker containers are currently used (services run as native processes)
- Backend auto-reloads on code changes (development mode)
- Frontend hot-reloads on code changes (Vite dev server)

---

**Last Updated**: November 13, 2025
**Maintained By**: BSG Team

