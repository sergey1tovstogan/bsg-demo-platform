#!/bin/bash

##############################################################################
# Complete Setup: Start Podman, Database, and Application
# This script starts everything and connects the application to the database
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
    echo -e "${CYAN}  Complete Setup: Podman + Database + App${NC}"
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

# Find Podman command
find_podman() {
    # Check common locations
    local paths=(
        "/usr/local/bin/podman"
        "/opt/homebrew/bin/podman"
        "$HOME/.local/bin/podman"
        "/usr/bin/podman"
    )
    
    for path in "${paths[@]}"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    # Check if podman is in PATH
    if command -v podman &> /dev/null; then
        command -v podman
        return 0
    fi
    
    return 1
}

# Start Podman Desktop and wait for CLI
start_podman_desktop() {
    print_info "Starting Podman Desktop..."
    open -a "Podman Desktop" 2>/dev/null || true
    print_info "Waiting for Podman Desktop to initialize..."
    sleep 5
}

# Initialize Podman machine
init_podman_machine() {
    local PODMAN_CMD=$1
    
    print_info "Checking Podman machine status..."
    
    if $PODMAN_CMD machine list 2>/dev/null | grep -q "podman-machine"; then
        print_success "Podman machine exists"
    else
        print_info "Initializing Podman machine (this may take a moment)..."
        $PODMAN_CMD machine init || {
            print_warning "Machine initialization may have failed or already exists"
        }
    fi
}

# Start Podman machine
start_podman_machine() {
    local PODMAN_CMD=$1
    
    print_info "Starting Podman machine..."
    
    if $PODMAN_CMD machine list 2>/dev/null | grep -q "running"; then
        print_success "Podman machine is already running"
    else
        $PODMAN_CMD machine start || {
            print_error "Failed to start Podman machine"
            print_info "Try starting Podman Desktop manually and ensure it's running"
            return 1
        }
        sleep 5
        print_success "Podman machine started"
    fi
}

# Start database services
start_database() {
    local PODMAN_CMD=$1
    
    print_info "Starting database services..."
    
    # Check for podman compose
    local COMPOSE_CMD=""
    if $PODMAN_CMD compose version &> /dev/null; then
        COMPOSE_CMD="$PODMAN_CMD compose"
    elif command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        print_warning "podman compose not found, trying docker compose..."
        if command -v docker &> /dev/null && docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
            PODMAN_CMD="docker"
        else
            print_error "Neither podman compose nor docker compose found"
            return 1
        fi
    fi
    
    print_info "Using: $COMPOSE_CMD"
    
    cd "$(dirname "$0")"
    print_info "Starting PostgreSQL and Redis containers..."
    
    if $COMPOSE_CMD up -d db redis; then
        print_success "Database containers started"
        
        # Wait for services
        print_info "Waiting for services to be ready..."
        sleep 5
        
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if $PODMAN_CMD ps --filter "name=bsg-db" --format "{{.Names}}" 2>/dev/null | grep -q "bsg-db"; then
                if $PODMAN_CMD exec bsg-db pg_isready -U postgres &> /dev/null 2>&1; then
                    print_success "PostgreSQL is ready"
                    print_success "Redis is ready"
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

# Start application
start_application() {
    print_info "Starting backend application..."
    
    cd "$(dirname "$0")/backend"
    
    # Check if already running
    if lsof -ti :8000 &> /dev/null; then
        print_warning "Port 8000 is already in use"
        print_info "Application may already be running"
        return 0
    fi
    
    # Check for virtual environment
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
    
    # Install dependencies if needed
    if [ -f "requirements.txt" ]; then
        print_info "Installing/updating dependencies..."
        pip install -q -r requirements.txt 2>/dev/null || true
    fi
    
    # Start the application
    print_info "Starting FastAPI application..."
    python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
    local APP_PID=$!
    echo $APP_PID > ../logs/backend.pid
    
    sleep 3
    
    if ps -p $APP_PID > /dev/null 2>&1; then
        print_success "Application started (PID: $APP_PID)"
        print_info "Application URL: http://localhost:8000"
        return 0
    else
        print_error "Application failed to start. Check logs/backend.log"
        return 1
    fi
}

# Test database connection from application
test_application_connection() {
    print_info "Testing application database connection..."
    
    sleep 2
    
    local retries=0
    local max_retries=10
    
    while [ $retries -lt $max_retries ]; do
        local response=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null)
        if [ -n "$response" ]; then
            if echo "$response" | grep -q '"status":"healthy"'; then
                print_success "Application reports database as healthy!"
                echo "$response" | python3 -m json.tool 2>/dev/null | head -15
                return 0
            elif echo "$response" | grep -q '"status":"degraded"'; then
                local db_status=$(echo "$response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('checks', {}).get('database', {}).get('status', 'unknown'))" 2>/dev/null)
                if [ "$db_status" = "healthy" ]; then
                    print_success "Application connected to database successfully!"
                    echo "$response" | python3 -m json.tool 2>/dev/null | head -15
                    return 0
                else
                    print_warning "Database connection status: $db_status"
                    echo "$response" | python3 -m json.tool 2>/dev/null | head -20
                fi
            fi
        fi
        retries=$((retries + 1))
        sleep 2
    done
    
    print_warning "Could not verify application connection. Check http://localhost:8000/api/v1/health"
    return 1
}

# Main execution
main() {
    print_header
    
    # Create logs directory
    mkdir -p logs
    
    # Find Podman
    print_info "Looking for Podman..."
    PODMAN_CMD=$(find_podman)
    
    if [ -z "$PODMAN_CMD" ]; then
        print_warning "Podman CLI not found in PATH"
        print_info "Starting Podman Desktop to initialize Podman..."
        start_podman_desktop
        
        # Try to find podman again
        sleep 5
        PODMAN_CMD=$(find_podman)
        
        if [ -z "$PODMAN_CMD" ]; then
            print_error "Podman CLI still not available"
            print_info "Please ensure Podman Desktop is running and Podman is initialized"
            print_info "You may need to:"
            print_info "  1. Open Podman Desktop"
            print_info "  2. Complete the setup wizard"
            print_info "  3. Run this script again"
            exit 1
        fi
    fi
    
    print_success "Found Podman: $PODMAN_CMD"
    $PODMAN_CMD --version
    echo ""
    
    # Initialize and start Podman machine
    init_podman_machine "$PODMAN_CMD"
    echo ""
    start_podman_machine "$PODMAN_CMD"
    echo ""
    
    # Start database
    if start_database "$PODMAN_CMD"; then
        echo ""
        
        # Start application
        if start_application; then
            echo ""
            
            # Test connection
            test_application_connection
            echo ""
            
            print_success "Setup complete!"
            echo ""
            print_info "Services running:"
            echo "  - PostgreSQL: localhost:5432"
            echo "  - Redis: localhost:6379"
            echo "  - Application: http://localhost:8000"
            echo "  - API Docs: http://localhost:8000/docs"
            echo "  - Health Check: http://localhost:8000/api/v1/health"
        else
            print_error "Failed to start application"
            exit 1
        fi
    else
        print_error "Failed to start database"
        exit 1
    fi
}

# Run main function
main


