#!/bin/bash

# Complete script: Wait for Podman machine, start database, and connect application

export PATH="$HOME/.local/bin:$PATH:$HOME/Library/Python/3.9/bin"

echo "=========================================="
echo "  Starting Database & Connecting Application"
echo "=========================================="
echo ""

# Check Podman CLI
if ! command -v podman &> /dev/null; then
    echo "ERROR: Podman CLI not found"
    exit 1
fi

echo "✓ Podman found: $(podman --version)"
echo ""

# Wait for Podman machine to be running
echo "Waiting for Podman machine to start..."
MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if podman ps &> /dev/null 2>&1; then
        echo "✓ Podman machine is running!"
        break
    fi
    echo -n "."
    sleep 2
    WAITED=$((WAITED + 2))
done

if ! podman ps &> /dev/null 2>&1; then
    echo ""
    echo "ERROR: Podman machine is not running after ${MAX_WAIT} seconds"
    echo ""
    echo "Please start Podman machine from Podman Desktop:"
    echo "  1. Open Podman Desktop"
    echo "  2. Go to Machines or Settings"
    echo "  3. Start the podman-machine-default machine"
    echo ""
    echo "Then run this script again: ./start-podman-database.sh"
    exit 1
fi

echo ""
echo "Starting database container..."
cd "$(dirname "$0")"

# Start database
if podman-compose version &> /dev/null || command -v podman-compose &> /dev/null; then
    podman-compose up -d db 2>&1 | grep -v "WARNING" || true
else
    echo "ERROR: podman-compose not found"
    exit 1
fi

echo ""
echo "Waiting for database to be ready..."
sleep 5

# Check if container is running
if ! podman ps --filter "name=bsg-db" --format "{{.Names}}" | grep -q "bsg-db"; then
    echo "ERROR: Database container failed to start"
    echo "Check logs: podman logs bsg-db"
    exit 1
fi

echo "✓ Database container is running"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to accept connections..."
for i in {1..30}; do
    if podman exec bsg-db pg_isready -U postgres &> /dev/null 2>&1; then
        echo "✓ PostgreSQL is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: bsg_demo"
echo "  User: postgres"
echo "  Password: postgres"
echo ""

# Test application connection
echo "Testing application connection..."
sleep 3

for i in {1..15}; do
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
            echo "Services running:"
            echo "  - PostgreSQL: localhost:5432"
            echo "  - Application: http://localhost:8000"
            echo "  - API Docs: http://localhost:8000/docs"
            echo "  - Health: http://localhost:8000/api/v1/health"
            exit 0
        elif [ "$db_status" != "unknown" ]; then
            echo "Database status: $db_status (checking again...)"
        fi
    fi
    sleep 2
done

echo "Application connection check completed"
echo "Check status at: http://localhost:8000/api/v1/health"
