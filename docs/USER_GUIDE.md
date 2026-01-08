# BSG Demo Platform - User Guide

## Table of Contents

1. [Overview](#overview)
2. [Lines of Code](#lines-of-code)
3. [Quick Start](#quick-start)
4. [Running the Application](#running-the-application)
5. [Using the Platform](#using-the-platform)
6. [Azure Configuration](#azure-configuration)
7. [Azure Services Explained](#azure-services-explained)
8. [API Usage](#api-usage)
9. [Environment Variables](#environment-variables)
10. [Troubleshooting](#troubleshooting)
11. [Development Workflow](#development-workflow)
12. [Production Deployment](#production-deployment)

---

## Overview

The **BSG Demo Platform** serves as the central hub for demonstrating Temenos products and capabilities. It provides a unified environment where architecture, deployments, presentations, videos, and technical documentation are consolidated and maintained in one place.

This repository is designed to support the **Business Solution Group (BSG)** in preparing and delivering high-quality demonstrations and proof-of-concepts that highlight the full range of Temenos technologies.

### Project Statistics

- **Total Lines of Code**: 24,551 lines
  - **Backend (Python)**: 12,808 lines (71 files)
  - **Frontend (TypeScript/React)**: 11,743 lines (32 files)
- **Total Files**: 103 source files

---

## Quick Start

### Prerequisites

- **Python 3.11+** installed
- **Node.js 20+** and npm installed
- **Git** for version control
- **Azure CLI** (optional, for Azure deployments)
- **Command Prompt** (Windows) or **Bash** (Linux/Mac)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/georgasa/bsg-demo-platform.git
   cd bsg-demo-platform
   ```

2. **Set up Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up Frontend:**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Environment Variables:**
   
   Create `backend/.env` file:
   ```env
   DATABASE_URL=mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@
   DATABASE_NAME=bsg_demo
   ENVIRONMENT=development
   DEBUG=True
   RAG_JWT_TOKEN=your_jwt_token_here
   RAG_API_URL=https://tbsg.temenos.com
   ```

   **Note**: The RAG JWT token can also be managed via the Settings modal in the application UI. The token is cached in browser localStorage for convenience and automatically synchronized with the backend when the Settings modal is opened.

---

## Running the Application

### Option 1: Using Batch Scripts (Windows)

**Start all services:**
```cmd
restart-all.bat
```

This will:
- Stop any running services
- Start backend on port 8000
- Start frontend on port 3000

**Note**: The ports are configured as:
- Frontend: Port 3000 (configurable in `frontend/vite.config.ts`)
- Backend: Port 8000 (configurable in `backend/app/core/config.py` or via `PORT` environment variable)

### Option 2: Manual Start

**Start Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

### Option 3: Using Individual Batch Scripts

**Start Backend:**
```cmd
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start Frontend:**
```cmd
cd frontend
npm run dev
```

### Accessing the Application

Once both services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

---

## Using the Platform

### Navigation

The platform is organized into **components**, each focusing on a specific Temenos domain:

1. **Integration** - APIs, Events, and Integration patterns
2. **Data Architecture** - Data models, flows, and architecture
3. **Deployment** - Cloud deployments and Azure analysis
4. **Security** - Security documentation and best practices
5. **Observability** - Monitoring and observability tools
6. **Design Time** - Design-time tools and workflows

### Component Features

Each component provides:

- **Content Tab**: Slides, documents, and technical content
- **Demo Tab**: Interactive demonstrations (if available)
- **BSG-Guru Tab**: AI-powered chatbot for component-specific questions

### Deployment Analyzer

The **Deployment** component includes an Azure Deployment Analyzer:

1. Click on **Deployment** component
2. Go to **Demo** tab
3. Click **Connect to Azure**
4. Select your Azure subscription
5. Choose resource groups to analyze
6. View identified Temenos components with detailed information

**Features:**
- Automatic Temenos component identification
- RAG-powered component information (cached for performance)
- Azure resource analysis
- Kubernetes namespace discovery (using Kubernetes Python client library)
- ARM template export for Infrastructure as Code (IaC)
- Cost analysis for resource groups
- RAG JWT token management via Settings modal

### BSG-Guru Chatbot

Access the AI chatbot from any component:

1. Navigate to a component
2. Click **BSG-Guru** tab
3. Ask questions about the component
4. Get answers powered by Temenos RAG knowledge base

**Example Questions:**
- "What are the Temenos cloud architecture models?"
- "How does Temenos support cloud-native deployments?"
- "What are the best practices for deploying Temenos components on Azure?"

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

## Azure Configuration

### Managed Identity Setup

The backend App Service uses a System-Assigned Managed Identity to authenticate to Azure services without managing credentials.

**Steps:**

1. **Navigate to App Service in Azure Portal:**
   - Go to: https://portal.azure.com
   - Navigate to: **App Services** → `bsg-demo-platform-app`

2. **Enable Managed Identity:**
   - Click on **Identity** in the left sidebar
   - Go to **System assigned** tab
   - Toggle **Status** to **On**
   - Click **Save**
   - Wait for the identity to be created (usually 10-30 seconds)

3. **Copy the Principal ID:**
   - After saving, the **Object (principal) ID** will be displayed
   - Copy this ID (e.g., `12e9c273-f0f7-4e0b-bdf8-bf950544d4db`)
   - You'll need this for role assignments

### Role Assignments

#### Subscription-Level Reader Role (Required)

The Managed Identity needs the **Reader** role at the **subscription level** to query Azure resources.

**Why Subscription Level?**
- The application needs to list resource groups across the subscription
- Resource-level or resource-group-level permissions are too restrictive
- Subscription-level Reader role is read-only and safe

**Steps:**

1. **Using Azure CLI:**
   ```bash
   az role assignment create \
     --assignee <principal-id> \
     --role "Reader" \
     --scope /subscriptions/<subscription-id>
   ```

2. **Example:**
   ```bash
   az role assignment create \
     --assignee 12e9c273-f0f7-4e0b-bdf8-bf950544d4db \
     --role "Reader" \
     --scope /subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b
   ```

3. **Using Azure Portal:**
   - Go to: **Subscriptions** → Select your subscription → **Access control (IAM)**
   - Click **Add** → **Add role assignment**
   - **Role**: Select **Reader**
   - **Assign access to**: Select **Managed identity**
   - **Members**: Click **Select members** → Find your App Service → Select it
   - **Scope**: Ensure it's set to **Subscription** level
   - Click **Review + assign**

**Verify the Assignment:**
```bash
az role assignment list \
  --assignee <principal-id> \
  --scope /subscriptions/<subscription-id> \
  --query "[].{Role:roleDefinitionName, Scope:scope, Principal:principalName}"
```

#### AKS Access Configuration (Optional)

If you need to discover AKS namespaces and pods, the Managed Identity needs the **Azure Kubernetes Service Cluster Admin Role** on each AKS cluster.

**Steps:**

1. **Grant Cluster Admin Role:**
   ```bash
   az role assignment create \
     --assignee <principal-id> \
     --role "Azure Kubernetes Service Cluster Admin Role" \
     --scope /subscriptions/<subscription-id>/resourceGroups/<aks-resource-group>/providers/Microsoft.ContainerService/managedClusters/<cluster-name>
   ```

2. **Example:**
   ```bash
   az role assignment create \
     --assignee 12e9c273-f0f7-4e0b-bdf8-bf950544d4db \
     --role "Azure Kubernetes Service Cluster Admin Role" \
     --scope /subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b/resourceGroups/modulartest3/providers/Microsoft.ContainerService/managedClusters/transact
   ```

**Why Cluster Admin Role?**
- The application needs to call `list_cluster_admin_credentials()` to get the kubeconfig
- This requires the "Azure Kubernetes Service Cluster Admin Role" permission
- The kubeconfig is used to authenticate with the Kubernetes API (not for actual cluster admin operations)

### Environment Variables

#### Required Environment Variables

These should be set in Azure App Service **Configuration** → **Application settings**:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MongoDB connection string | Yes | `mongodb://...` |
| `DATABASE_NAME` | Database name | No | `bsg_demo` |
| `RAG_JWT_TOKEN` | JWT token for Temenos RAG API | No | `eyJhbGc...` |
| `RAG_API_URL` | Temenos RAG API base URL | No | `https://tbsg.temenos.com` |
| `ENVIRONMENT` | Environment name | No | `production` |
| `DEBUG` | Debug mode | No | `False` |

#### Setting Environment Variables

**Using Azure Portal:**
1. Go to: **App Services** → `bsg-demo-platform-app` → **Configuration**
2. Click **Application settings** tab
3. Click **+ New application setting**
4. Add each variable with its value
5. Click **Save**
6. **Restart the App Service** for changes to take effect

**Using Azure CLI:**
```bash
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group <resource-group-name> \
  --settings \
    DATABASE_URL="mongodb://..." \
    DATABASE_NAME="bsg_demo" \
    RAG_JWT_TOKEN="eyJhbGc..." \
    ENVIRONMENT="production"
```

**Using GitHub Secrets (for automated deployment):**
- Set secrets in: GitHub → Settings → Secrets and variables → Actions
- Secrets are automatically deployed via GitHub Actions workflow
- See `.github/workflows/deploy-app-service.yml` for details

---

## Azure Services Explained

### Azure Static Web Apps

**Azure Static Web Apps** is a hosting service specifically designed for **static web applications** (frontend applications built with React, Vue, Angular, etc.).

**Key Features:**
- ✅ Static file hosting (HTML, CSS, JavaScript)
- ✅ Global CDN for fast content delivery
- ✅ Automatic SSL certificates
- ✅ GitHub integration for automatic deployment
- ✅ Free tier available

**What It Does NOT Support:**
- ❌ Server-side code execution
- ❌ Database connections
- ❌ API endpoints (unless using Azure Functions)
- ❌ Server-side rendering

**In This Project:**
- **Purpose**: Hosts the React frontend application
- **URL**: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
- **What It Does**: Serves the built React application (HTML, CSS, JavaScript files) via CDN

### Azure App Service

**Azure App Service** is a fully managed platform for hosting **web applications** that need to run server-side code, connect to databases, and handle API requests.

**Key Features:**
- ✅ Multiple languages (Python, Node.js, .NET, Java, etc.)
- ✅ Server-side code execution
- ✅ Database connections
- ✅ API endpoints
- ✅ Environment variables
- ✅ Managed Identity for Azure authentication
- ✅ Scaling (automatic or manual)

**In This Project:**
- **Purpose**: Hosts the FastAPI backend application
- **URL**: `https://bsg-demo-platform-app.azurewebsites.net`
- **What It Does**: Runs the Python FastAPI application, handles all `/api/v1/*` API endpoints, connects to Azure Cosmos DB, uses Managed Identity to authenticate to Azure services

### Why Use Both?

- **Static Web Apps** = Frontend hosting (React, Vue, Angular)
- **App Service** = Backend hosting (FastAPI, Express, ASP.NET)
- **Use both** for optimal performance and cost efficiency
- **Static files** served from CDN (fast, cheap)
- **Backend code** runs on App Service (can execute, connect to databases)

This is a standard pattern for full-stack applications on Azure.

---

## API Usage

### Authentication

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

**Use token in requests:**
```bash
curl -X GET http://localhost:8000/api/v1/components \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Component Content

**Get component content:**
```bash
curl -X GET "http://localhost:8000/api/v1/components/deployment/content?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Azure Deployment Analysis

**Connect to Azure subscription:**
```bash
curl -X POST http://localhost:8000/api/v1/deployment/azure/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "subscription_id": "your-subscription-id"
  }'
```

**Get resource groups:**
```bash
curl -X GET "http://localhost:8000/api/v1/deployment/azure/resource-groups?subscriptionId=your-subscription-id" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

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

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MongoDB connection string | Yes | - |
| `DATABASE_NAME` | Database name | No | `bsg_demo` |
| `ENVIRONMENT` | Environment (dev/staging/production) | No | `development` |
| `DEBUG` | Debug mode | No | `False` |
| `RAG_JWT_TOKEN` | JWT token for Temenos RAG API | No | - |
| `RAG_API_URL` | Temenos RAG API base URL | No | `https://tbsg.temenos.com` |
| `JWT_SECRET_KEY` | Secret key for JWT signing | No | Auto-generated |
| `PORT` | Backend port | No | `8000` |

**Note**: The RAG JWT token can be updated at runtime via the Settings modal in the UI or via the `/api/v1/deployment/temenos/update-token` endpoint. The token is cached in browser localStorage for convenience.

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | `/api/v1` |

**Note**: In production, `VITE_API_URL` is set during build to point to Azure App Service.

---

## Troubleshooting

### Azure Authentication Issues

If you see "Unable to connect to Azure" errors when using the web app, check:

1. **Managed Identity is enabled** in Azure Portal
2. **Reader role is assigned** at subscription level
3. **App Service is restarted** after configuration
4. **Backend logs** for specific error messages

### Network Error - Backend API Not Reachable

**Check if backend is deployed:**
```bash
az webapp show \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "{state: state, defaultHostName: defaultHostName}"
```

**Verify backend URL:**
- **Production**: `https://bsg-demo-platform-app.azurewebsites.net/api/v1`
- **Local**: `http://localhost:8000/api/v1` (updated from 8001)

**Check GitHub Secrets:**
- `AZURE_CREDENTIALS`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `RAG_JWT_TOKEN`
- `DATABASE_URL`

**Test backend directly:**
```bash
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health
```

### Backend Won't Start

**Check Python version:**
```bash
python --version  # Should be 3.11+
```

**Check dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Check port availability:**
```bash
# Windows
netstat -ano | findstr :8000

# Check if port 3000 is available for frontend
netstat -ano | findstr :3000
```

### Frontend Won't Start

**Check Node.js version:**
```bash
node --version  # Should be 20+
```

**Clear node_modules and reinstall:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

**MongoDB Location:**
- The application uses **Azure Cosmos DB** with **MongoDB API**
- Database is hosted in Azure cloud, not locally
- Connection string format: `mongodb://account:password@host:port/?ssl=true&replicaSet=globaldb&...`
- Database name: `bsg_demo`

**Verify connection string format:**
- Must include SSL parameters for Azure Cosmos DB
- Check for special characters in password
- Ensure replica set is specified (`replicaSet=globaldb`)

**Client-Side Storage (localStorage):**
- The application uses browser **localStorage** for client-side data storage
- localStorage is browser-specific and stored on the user's machine
- Data persists until the user clears browser data or uses a different browser
- Used for: RAG token caching, theme preferences, selected categories, Azure subscription ID caching
- **Note**: localStorage is separate from MongoDB. MongoDB stores server-side persistent data, while localStorage stores client-side user preferences.

### CORS Errors

**Check backend CORS configuration:**
- Backend allows `http://localhost:3000` by default (updated from 3001)
- For production, ensure Azure Static Web Apps domain is in CORS origins
- Check `backend/app/core/config.py` for CORS settings

### AKS Namespace Discovery Issues

The application now uses the Kubernetes Python client library (no kubectl required) for AKS namespace discovery. If it fails:

1. **Verify Managed Identity** has "Azure Kubernetes Service Cluster Admin Role" on each AKS cluster
2. **Check backend logs** for specific error messages
3. **Verify cluster credentials** can be retrieved

---

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Frontend: Edit files in `frontend/src/`
   - Backend: Edit files in `backend/app/`

3. **Test locally:**
   - Start both services
   - Test your changes
   - Check for errors in console/logs

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

**Python (Backend):**
- Follow PEP 8
- Use type hints
- Write docstrings
- Use Pydantic v2 for validation

**TypeScript (Frontend):**
- Follow ESLint configuration
- Use TypeScript types
- Write JSDoc comments
- Use Tailwind CSS for styling

---

## Production Deployment

### Azure Deployment

The platform is automatically deployed to Azure via GitHub Actions:

- **Frontend**: Deploys to Azure Static Web Apps on push to `develop`
- **Backend**: Deploys to Azure App Service on push to `develop`

**Deployment Performance (Optimized):**
- **SCM wait time**: Reduced from 60s to 10s initial + smart polling (3s intervals, max ~55s)
- **Health check**: Optimized from 90s to 30s initial + smart polling (3s intervals)
- **Package optimization**: Enhanced `.deploymentignore` excludes unnecessary files (tests, docs, scripts)
- **Build optimization**: Pre-built package deployment (no Oryx build during deployment)
- **Dependency caching**: Pip and npm caches used for faster installation
- **Expected improvement**: ~3-5 minutes faster overall deployment time

**Manual deployment:**
- See `.github/workflows/` for workflow definitions
- Ensure GitHub Secrets are configured:
  - `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - `AZURE_CREDENTIALS`
  - `RAG_JWT_TOKEN`
  - `DATABASE_URL`

### Environment Configuration

**Azure App Service Settings:**
- Set environment variables in Azure Portal
- Or use Azure CLI:
  ```bash
  az webapp config appsettings set \
    --name bsg-demo-platform-app \
    --resource-group bsg-demo-platform \
    --settings DATABASE_URL="..." RAG_JWT_TOKEN="..."
  ```

---

## Getting Help

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **RAG Token Management**: Available via Settings modal in the UI
- **Architecture Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Project Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Issues**: Create an issue on GitHub

---

**Last Updated**: November 2025  
**Maintained By**: BSG Team

