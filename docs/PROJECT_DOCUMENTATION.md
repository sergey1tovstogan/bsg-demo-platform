# BSG Demo Platform - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Azure Services & Infrastructure](#azure-services--infrastructure)
4. [Codebase Statistics](#codebase-statistics)
5. [Database Architecture](#database-architecture)
6. [RAG API Integration](#rag-api-integration)
7. [EventHub Integration](#eventhub-integration)
8. [Deployment Architecture](#deployment-architecture)
9. [Technology Stack](#technology-stack)
10. [Production Readiness](#production-readiness)

---

## Project Overview

The **BSG Demo Platform** is a production-ready, component-based demonstration platform designed to showcase Temenos products and capabilities. It provides a unified environment where architecture diagrams, technical presentations, videos, and documentation are consolidated and maintained.

### Purpose
- Consolidate all demo artifacts and reference environments into a single, structured repository
- Streamline deployment and configuration processes across multiple environments
- Provide reusable materials such as architecture diagrams, technical presentations, and recorded sessions
- Document best practices, reference architectures, and integration patterns
- Facilitate collaboration among BSG members through shared and versioned resources

### Key Features
- **Component-Based Architecture**: Modular demo components (Data Architecture, Security, Integration, etc.)
- **Real-Time Event Streaming**: Azure EventHub integration for live event monitoring
- **RAG-Powered Chatbot**: AI-powered assistance using Temenos RAG API
- **Multi-Database Support**: MongoDB (Cosmos DB) for application data, MSSQL for external data sources
- **Production-Ready Deployment**: Automated CI/CD with Azure Container Apps and Static Web Apps

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - TypeScript/React 18.2.0                                  │
│  - Vite 5.0.8 build system                                  │
│  - TailwindCSS for styling                                  │
│  - Deployed on Azure Static Web Apps                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (via Static Web Apps rewrite)
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  - Python 3.11                                               │
│  - FastAPI 0.109.0                                           │
│  - Uvicorn/Gunicorn                                          │
│  - Deployed on Azure Container Apps                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼────┐ ┌───────▼──────┐
│   MongoDB    │ │  RAG    │ │   EventHub   │
│ (Cosmos DB)  │ │   API   │ │   (Azure)    │
└──────────────┘ └─────────┘ └──────────────┘
```

### Component Isolation
Each demo domain is implemented as an independent component:
- **Data Architecture**: Event-driven data flow demonstrations
- **Security**: Security framework and best practices
- **Integration**: API integration patterns
- **Deployment**: Deployment strategies and automation
- **Observability**: Monitoring and logging capabilities

### Adapter Pattern
All external connectivity is handled through adapters:
- **Database Adapter**: MongoDB operations abstraction
- **RAG Adapter**: Temenos RAG API integration
- **EventHub Adapter**: Azure EventHub consumer
- **Payment Adapter**: Temenos payment API integration

---

## Azure Services & Infrastructure

### Frontend Deployment: Azure Static Web Apps

**Service**: Azure Static Web Apps  
**Purpose**: Hosts the React frontend application  
**Configuration**:
- **URL**: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
- **Build System**: Vite 5.0.8
- **Framework**: React 18.2.0 with TypeScript
- **Routing**: Client-side routing with React Router
- **API Proxy**: Routes `/api/*` requests to backend Container App

**Key Features**:
- Automatic HTTPS/SSL certificates
- Global CDN distribution
- Custom domain support
- GitHub Actions integration for CI/CD
- API route rewriting to backend services

**Configuration File**: `frontend/staticwebapp.config.json`
```json
{
  "routes": [
    {
      "route": "/api/*",
      "rewrite": "https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/*"
    }
  ]
}
```

### Backend Deployment: Azure Container Apps

**Service**: Azure Container Apps  
**Purpose**: Hosts the FastAPI backend application  
**Configuration**:
- **URL**: `https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`
- **Runtime**: Python 3.11
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn with Gunicorn workers
- **Container Registry**: Azure Container Registry (ACR)

**Key Features**:
- Serverless container hosting
- Auto-scaling based on traffic
- Health checks and liveness probes
- Environment variable management
- Log streaming and monitoring

**Deployment**:
- Container images built and pushed to ACR via GitHub Actions
- Pull-based deployment from ACR
- Automatic health checks on startup

### Database: Azure Cosmos DB (MongoDB API)

**Service**: Azure Cosmos DB with MongoDB API  
**Purpose**: Primary application database  
**Configuration**:
- **Account**: `bsg-demo-platform-mongodb`
- **Host**: `bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255`
- **Database**: `bsg_demo`
- **Resource Group**: `bsg-demo-platform`
- **Mode**: Serverless (cost-optimized)

**Collections**:
- `users`: User accounts and authentication data
- `user_sessions`: Active user sessions
- `components`: Component definitions and metadata
- `content`: Component content and pages
- `videos`: Video metadata and references
- `security_docs`: Security documentation
- `presentations`: Presentation materials
- `cache`: Cached RAG responses with expiration (TTL)
- `settings`: Application settings (RAG tokens, EventHub config)
- `database_connections`: External database connection configurations

**Connection Pooling**:
- Max pool size: 20 connections (optimized for cost)
- Min pool size: 5 connections
- Connection timeout: 30 seconds

### Azure EventHub

**Service**: Azure Event Hubs  
**Purpose**: Real-time event streaming for data architecture demonstrations  
**Configuration**:
- **Namespace**: `bbkeventstoreehnseventstore.servicebus.windows.net`
- **Event Hub**: `modelbank-event-topic`
- **Consumer Group**: `$Default`
- **Buffer Size**: 1000 events

**Usage**:
- Consumes events from Temenos Transact system
- Buffers events for real-time display in frontend
- Provides event health monitoring endpoints
- Supports dynamic configuration via MongoDB settings

**Integration**:
- Backend EventHub adapter consumes events asynchronously
- Events are buffered and served via REST API
- Frontend polls for recent events every 3 seconds
- Events filtered by transaction start time to show only relevant events

### External Database: Azure SQL Database (TDH)

**Service**: Azure SQL Database  
**Purpose**: External data source for Temenos Data Hub (TDH)  
**Configuration**:
- **Server**: `bsgtdh-sql-r2510.database.windows.net`
- **Database**: `ODS` (Operational Data Store) / `SDS` (Structured Data Store)
- **Schema**: `ODS` / `SDS`
- **Authentication**: SQL authentication

**Usage**:
- Queries customer and account data from Temenos ODS
- Used by Data Architecture component for database records display
- Connection details stored in MongoDB `database_connections` collection
- Supports dynamic connection configuration

---

## Codebase Statistics

### Backend (Python/FastAPI)

**Language**: Python 3.11  
**Framework**: FastAPI 0.109.0  
**Total Python Files**: ~118 files  
**Lines of Code**: ~15,000+ lines

**Structure**:
```
backend/
├── app/
│   ├── api/              # API route handlers (15 files)
│   ├── services/         # Business logic services (12 files)
│   ├── adapters/         # External system adapters (4 adapters)
│   ├── models/          # Data models (8 files)
│   ├── middleware/      # Request middleware (5 files)
│   ├── core/            # Core configuration (3 files)
│   └── utils/           # Utility functions (3 files)
├── scripts/             # Utility scripts (24 files)
└── tests/               # Test files (4 files)
```

**Key Dependencies**:
- `fastapi==0.109.0`: Web framework
- `motor==3.3.2`: Async MongoDB driver
- `azure-eventhub==5.11.5`: EventHub integration
- `pydantic==2.5.3`: Data validation
- `python-jose==3.3.0`: JWT authentication

### Frontend (React/TypeScript)

**Language**: TypeScript 5.3.3  
**Framework**: React 18.2.0  
**Build Tool**: Vite 5.0.8  
**Total TypeScript Files**: ~140 files  
**Lines of Code**: ~25,000+ lines

**Structure**:
```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── data-architecture/  # Data Architecture component
│   │   ├── template-sections/ # Template sections
│   │   └── ...
│   ├── services/        # API services
│   ├── hooks/          # React hooks
│   ├── types/          # TypeScript type definitions
│   └── config/         # Configuration files
└── public/            # Static assets
```

**Key Dependencies**:
- `react==18.2.0`: UI framework
- `react-router-dom==6.21.1`: Routing
- `axios==1.6.2`: HTTP client
- `tailwindcss==3.4.0`: Styling
- `framer-motion==12.23.24`: Animations

---

## Database Architecture

### MongoDB (Azure Cosmos DB)

**Purpose**: Primary application database for all application data

**Collections**:

1. **`users`**
   - User accounts and authentication
   - Fields: email, password_hash, role, created_at, updated_at
   - Indexes: email (unique)

2. **`user_sessions`**
   - Active user sessions
   - Fields: user_id, session_token, expires_at, created_at
   - TTL index on expires_at

3. **`components`**
   - Component definitions and metadata
   - Fields: component_id, name, description, category, config
   - Used by frontend to render component pages

4. **`content`**
   - Component content and pages
   - Fields: component_id, page_id, content, metadata
   - Supports markdown and structured content

5. **`videos`**
   - Video metadata and references
   - Fields: video_id, title, url, component_id, metadata

6. **`cache`**
   - Cached RAG responses and component information
   - Fields: cache_key, value, expires_at, created_at
   - TTL index on expires_at for automatic cleanup
   - Reduces RAG API calls by caching responses

7. **`settings`**
   - Application settings
   - Fields: key, value, updated_at
   - Stores: RAG JWT tokens, EventHub configuration

8. **`database_connections`**
   - External database connection configurations
   - Fields: connection_name, config_type, host, database, credentials
   - Used for dynamic MSSQL connection management

9. **`security_docs`** / **`presentations`**
   - Security documentation and presentation materials
   - Fields: document_id, content, metadata

**Connection Management**:
- Connection pooling: 5-20 connections
- Async operations using Motor (async MongoDB driver)
- Automatic reconnection on connection loss
- Connection timeout: 30 seconds

### MSSQL (Azure SQL Database - TDH)

**Purpose**: External data source for Temenos Data Hub

**Databases**:
- **ODS** (Operational Data Store): Customer and account operational data
- **SDS** (Structured Data Store): Structured data warehouse

**Usage**:
- Queries customer records from `FBNK_CUSTOMER` table
- Queries account data from various Temenos tables
- Connection details stored in MongoDB for dynamic configuration
- Used by Data Architecture component for database records display

**Connection**:
- SQL authentication
- Connection string stored in MongoDB `database_connections` collection
- Supports multiple schemas (ODS, SDS)

---

## RAG API Integration

### Temenos RAG API

**Purpose**: AI-powered component identification and chatbot responses

**Service**: Temenos RAG API  
**Base URL**: `https://tbsg.temenos.com` (configurable via `RAG_API_URL`)  
**Authentication**: JWT token (stored in MongoDB `settings` collection)

### Usage Scenarios

1. **Component Identification** (`app/services/temenos_service.py`)
   - Identifies Temenos components from Azure resource names
   - Queries RAG API with component names and aliases
   - Returns component descriptions, capabilities, and architecture details
   - Caches responses in MongoDB `cache` collection

2. **Chatbot Integration** (`app/api/chatbot.py`)
   - Provides AI-powered responses for component-specific questions
   - Uses component-specific RAG model IDs:
     - **Deployment**: `"ModularBanking, TechnologyOverview, SecurityFramework"`
     - **Data Architecture**: `"DataHub, Analytics, TechnologyOverview"`
     - **Security**: `"SecurityFramework, TechnologyOverview"`
     - **Payments**: `"Payments, FuncPaymentsHub, TechnologyOverview"`
   - Returns answers with source citations

3. **Component Info Caching** (`app/services/cache_service.py`)
   - Caches RAG API responses in MongoDB
   - Reduces API calls and improves response time
   - TTL-based expiration for cache entries
   - Cache keys: `component_info:{component_name}`

### Configuration

**Storage**: JWT token stored in MongoDB `settings` collection with key `rag_jwt_token`  
**API Endpoint**: `/api/v1/settings/rag/jwt-token` (POST/GET)  
**Adapter**: `app/adapters/rag/temenos_adapter.py`  
**Service**: `app/services/temenos_service.py`

**Token Management**:
- Token can be updated via Settings API
- Token expiration is detected and reported to users
- Fallback to environment variable `RAG_JWT_TOKEN` if not in database

---

## EventHub Integration

### Azure EventHub Consumer

**Purpose**: Real-time event streaming for Data Architecture demonstrations

**Adapter**: `app/adapters/eventhub/eventhub_adapter.py`  
**Service**: `app/services/data_architecture_service.py`  
**API Endpoints**: `/api/v1/components/data-architecture/events/*`

### Configuration

**Storage**: EventHub configuration stored in MongoDB `settings` collection  
**Fields**:
- `connection_string`: Azure EventHub connection string
- `name`: Event Hub name (default: `modelbank-event-topic`)
- `consumer_group`: Consumer group (default: `$Default`)
- `buffer_size`: Event buffer size (default: 1000)

**API Endpoint**: `/api/v1/settings/eventhub/config` (POST/GET)

### Event Flow

1. **Backend Consumer**:
   - EventHub adapter starts on application startup
   - Consumes events from Azure EventHub asynchronously
   - Buffers events in memory (up to 1000 events)
   - Transforms events to standardized format

2. **Frontend Polling**:
   - Frontend polls `/api/v1/components/data-architecture/events/recent` every 3 seconds
   - Filters events by transaction start time (shows only new events)
   - Displays events in real-time Kafka Event Stream UI

3. **Event Filtering**:
   - Events filtered by `entityid` (customer ID, account ID, etc.)
   - Time window filtering (events after transaction start)
   - Prevents showing historical events when executing new transactions

### Health Monitoring

**Endpoint**: `/api/v1/components/data-architecture/events/health`  
**Returns**:
- Connection status
- Running status
- Events buffered count
- Configuration source (MongoDB or environment)

---

## Deployment Architecture

### CI/CD Pipeline

**Platform**: GitHub Actions  
**Workflows**:
1. **`deploy-static-webapp.yml`**: Frontend deployment to Azure Static Web Apps
2. **`build-push-acr.yml`**: Backend container build and push to ACR
3. **`deploy.yml`**: Backend deployment to Azure Container Apps (pull-based)
4. **`test.yml`**: Automated testing (TypeScript, Python imports)
5. **`security.yml`**: Security scanning

### Deployment Flow

```
GitHub Push (develop branch)
    │
    ├─→ Frontend Build (Vite)
    │   └─→ Deploy to Static Web Apps
    │
    └─→ Backend Build (Docker)
        ├─→ Build container image
        ├─→ Push to Azure Container Registry
        └─→ Deploy to Container Apps (pull-based)
```

### Environment Variables

**Backend (Container Apps)**:
- `DATABASE_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name (`bsg_demo`)
- `RAG_API_URL`: Temenos RAG API URL
- `RAG_JWT_TOKEN`: RAG API JWT token
- `EVENTHUB_CONNECTION_STRING`: EventHub connection string
- `JWT_SECRET_KEY`: JWT signing secret
- `ENVIRONMENT`: `production`
- `DEBUG`: `False`

**Frontend (Static Web Apps)**:
- Built at deployment time
- Runtime configuration via `/public/config.json`
- API URL configured via `staticwebapp.config.json` rewrite rules

---

## Technology Stack

### Backend Stack
- **Language**: Python 3.11
- **Framework**: FastAPI 0.109.0
- **ASGI Server**: Uvicorn 0.27.0, Gunicorn 21.2.0
- **Database**: Motor 3.3.2 (async MongoDB), PyODBC 5.3.0 (MSSQL)
- **Authentication**: Python-JOSE 3.3.0 (JWT)
- **Validation**: Pydantic 2.5.3
- **Azure SDK**: azure-eventhub 5.11.5, azure-identity 1.15.0

### Frontend Stack
- **Language**: TypeScript 5.3.3
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.21.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: TailwindCSS 3.4.0
- **Animations**: Framer Motion 12.23.24
- **Markdown**: React Markdown 10.1.0

### Infrastructure
- **Frontend Hosting**: Azure Static Web Apps
- **Backend Hosting**: Azure Container Apps
- **Database**: Azure Cosmos DB (MongoDB API) - Serverless
- **Event Streaming**: Azure Event Hubs
- **Container Registry**: Azure Container Registry (ACR)
- **CI/CD**: GitHub Actions

---

## Production Readiness

### Security
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Rate limiting (60 req/min, 1000 req/hour)
- ✅ Security headers middleware
- ✅ Environment variable management
- ✅ Secrets stored in Azure Key Vault (via Container Apps)

### Monitoring & Observability
- ✅ Structured JSON logging
- ✅ Health check endpoints (`/api/v1/health`, `/api/v1/live`)
- ✅ EventHub health monitoring
- ✅ Request logging middleware
- ✅ Error handling and reporting

### Scalability
- ✅ Serverless database (Cosmos DB)
- ✅ Auto-scaling container apps
- ✅ Connection pooling (5-20 connections)
- ✅ Event buffering (1000 events)
- ✅ Response caching (MongoDB cache collection)

### Reliability
- ✅ Health checks and liveness probes
- ✅ Automatic reconnection (database, EventHub)
- ✅ Graceful error handling
- ✅ Fallback mechanisms (env vars, in-memory storage)
- ✅ Transaction-based event filtering

### Code Quality
- ✅ TypeScript type checking
- ✅ Python type hints
- ✅ Pydantic data validation
- ✅ ESLint and code formatting
- ✅ Automated testing (pytest, vitest)

### Documentation
- ✅ Comprehensive architecture documentation
- ✅ API documentation (FastAPI auto-generated)
- ✅ Component documentation
- ✅ Deployment guides
- ✅ Troubleshooting guides

---

## Summary

The BSG Demo Platform is a **production-ready**, **fully documented**, and **well-architected** demonstration platform that showcases:

- **Modern Tech Stack**: React 18, FastAPI, TypeScript, Python 3.11
- **Azure-Native**: Static Web Apps, Container Apps, Cosmos DB, EventHub
- **Scalable Architecture**: Serverless database, auto-scaling containers, event-driven design
- **Production Features**: Authentication, caching, monitoring, health checks
- **Developer Experience**: Type safety, comprehensive documentation, CI/CD automation

**Total Lines of Code**: ~40,000+ lines  
**Components**: 5+ demo components  
**API Endpoints**: 50+ REST endpoints  
**Database Collections**: 9+ MongoDB collections  
**External Integrations**: RAG API, EventHub, MSSQL (TDH)

---

*Last Updated: January 2025*  
*Version: 1.0.0*
