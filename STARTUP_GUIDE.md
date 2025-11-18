# BSG Demo Platform - Startup Guide

This guide explains how to start and manage all components of the BSG Demo Platform.

## Quick Start

### Linux / macOS / WSL

```bash
./start.sh
```

### Windows

```batch
start.bat
```

## Scripts Overview

### Startup Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `start.sh` | Linux/macOS/WSL | Unified startup script for all components |
| `start.bat` | Windows | Windows-compatible startup script |

### Stop Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `stop.sh` | Linux/macOS/WSL | Stops all running services |
| `stop.bat` | Windows | Windows stop script |

## What the Scripts Do

The startup scripts automatically:

1. **Check Dependencies** - Verifies that Node.js, npm, and Python are installed
2. **Start Docker Services** (if `docker-compose.yml` exists) - Starts any required Docker containers
3. **Start Backend** (if present):
   - Frees port 8000 if in use
   - Activates Python virtual environment if available
   - Installs dependencies from `requirements.txt`
   - Starts the backend server on port 8000
4. **Start Frontend** (if present):
   - Frees port 3000 if in use
   - Installs npm dependencies if needed
   - Starts the Vite dev server on port 3000

## Service URLs

Once started, the services will be available at:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs (if FastAPI)

## Logs

All service logs are stored in the `logs/` directory:

- `logs/backend.log` - Backend server output
- `logs/frontend.log` - Frontend dev server output

### Viewing Logs

#### Linux / macOS

```bash
# Follow frontend logs
tail -f logs/frontend.log

# Follow backend logs
tail -f logs/backend.log

# View last 50 lines
tail -n 50 logs/frontend.log
```

#### Windows

```powershell
# Follow frontend logs
Get-Content logs/frontend.log -Wait -Tail 50

# Follow backend logs
Get-Content logs/backend.log -Wait -Tail 50
```

## Stopping Services

### Linux / macOS / WSL

```bash
# Use the stop script
./stop.sh

# Or press Ctrl+C if start.sh is running in foreground
```

### Windows

```batch
# Use the stop script
stop.bat

# Or manually kill processes on ports
taskkill /F /FI "PORTNUMBER eq 3000"
taskkill /F /FI "PORTNUMBER eq 8000"
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

#### Linux / macOS

```bash
# Find and kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Find and kill process on port 8000
lsof -ti :8000 | xargs kill -9
```

#### Windows

```batch
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

### Dependencies Not Found

Make sure you have the required dependencies installed:

- **Node.js** (v16 or higher): https://nodejs.org/
- **Python** (v3.8 or higher): https://www.python.org/
- **Docker** (optional, for containerized services): https://www.docker.com/

### Backend Not Starting

1. Check if Python files exist in the `backend/` directory
2. Check for errors in `logs/backend.log`
3. Verify Python dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Frontend Not Starting

1. Check if `package.json` exists in the `frontend/` directory
2. Check for errors in `logs/frontend.log`
3. Verify npm dependencies are installed:
   ```bash
   cd frontend
   npm install
   ```
4. Clear npm cache if needed:
   ```bash
   cd frontend
   rm -rf node_modules .vite
   npm install
   ```

## Manual Startup

If you prefer to start services manually:

### Backend (Python/FastAPI)

```bash
cd backend

# Activate virtual environment (if exists)
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Or run main.py directly
python main.py
```

### Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Environment Variables

If your services require environment variables, create:

- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables

Example backend `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
DEBUG=true
```

Example frontend `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=BSG Demo Platform
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend changes are automatically reflected in the browser
- Backend changes automatically restart the server (with `--reload` flag)

### API Proxy

The frontend is configured to proxy `/api` requests to the backend:
- Frontend: http://localhost:3000
- API calls to `/api/*` → http://localhost:8000/api/*

This is configured in `frontend/vite.config.ts`.

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Docker Compose

If using Docker Compose for services like PostgreSQL or Redis:

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart postgres
```

## Getting Help

For issues or questions:

1. Check the logs in the `logs/` directory
2. Review this troubleshooting guide
3. Check the main [README.md](README.md)
4. Contact the BSG team

---

**Happy coding!** 🚀
