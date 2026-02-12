# BSG Demo Platform

> Production-ready demonstration platform for Temenos products and capabilities.

## Overview

The **BSG Demo Platform** is a component-based demonstration platform for the Business Solution Group (BSG). It consolidates architecture diagrams, technical presentations, videos, and documentation for Temenos technologies.

## Quick Links

| Document | Description |
|----------|-------------|
| [Deployment Guide](./docs/DEPLOYMENT.md) | How to deploy and run locally or on Azure |
| [User Guide](./docs/USER_GUIDE.md) | How to use the platform (navigation, components, demos) |
| [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) | Architecture, Azure services, technical reference |

---

## Quick Start

### Local Development

**Windows:**
```cmd
scripts\start-all.bat
```

**Manual:**
```bash
# Backend (terminal 1)
cd backend && py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

Then open **http://localhost:3000**.

### Production

- **URL**: https://demo-platform.bsg.temenos.com
- Push to `develop` to trigger CI/CD deployment.

---

## Key Features

- **Component-Based**: Integration, Data Architecture, Deployment, Security, Observability, Design Time
- **BSG Guru**: AI-powered chatbot (Temenos RAG API)
- **Deployment Analyzer**: Azure resource analysis and ARM template export
- **Event Streaming**: Live event monitoring for Data Architecture demo

---

## Repository Structure

```
bsg-demo-platform/
├── backend/          # FastAPI backend
├── frontend/         # React + Vite frontend
├── docs/             # Documentation
├── scripts/          # Start/stop scripts
├── infrastructure/   # Azure deployment config
└── templates/       # Content templates
```

---

## Requires

- Node.js 18+
- Python 3.11+
- MongoDB (Cosmos DB or local)

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full deployment instructions.
