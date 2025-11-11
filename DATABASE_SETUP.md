# Database Setup Guide

## Overview

The BSG Demo Platform uses PostgreSQL and Redis for data storage and caching. These services run in containers managed by Podman or Docker.

## Quick Start

### Start Database Services

The [start.sh](start.sh) script automatically starts the database services:

```bash
./start.sh
```

If you only want to start the databases:

```bash
podman compose up -d db redis
# or
docker compose up -d db redis
```

### Test Connection

```bash
./test-db-connection.sh
```

## Database Configuration

### PostgreSQL

- **Image**: postgres:15-alpine
- **Container**: bsg-db
- **Port**: 5432
- **Database**: bsg_demo
- **User**: postgres
- **Password**: postgres (development only)
- **Connection URL**: `postgresql://postgres:postgres@localhost:5432/bsg_demo`

### Redis

- **Image**: redis:7-alpine
- **Container**: bsg-redis
- **Port**: 6379
- **Connection URL**: `redis://localhost:6379/0`

## Troubleshooting

### Certificate Errors

If you encounter certificate errors when pulling images:

```bash
x509: certificate signed by unknown authority
```

**Solution**: Pull images with TLS verification disabled:

```bash
podman pull --tls-verify=false postgres:15-alpine
podman pull --tls-verify=false redis:7-alpine
```

Then start the services normally:

```bash
podman compose up -d db redis
```

### Check Service Status

```bash
podman compose ps
# or
podman ps
```

### View Logs

```bash
# PostgreSQL logs
podman logs bsg-db

# Redis logs
podman logs bsg-redis

# Follow logs
podman logs -f bsg-db
```

### Connect to Database

```bash
# PostgreSQL
podman exec -it bsg-db psql -U postgres -d bsg_demo

# Redis CLI
podman exec -it bsg-redis redis-cli
```

### Stop Services

```bash
./stop.sh
# or
podman compose down
```

## Database Management

### Backup Database

```bash
podman exec bsg-db pg_dump -U postgres bsg_demo > backup.sql
```

### Restore Database

```bash
podman exec -i bsg-db psql -U postgres -d bsg_demo < backup.sql
```

### Reset Database

```bash
podman compose down
podman volume rm bsg-postgres-data
podman compose up -d db redis
```

## Backend Connection

The backend automatically connects to the database using environment variables from [.env.example](.env.example):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bsg_demo
REDIS_URL=redis://localhost:6379/0
```

For local development, copy `.env.example` to `.env` and customize as needed.

## Production Considerations

**⚠️ Important**: The default configuration is for development only.

For production:

1. Use strong passwords
2. Enable SSL/TLS
3. Configure proper backup strategy
4. Use persistent volumes
5. Implement proper network security
6. Set up monitoring and alerting

See [docker-compose.yml](docker-compose.yml) for service configuration.

---

**Need Help?**

- Test connection: `./test-db-connection.sh`
- View logs: `podman logs bsg-db`
- Check status: `podman compose ps`
