# Podman Installation Guide for macOS

## Quick Installation Steps

### Method 1: Podman Desktop (Easiest - No Terminal Required)

1. **Download Podman Desktop:**
   - Visit: https://podman-desktop.io/
   - Click "Download for macOS"
   - Choose the version for Apple Silicon (ARM64) if prompted

2. **Install:**
   - Open the downloaded `.dmg` file
   - Drag Podman Desktop to your Applications folder
   - Open Podman Desktop from Applications
   - Follow the setup wizard (it will install Podman engine automatically)

3. **Verify Installation:**
   ```bash
   podman --version
   ```

### Method 2: Homebrew (Requires Admin Password)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (if needed)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Install Podman
brew install podman

# Initialize Podman machine
podman machine init

# Start Podman machine
podman machine start
```

## After Installation - Start Database

Once Podman is installed, run:

```bash
./start-podman-db.sh
```

Or manually:

```bash
# Start Podman machine (if not running)
podman machine start

# Start database services
podman compose up -d db redis

# Verify services are running
podman ps

# Test database connection
podman exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();"
```

## Troubleshooting

### Podman machine not starting
```bash
podman machine list
podman machine start
```

### Check Podman status
```bash
podman info
```

### View container logs
```bash
podman logs bsg-db
```


