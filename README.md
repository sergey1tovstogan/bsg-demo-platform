# BSG Demo Platform

> **Production-Ready**: This is a production-ready, fully documented demonstration platform deployed on Azure.

## Overview

The **BSG Demo Platform** is a production-ready, component-based demonstration platform designed to showcase Temenos products and capabilities. It provides a unified environment where architecture diagrams, technical presentations, videos, and documentation are consolidated and maintained in one place.

This repository supports the **Business Solution Group (BSG)** in preparing and delivering high-quality demonstrations and proof-of-concepts that highlight the full range of Temenos technologies, from **Transact** and **Infinity** to supporting microservices and integration layers.

## Quick Links

- **[Project Documentation](./docs/PROJECT_DOCUMENTATION.md)** - Azure services, architecture, code statistics, and technical reference
- **[User Guide](./docs/USER_GUIDE.md)** - How to use the platform (navigation, components, demos, BSG Guru)

---

## Objectives

- Consolidate all demo artifacts and reference environments into a single, structured repository.  
- Streamline deployment and configuration processes across multiple environments and cloud platforms.  
- Provide reusable materials such as architecture diagrams, technical presentations, and recorded sessions.  
- Document best practices, reference architectures, and integration patterns.  
- Facilitate collaboration among BSG members through shared and versioned resources.

---

## Repository Structure

```
bsg-demo-platform/
├── backend/              # FastAPI backend application
├── frontend/             # React frontend application
├── infrastructure/       # Azure deployment infrastructure
├── docs/                 # Documentation files
├── scripts/              # Start/Stop all scripts
├── tools/                # Development tools and utilities
├── .claude/              # Claude AI context (synced with .cursor/rules)
├── design/               # Design files and component specs
└── logs/                 # Application logs (git-ignored)
```

### Key Directories

| Directory | Description |
|-----------|-------------|
| `backend/` | FastAPI backend with API routes, services, adapters, and models |
| `frontend/` | React frontend with components, pages, and services |
| `infrastructure/` | Azure deployment scripts, GitHub Actions workflows |
| `docs/` | Documentation: PROJECT_DOCUMENTATION.md, USER_GUIDE.md |
| `scripts/` | Start/Stop/Restart all services scripts only |
| `tools/` | Development tools, utilities, and other scripts |
| `.claude/` | Claude AI development context (synced with .cursor/rules) |

---


## Architecture

### Current Deployment

**LOCAL (Windows Machine):**

- **Frontend (React/Vite)**
  - Port: 3000
  - Process: Node.js
  - Type: Development server running directly on your machine
  - URL: http://localhost:3000

- **Backend (FastAPI)**
  - Port: 8000
  - Process: Python
  - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
  - Type: Python process running directly (not in container)
  - URL: http://localhost:8000
  - API Docs: http://localhost:8000/docs

**CLOUD (Azure):**

- **Frontend**: Azure Static Web Apps
  - URL: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
  - Technology: React 18.2.0 with TypeScript, Vite 5.0.8
  - Lines of Code: ~25,000+ lines
  - API Proxy: Routes `/api/*` to backend Container App

- **Backend**: Azure Container Apps
  - URL: `https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`
  - Technology: FastAPI 0.109.0, Python 3.11
  - Lines of Code: ~15,000+ lines
  - Container Registry: Azure Container Registry (ACR)

- **Database**: Azure Cosmos DB (MongoDB API) - Serverless
  - Account: `bsg-demo-platform-mongodb`
  - Host: `bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255`
  - Database: `bsg_demo`
  - Resource Group: `bsg-demo-platform`
  - Collections: 9+ collections (users, components, content, cache, settings, etc.)
  - Purpose: Primary application database for all application data

- **Event Streaming**: Azure Event Hubs
  - Namespace: `bbkeventstoreehnseventstore.servicebus.windows.net`
  - Event Hub: `modelbank-event-topic`
  - Purpose: Real-time event streaming for Data Architecture demonstrations
  - Buffer Size: 1000 events

- **External Database**: Azure SQL Database (TDH)
  - Server: `bsgtdh-sql-r2510.database.windows.net`
  - Databases: ODS (Operational Data Store), SDS (Structured Data Store)
  - Purpose: External data source for Temenos Data Hub queries

**MongoDB Collections:**
- `users` - User accounts and authentication
- `user_sessions` - Active user sessions
- `components` - Component definitions
- `content` - Component content
- `videos` - Video metadata and references
- `security_docs` - Security documentation
- `presentations` - Presentation materials
- `cache` - Cached RAG responses and component information (with expiration)

**Client-Side Storage (localStorage):**
The application uses browser localStorage to store user preferences and temporary data:
- `bsg_selected_categories` - Selected component categories
- `bsg_rag_jwt_token` - RAG API JWT token (cached for convenience)
- `lastAzureSubscriptionId` - Last used Azure subscription ID
- `app-theme` - UI theme preference (light/dark)

**Note**: localStorage is browser-based storage that persists data locally on the user's machine. It's separate from MongoDB, which stores server-side persistent data in Azure Cosmos DB.

## Technology Stack

**Frontend**:
- React 18.2.0 with TypeScript 5.3.3
- Vite 5.0.8 build system
- TailwindCSS 3.4.0 for styling
- React Router 6.21.1 for routing
- ~25,000+ lines of TypeScript/React code

**Backend**:
- FastAPI 0.109.0 (Python 3.11)
- Motor 3.3.2 (async MongoDB driver)
- Azure EventHub 5.11.5 for event streaming
- Pydantic 2.5.3 for data validation
- ~15,000+ lines of Python code

**Infrastructure**:
- Azure Static Web Apps (frontend hosting)
- Azure Container Apps (backend hosting)
- Azure Cosmos DB - Serverless (MongoDB API)
- Azure Event Hubs (event streaming)
- Azure Container Registry (container images)
- GitHub Actions (CI/CD)

## Key Features

- ✅ **Component-Based Architecture**: Modular demo components (Data Architecture, Security, Integration, etc.)
- ✅ **Real-Time Event Streaming**: Azure EventHub integration for live event monitoring
- ✅ **RAG-Powered Chatbot**: AI-powered assistance using Temenos RAG API
- ✅ **Multi-Database Support**: MongoDB (Cosmos DB) for application data, MSSQL for external data sources
- ✅ **Production-Ready**: Authentication, caching, monitoring, health checks, CI/CD automation

## Documentation

- **[Project Documentation](./docs/PROJECT_DOCUMENTATION.md)** - Azure services, architecture, code statistics, database, RAG API, EventHub, deployment
- **[User Guide](./docs/USER_GUIDE.md)** - How to use the platform: navigation, components, demos, BSG Guru, settings, troubleshooting

---

## Getting Started

```bash
git clone https://github.com/georgasa/bsg-demo-platform.git
cd bsg-demo-platform
