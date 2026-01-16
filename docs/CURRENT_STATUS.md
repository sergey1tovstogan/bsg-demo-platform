# Current Deployment Status

## What's Currently Deployed

### ✅ Production Deployment (Active)

1. **Azure Static Web Apps** (Frontend)
   - Name: `bsg-demo-platform-4077`
   - URL: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
   - Status: ✅ **ACTIVE**
   - Deployment: Automatic via GitHub Actions (`deploy-static-webapp.yml`)
   - Triggers: Push to `develop` branch

2. **Azure App Service** (Backend)
   - Name: `bsg-demo-platform-app`
   - URL: `https://bsg-demo-platform-app.azurewebsites.net`
   - API URL: `https://bsg-demo-platform-app.azurewebsites.net/api/v1`
   - Status: ✅ **ACTIVE**
   - Deployment: Automatic via GitHub Actions (when enabled)
   - Resource Group: `bsg-demo-platform`

3. **Azure Cosmos DB** (MongoDB API)
   - Account: `bsg-demo-platform-mongodb`
   - Database: `bsg_demo`
   - Status: ✅ **ACTIVE**
   - Resource Group: `bsg-demo-platform`

---

## Current Architecture

```
┌─────────────┐
│   GitHub    │
│   Actions   │───▶ Azure Static Web Apps (Frontend)
│             │      https://kind-beach-01c0a990f.3.azurestaticapps.net
│             │
│             │───▶ Azure App Service (Backend)
│             │      https://bsg-demo-platform-app.azurewebsites.net
└─────────────┘
```

**Deployment Flow:**
1. Push to `develop` branch
2. GitHub Actions triggers automatically
3. Frontend: TypeScript check → Build → Deploy to Static Web Apps
4. Backend: Tests → Package → Deploy to App Service (if enabled)

**See DEPLOYMENT.md for detailed deployment procedures.**

---

## Resource Group Contents

**All in `bsg-demo-platform` resource group:**
- ✅ `bsg-demo-platform-app` (App Service) - Backend API
- ✅ `bsg-demo-platform-4077` (Static Web App) - Frontend
- ✅ `bsg-demo-platform-mongodb` (Cosmos DB) - Database

---

**Last Updated**: 2026-01-16
