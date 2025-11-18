# Environment Variables Configuration

This document describes the environment variables required for the BSG Demo Platform.

## Required Environment Variables

### Database Configuration

- **`DATABASE_URL`** (Required)
  - MongoDB connection string (Azure Cosmos DB for MongoDB API)
  - Format: `mongodb://username:password@host:port/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@account-name@`
  - Example: `mongodb://bsg-demo-platform-mongodb:password@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@`

- **`DATABASE_NAME`** (Optional, default: `bsg_demo`)
  - Name of the MongoDB database

### RAG Tool Configuration

- **`RAG_JWT_TOKEN`** (Required for RAG features)
  - JWT token for Temenos RAG API authentication
  - Get this from Temenos tbsg.temenos.com
  - Without this, RAG queries will fail gracefully

- **`RAG_API_URL`** (Optional, default: `https://tbsg.temenos.com`)
  - Base URL for the Temenos RAG API

- **`RAG_TYPE`** (Optional, default: `temenos`)
  - RAG provider type (currently only `temenos` is supported)

### Authentication

- **`JWT_SECRET_KEY`** (Required)
  - Secret key for JWT token signing
  - Should be a secure random string (32+ characters)
  - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

- **`JWT_ALGORITHM`** (Optional, default: `HS256`)
  - JWT signing algorithm

### Application Settings

- **`ENVIRONMENT`** (Optional, default: `development`)
  - Environment: `development`, `staging`, or `production`

- **`DEBUG`** (Optional, default: `False`)
  - Enable debug mode (set to `True` for development)

- **`API_V1_PREFIX`** (Optional, default: `/api/v1`)
  - API prefix for all endpoints

### CORS Configuration

- **`CORS_ORIGINS`** (Optional, default: `["http://localhost:3000", "http://localhost:5173"]`)
  - Comma-separated list of allowed CORS origins
  - For production, set to your frontend URL
  - Use `*` to allow all origins (not recommended for production)

## Setting Environment Variables

### Local Development

**The `.env` file is gitignored for security** - you need to create it locally.

1. Create a `.env` file in the `backend/` directory:

```bash
DATABASE_URL=mongodb://...
DATABASE_NAME=bsg_demo
RAG_JWT_TOKEN=your_jwt_token_here
RAG_API_URL=https://tbsg.temenos.com
JWT_SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
DEBUG=True
```

### Azure App Service

Environment variables are set via:

1. **GitHub Secrets** (for CI/CD):
   - `DATABASE_URL`
   - `RAG_JWT_TOKEN`
   - `RAG_API_URL`
   - `JWT_SECRET_KEY`

2. **Azure Portal**:
   - Go to Azure Portal → App Service → Configuration → Application settings
   - Add each environment variable

3. **Azure CLI**:
   ```bash
   az webapp config appsettings set \
     --name bsg-demo-platform-app \
     --resource-group bsg-demo-platform \
     --settings DATABASE_URL="..." RAG_JWT_TOKEN="..." JWT_SECRET_KEY="..."
   ```

### GitHub Actions Secrets

To add secrets to GitHub:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each required secret:
   - `DATABASE_URL`
   - `RAG_JWT_TOKEN`
   - `RAG_API_URL` (optional, has default)
   - `JWT_SECRET_KEY`

## Default Values

All environment variables have defaults defined in `backend/app/core/config.py`. However, for production, you should explicitly set:

- `DATABASE_URL` (required)
- `RAG_JWT_TOKEN` (required for RAG features)
- `JWT_SECRET_KEY` (required for authentication)

## Verification

To verify environment variables are set correctly:

1. **Local**: Check `.env` file exists and contains required variables
2. **Azure**: Use Azure Portal or CLI to list app settings
3. **Runtime**: Check application logs for configuration errors

## Security Notes

- **Never commit** `.env` files or secrets to git
- Use GitHub Secrets for CI/CD
- Rotate `JWT_SECRET_KEY` periodically
- Keep `RAG_JWT_TOKEN` secure and rotate if compromised
- Use Azure Key Vault for production secrets (future enhancement)

