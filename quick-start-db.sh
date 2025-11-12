#!/bin/bash

# Quick script to start database once Podman CLI is available
# Run this after Podman Desktop setup is complete

echo "Starting database with Podman..."

# Check if podman is available
if ! command -v podman &> /dev/null; then
    echo "ERROR: Podman CLI not found"
    echo "Please complete Podman Desktop setup first:"
    echo "1. Open Podman Desktop"
    echo "2. Complete the setup wizard"
    echo "3. Ensure Podman machine is running"
    exit 1
fi

# Start Podman machine if not running
if ! podman machine list | grep -q "running"; then
    echo "Starting Podman machine..."
    podman machine start
    sleep 5
fi

# Start database services
cd "$(dirname "$0")"

if podman compose version &> /dev/null; then
    podman compose up -d db redis
elif command -v podman-compose &> /dev/null; then
    podman-compose up -d db redis
else
    echo "ERROR: podman compose not found"
    exit 1
fi

echo "Waiting for database to be ready..."
sleep 5

# Test connection
if podman exec bsg-db pg_isready -U postgres &> /dev/null; then
    echo "✓ Database is ready!"
    echo ""
    echo "Connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: bsg_demo"
    echo "  User: postgres"
    echo "  Password: postgres"
    echo ""
    echo "Your application should now connect automatically!"
else
    echo "Database is starting... it may take a moment"
fi

