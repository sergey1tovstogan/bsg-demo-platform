# BSG Demo Platform — CONFIGURATION (Authoritative)

This document defines the **configuration contract** for the BSG Demo Platform:
- which environment variables exist
- which are required vs optional
- what each variable controls
- where configuration is set (local `.env`, Azure App Service settings, GitHub Actions secrets)

> **Rules**
> - Do **not** commit real secrets (connection strings, tokens) to Git.
> - `.env.example` documents *names and shapes*; `.env` holds real values.
> - If behavior/config/setup changes, update this doc and `.env.example` (Definition of Done).

_Last updated: 2025-12-18_

---

## Configuration Sources & Precedence

### Local development
- Create a `.env` file in the **repo root**
- Copy from `.env.example` and override values

### Azure App Service (runtime)
- Set variables in **App Service → Configuration → Application settings**
- Restart the App Service after changes

### GitHub Actions (CI/CD)
- Store production secrets in **GitHub → Settings → Secrets and variables → Actions**
- GitHub Actions workflows inject these into the deployment pipeline

---

## Baseline Local Variables (`.env.example`)

> **Note**: The current `.env.example` contains a literal `...` line, which indicates the file is incomplete as a full contract.
> Until that placeholder is removed and replaced with explicit variables, the list below is only the *visible* subset.

### Application & API
- `APP_NAME` (default: `BSG Demo Platform`)
- `APP_VERSION` (default: `1.0.0`)
- `ENVIRONMENT` (default: `development`) — valid values: `development`, `staging`, `production`
- `DEBUG` (default: `True`) — use `False` in production

- `API_V1_PREFIX` (default: `/api/v1`)
- `HOST` (default: `0.0.0.0`)
- `PORT` (default: `8000`)

### Database
- `DATABASE_URL` (example: `postgresql://...`)
  - **Important**: the project documentation and cloud deployment describe Azure Cosmos DB (MongoDB API).
  - Treat `DATABASE_URL` as the **single database connection string** and ensure it matches the active database adapter.
  - See `docs/DATABASE.md` for the authoritative runtime database expectation.

Database pool settings (only relevant for SQLAlchemy-style pools / SQL backends):
- `DB_POOL_SIZE` (default: `50`)
- `DB_MAX_OVERFLOW` (default: `10`)
- `DB_POOL_TIMEOUT` (default: `30`)
- `DB_ECHO` (default: `False`)

Optional MSSQL settings (used only if an MSSQL adapter/connector exists in the repo):
- `MSSQL_HOST`
- `MSSQL_PORT`
- `MSSQL_USER`
- `MSSQL_PASSWORD`

### Rate limiting / caching / media
- `RATE_LIMIT_ENABLED` (default: `True`)
- `RATE_LIMIT_PER_MINUTE` (default: `60`)
- `RATE_LIMIT_PER_HOUR` (default: `1000`)

- `REDIS_URL` (default: `redis://localhost:6379/0`)
- `CACHE_ENABLED` (default: `False`)
- `CACHE_TTL` (default: `300`)

- `VIDEO_STORAGE_PATH` (default: `./uploads/videos`)
- `VIDEO_MAX_SIZE_MB` (default: `500`)
- `VIDEO_ALLOWED_FORMATS` (default: `mp4,mov,avi,webm`)
- `VIDEO_CHUNK_SIZE` (default: `1048576`) — 1MB

### Security / observability
- `BCRYPT_ROUNDS` (default: `12`)
- `PASSWORD_MIN_LENGTH` (default: `8`)
- `SECURE_COOKIES` (default: `True`)
- `METRICS_ENABLED` (default: `True`)
- `TRACING_ENABLED` (default: `False`)
- `HEALTH_CHECK_TIMEOUT` (default: `5`)

---

## Cloud Runtime Variables (Azure App Service)

These variables are explicitly referenced in the Azure configuration documentation and should be treated as the **runtime contract for production**.

### Required / common
- `DATABASE_URL` — MongoDB connection string in production (Cosmos DB MongoDB API)
- `DATABASE_NAME` (default: `bsg_demo`) — database name
- `ENVIRONMENT` (example: `production`)
- `DEBUG` (example: `False`)

### Optional (features)
Temenos RAG / Knowledge API (only if chatbot/RAG component is enabled):
- `RAG_API_URL` — base URL
- `RAG_JWT_TOKEN` — auth token

Azure Event Hub (only if event streaming is enabled):
- `EVENTHUB_CONNECTION_STRING`
- `EVENTHUB_NAME` (default: `modelbank-event-topic`)
- `EVENTHUB_CONSUMER_GROUP` (default: `$Default`)
- `EVENTHUB_BUFFER_SIZE` (default: `1000`)

---

## Recommended Normalization (Next Cleanup Step)

To eliminate ambiguity and reduce team friction:

1. **Remove the literal `...` line from `.env.example`**
2. Ensure `.env.example` includes **all runtime variables** used in:
   - `docs/AZURE_CONFIGURATION.md`
   - `docs/EVENTHUB_CONFIGURATION.md`
   - `docs/DATABASE.md`
3. Keep `.env.example` values as **safe placeholders**, never real secrets.

A good rule: if the backend reads an env var in code, it must appear in `.env.example` and in this document.

---

## Safety & Hygiene

- Never log secrets (connection strings, JWTs)
- Never commit `.env`
- For Azure: prefer App Service settings + GitHub Secrets over embedding values in code

---

## Related Documentation

- `docs/LOCAL_DEV.md` — local run instructions
- `docs/AZURE_CONFIGURATION.md` — Azure App Service + identity + env setup
- `docs/EVENTHUB_CONFIGURATION.md` — Event Hub detailed setup + verification
- `docs/DATABASE.md` — database adapter, collections, and connection expectations