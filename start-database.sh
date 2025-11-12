#!/bin/bash

##############################################################################
# Start Database and Connect Application
# This script will try Podman first, then Docker, then provide instructions
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  Starting Database & Connecting App${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Find container runtime
find_runtime() {
    # Try Podman first
    if command -v podman &> /dev/null; then
        echo "podman"
        return 0
    fi
    
    # Try Docker
    if command -v docker &> /dev/null; then
        echo "docker"
        return 0
    fi
    
    return 1
}

# Start database with the given runtime
start_database() {
    local RUNTIME=$1
    local COMPOSE_CMD=""
    
    print_info "Using $RUNTIME to start database..."
    
    # Determine compose command
    if [ "$RUNTIME" = "podman" ]; then
        if $RUNTIME compose version &> /dev/null; then
            COMPOSE_CMD="$RUNTIME compose"
        elif command -v podman-compose &> /dev/null; then
            COMPOSE_CMD="podman-compose"
        else
            print_error "podman compose not found"
            return 1
        fi
        
        # Start Podman machine if needed
        if ! $RUNTIME machine list 2>/dev/null | grep -q "running"; then
            print_info "Starting Podman machine..."
            $RUNTIME machine start || {
                print_warning "Podman machine may need initialization"
                print_info "Try: podman machine init"
                return 1
            }
            sleep 5
        fi
    else
        # Docker
        if $RUNTIME compose version &> /dev/null; then
            COMPOSE_CMD="$RUNTIME compose"
        elif command -v docker-compose &> /dev/null; then
            COMPOSE_CMD="docker-compose"
        else
            print_error "docker compose not found"
            return 1
        fi
        
        # Check if Docker daemon is running
        if ! $RUNTIME info &> /dev/null; then
            print_error "Docker daemon is not running"
            print_info "Please start Docker Desktop"
            return 1
        fi
    fi
    
    print_info "Using: $COMPOSE_CMD"
    
    cd "$(dirname "$0")"
    
    # Start database services
    print_info "Starting PostgreSQL and Redis containers..."
    if $COMPOSE_CMD up -d db redis; then
        print_success "Database containers started"
        
        # Wait for services
        print_info "Waiting for services to be ready..."
        sleep 5
        
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if $RUNTIME ps --filter "name=bsg-db" --format "{{.Names}}" 2>/dev/null | grep -q "bsg-db"; then
                if $RUNTIME exec bsg-db pg_isready -U postgres &> /dev/null 2>&1; then
                    print_success "PostgreSQL is ready!"
                    print_success "Redis is ready!"
                    return 0
                fi
            fi
            retries=$((retries + 1))
            sleep 1
        done
        
        print_warning "Services started but may not be fully ready yet"
        return 0
    else
        print_error "Failed to start database services"
        return 1
    fi
}

# Test application connection
test_application_connection() {
    print_info "Testing application database connection..."
    
    sleep 3
    
    local retries=0
    local max_retries=15
    
    while [ $retries -lt $max_retries ]; do
        local response=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null)
        if [ -n "$response" ]; then
            local db_status=$(echo "$response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('checks', {}).get('database', {}).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
            
            if [ "$db_status" = "healthy" ]; then
                print_success "Application successfully connected to database!"
                echo ""
                echo "$response" | python3 -m json.tool 2>/dev/null | head -20
                return 0
            elif [ "$db_status" != "unknown" ]; then
                print_info "Database status: $db_status (checking again...)"
            fi
        fi
        retries=$((retries + 1))
        sleep 2
    done
    
    print_warning "Could not verify connection. Check http://localhost:8000/api/v1/health"
    return 1
}

# Main execution
main() {
    print_header
    
    # Find container runtime
    RUNTIME=$(find_runtime)
    
    if [ -z "$RUNTIME" ]; then
        print_error "Neither Podman nor Docker is available"
        echo ""
        print_info "To install Podman CLI:"
        echo "  1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "  2. Install Podman: brew install podman"
        echo "  3. Initialize: podman machine init && podman machine start"
        echo ""
        print_info "Or install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
        echo ""
        print_info "If Podman Desktop is installed, complete the setup wizard to enable CLI access"
        exit 1
    fi
    
    print_success "Found $RUNTIME: $($RUNTIME --version 2>/dev/null | head -1)"
    echo ""
    
    # Start database
    if start_database "$RUNTIME"; then
        echo ""
        print_info "Database connection details:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: bsg_demo"
        echo "  User: postgres"
        echo "  Password: postgres"
        echo ""
        
        # Test application connection
        test_application_connection
        echo ""
        
        print_success "Setup complete!"
        echo ""
        print_info "Services running:"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - Redis: localhost:6379"
        echo "  - Application: http://localhost:8000"
        echo "  - API Docs: http://localhost:8000/docs"
        echo "  - Health: http://localhost:8000/api/v1/health"
    else
        print_error "Failed to start database"
        exit 1
    fi
}

# Run main function
main

