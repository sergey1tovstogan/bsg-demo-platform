# Podman Installation and Database Setup Guide

## Quick Start

Once Podman is installed, run:
```bash
./start-podman-db.sh
```

## Installing Podman on macOS

### Option 1: Install Podman Desktop (Recommended - GUI)

1. Download Podman Desktop from: https://podman-desktop.io/
2. Open the downloaded `.dmg` file
3. Drag Podman Desktop to Applications
4. Launch Podman Desktop from Applications
5. Podman Desktop will automatically set up Podman

### Option 2: Install via Homebrew (Command Line)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Podman
brew install podman

# Initialize and start Podman machine
podman machine init
podman machine start

# Verify installation
podman --version
```

## Starting the Database

After Podman is installed and running:

```bash
# Start database services
./start-podman-db.sh

# Or manually:
podman compose up -d db redis
```

## Verifying Database Connection

The application will automatically connect to:
- **Host**: localhost
- **Port**: 5432
- **Database**: bsg_demo
- **User**: postgres
- **Password**: postgres

Test the connection:
```bash
podman exec -it bsg-db psql -U postgres -d bsg_demo -c "SELECT version();"
```

## Troubleshooting

### Podman machine not running
```bash
podman machine start
```

### Check container status
```bash
podman ps
```

### View database logs
```bash
podman logs bsg-db
```

### Stop services
```bash
podman compose down
```


