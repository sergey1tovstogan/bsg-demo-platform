#!/bin/bash
# Complete setup script - Run this once Podman CLI is installed

echo "=========================================="
echo "  Complete Setup: Podman + Database + App"
echo "=========================================="
echo ""

# Check Podman
if ! command -v podman &> /dev/null; then
    echo "ERROR: Podman CLI not found"
    echo ""
    echo "Install Podman CLI:"
    echo "  1. Install Homebrew (requires admin password):"
    echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "  2. Add Homebrew to PATH:"
    echo "     echo 'eval \"\$(/opt/homebrew/bin/brew shellenv)\"' >> ~/.zshrc"
    echo "     source ~/.zshrc"
    echo ""
    echo "  3. Install Podman:"
    echo "     brew install podman"
    echo ""
    echo "  4. Initialize Podman:"
    echo "     podman machine init"
    echo "     podman machine start"
    echo ""
    exit 1
fi

echo "✓ Podman found: $(podman --version)"
echo ""

# Start Podman machine
echo "Starting Podman machine..."
if ! podman machine list | grep -q "running"; then
    podman machine start || {
        echo "Initializing Podman machine..."
        podman machine init
        podman machine start
    }
    sleep 5
fi
echo "✓ Podman machine running"
echo ""

# Start database
echo "Starting database services..."
cd "$(dirname "$0")"

if podman compose version &> /dev/null; then
    podman compose up -d db redis
elif command -v podman-compose &> /dev/null; then
    podman-compose up -d db redis
else
    echo "ERROR: podman compose not found"
    echo "Install with: pip3 install podman-compose"
    exit 1
fi

echo "Waiting for database to be ready..."
sleep 8

# Verify database
if podman exec bsg-db pg_isready -U postgres &> /dev/null; then
    echo "✓ Database is ready!"
else
    echo "Database is starting... (this may take a moment)"
    sleep 5
fi

# Check application
echo ""
echo "Checking application connection..."
sleep 3

for i in {1..10}; do
    response=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null)
    if [ -n "$response" ]; then
        db_status=$(echo "$response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('checks', {}).get('database', {}).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        
        if [ "$db_status" = "healthy" ]; then
            echo "✓ Application successfully connected to database!"
            echo ""
            echo "$response" | python3 -m json.tool 2>/dev/null
            echo ""
            echo "=========================================="
            echo "  Setup Complete!"
            echo "=========================================="
            echo ""
            echo "Services:"
            echo "  - PostgreSQL: localhost:5432"
            echo "  - Redis: localhost:6379"
            echo "  - Application: http://localhost:8000"
            echo "  - API Docs: http://localhost:8000/docs"
            echo "  - Health: http://localhost:8000/api/v1/health"
            exit 0
        fi
    fi
    sleep 2
done

echo "Application connection check completed"
echo "Check status at: http://localhost:8000/api/v1/health"

