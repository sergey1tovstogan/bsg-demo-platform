# BSG Demo Platform — DEPLOYMENT (Authoritative)

## Purpose & Scope

This document defines the **deployment architecture and procedures** for the BSG Demo Platform.

It covers:
- Current deployment architecture (Azure Static Web Apps + Azure App Service)
- Automatic deployment via GitHub Actions
- Manual deployment procedures
- Deployment verification and health checks

This document does NOT:
- Define local development setup (see LOCAL_DEV.md)
- Define configuration contracts (see CONFIGURATION.md)
- Replace Azure setup documentation (see providers/AZURE_CONFIGURATION.md)

---

## Current Deployment Architecture

### Production Deployment

**Frontend:**
- **Service**: Azure Static Web Apps
- **Name**: `bsg-demo-platform-4077`
- **URL**: https://kind-beach-01c0a990f.3.azurestaticapps.net
- **Resource Group**: `bsg-demo-platform`
- **Deployment**: Automatic via GitHub Actions on push to `develop` branch

**Backend:**
- **Service**: Azure App Service
- **Name**: `bsg-demo-platform-app`
- **URL**: https://bsg-demo-platform-app.azurewebsites.net
- **API URL**: https://bsg-demo-platform-app.azurewebsites.net/api/v1
- **Resource Group**: `bsg-demo-platform`
- **Deployment**: Automatic via GitHub Actions on push to `develop` branch

**Database:**
- **Service**: Azure Cosmos DB (MongoDB API)
- **Account**: `bsg-demo-platform-mongodb`
- **Database**: `bsg_demo`
- **Resource Group**: `bsg-demo-platform`

---

## Automatic Deployment

### GitHub Actions Workflows

The platform uses two main deployment workflows:

1. **`deploy-static-webapp.yml`** - Frontend deployment
   - Triggers: Push to `develop` branch
   - Steps:
     1. TypeScript type checking
     2. Frontend build
     3. Deploy to Azure Static Web Apps

2. **`deploy-app-service.yml`** - Backend deployment (if enabled)
   - Triggers: Push to `develop` branch
   - Steps:
     1. Backend tests
     2. Package backend
     3. Deploy to Azure App Service

### Deployment Process

1. **Code Push**: Developer pushes to `develop` branch
2. **Workflow Trigger**: GitHub Actions automatically starts
3. **Tests**: TypeScript checks and build tests run
4. **Build**: Frontend/backend are built
5. **Deploy**: Artifacts deployed to Azure
6. **Verification**: Health checks run

### Monitoring Deployments

**GitHub Actions:**
- Go to: https://github.com/georgasa/bsg-demo-platform/actions
- View workflow runs and deployment status

**Azure Portal:**
- Frontend: Azure Portal → Static Web Apps → `bsg-demo-platform-4077` → Deployment history
- Backend: Azure Portal → App Services → `bsg-demo-platform-app` → Deployment Center

---

## Manual Deployment

### Frontend (Static Web Apps)

If automatic deployment fails, you can manually deploy:

```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy using Azure CLI
az staticwebapp deploy \
  --name bsg-demo-platform-4077 \
  --resource-group bsg-demo-platform \
  --app-location frontend/dist \
  --output-location .
```

### Backend (App Service)

```bash
# Package backend
cd backend
zip -r ../backend-deploy.zip . -x "*.git*" -x "*__pycache__*"

# Deploy using Azure CLI
az webapp deployment source config-zip \
  --resource-group bsg-demo-platform \
  --name bsg-demo-platform-app \
  --src ../backend-deploy.zip
```

---

## Deployment Verification

### Health Checks

After deployment, verify services are running:

**Frontend:**
```bash
curl https://kind-beach-01c0a990f.3.azurestaticapps.net
```

**Backend:**
```bash
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/ready
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/live
```

### Expected Responses

- **Health**: `{"status": "healthy", ...}`
- **Ready**: `{"status": "ready", ...}`
- **Live**: `{"status": "alive", ...}`

---

## Configuration

### Environment Variables

Backend App Service requires these environment variables (set in Azure Portal):

- `DATABASE_URL` - MongoDB connection string
- `RAG_JWT_TOKEN` - RAG API JWT token (optional, can be set via Settings UI)
- `RAG_API_URL` - RAG API base URL
- `JWT_SECRET_KEY` - JWT secret for authentication
- `CORS_ORIGINS` - Allowed CORS origins (use `*` for Static Web Apps)
- `ENVIRONMENT` - Set to `production`

### Frontend Configuration

Frontend uses runtime configuration via `config.json`:
- Created automatically during build
- Contains API URL pointing to backend App Service
- Located in `frontend/public/config.json` (copied to `dist/` during build)

---

## Rollback Procedures

### Frontend Rollback

1. Azure Portal → Static Web Apps → `bsg-demo-platform-4077`
2. Go to "Deployment history"
3. Select previous successful deployment
4. Click "Redeploy"

### Backend Rollback

1. Azure Portal → App Services → `bsg-demo-platform-app`
2. Go to "Deployment Center"
3. View deployment history
4. Redeploy previous version

---

## Troubleshooting Deployments

### Deployment Fails in GitHub Actions

**Check:**
1. GitHub Actions logs for specific error
2. TypeScript errors (if frontend deployment)
3. Build errors
4. Azure credentials/secrets configured correctly

**Common Issues:**
- Missing Azure secrets in GitHub repository
- TypeScript compilation errors
- Build timeout (increase timeout in workflow)

### Deployment Succeeds but App Doesn't Work

**Check:**
1. Health endpoints (see Verification section)
2. Backend logs (see DEBUGGING.md)
3. Environment variables configured correctly
4. Database connectivity

**Common Issues:**
- Missing environment variables
- Database connection string incorrect
- CORS misconfiguration

---

## Related Documentation

- **LOCAL_DEV.md** - Local development setup
- **CONFIGURATION.md** - Environment variables and configuration
- **DEBUGGING.md** - How to access and read logs
- **TROUBLESHOOTING.md** - Common issues and solutions
- **providers/AZURE_CONFIGURATION.md** - Azure resource setup

---

Last updated: 2026-01-16
Maintained by the BSG Team
