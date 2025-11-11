#!/bin/bash

##############################################################################
# BSG Demo Platform - Database Connection Test
# This script tests connectivity to PostgreSQL and Redis
##############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Database Connection Test${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Determine container runtime
RUNTIME=""
if command -v podman >/dev/null 2>&1; then
    RUNTIME="podman"
elif command -v docker >/dev/null 2>&1; then
    RUNTIME="docker"
else
    print_error "Neither Podman nor Docker found"
    exit 1
fi

print_info "Using container runtime: $RUNTIME"
echo ""

# Test PostgreSQL
print_info "Testing PostgreSQL connection..."
if $RUNTIME exec bsg-db psql -U postgres -d bsg_demo -c "SELECT 1;" >/dev/null 2>&1; then
    VERSION=$($RUNTIME exec bsg-db psql -U postgres -d bsg_demo -t -c "SELECT version();" | head -1 | xargs)
    print_success "PostgreSQL is running"
    echo "   Database: bsg_demo"
    echo "   User: postgres"
    echo "   Port: 5432"
    echo "   Version: $VERSION"
else
    print_error "PostgreSQL connection failed"
    print_info "Make sure the database is running: $RUNTIME compose up -d db"
fi

echo ""

# Test Redis
print_info "Testing Redis connection..."
if $RUNTIME exec bsg-redis redis-cli ping >/dev/null 2>&1; then
    VERSION=$($RUNTIME exec bsg-redis redis-cli INFO server | grep redis_version | cut -d: -f2 | tr -d '\r')
    print_success "Redis is running"
    echo "   Port: 6379"
    echo "   Version: $VERSION"
else
    print_error "Redis connection failed"
    print_info "Make sure Redis is running: $RUNTIME compose up -d redis"
fi

echo ""
print_info "Connection string for backend:"
echo "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bsg_demo"
echo "   REDIS_URL=redis://localhost:6379/0"
echo ""
