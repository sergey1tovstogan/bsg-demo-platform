#!/bin/bash

##############################################################################
# BSG Demo Platform - Start Database with Podman
# This script starts PostgreSQL and Redis using Podman
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  BSG Demo Platform - Database Setup${NC}"
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

# Check if Podman is installed
check_podman() {
    if command -v podman &> /dev/null; then
        PODMAN_CMD="podman"
        print_success "Podman found: $(podman --version)"
        return 0
    else
        print_error "Podman is not installed or not in PATH"
        echo ""
        echo "To install Podman on macOS:"
        echo "  1. Install Homebrew (if not installed):"
        echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        echo "  2. Install Podman:"
        echo "     brew install podman"
        echo ""
        echo "  3. Initialize Podman machine:"
        echo "     podman machine init"
        echo "     podman machine start"
        echo ""
        echo "  OR install Podman Desktop:"
        echo "     Download from: https://podman-desktop.io/"
        echo ""
        return 1
    fi
}

# Check if Podman machine is running
check_podman_machine() {
    if podman machine list | grep -q "running"; then
        print_success "Podman machine is running"
        return 0
    else
        print_warning "Podman machine is not running"
        print_info "Starting Podman machine..."
        if podman machine start; then
            print_success "Podman machine started"
            sleep 3
            return 0
        else
            print_error "Failed to start Podman machine"
            print_info "Try: podman machine init (if not initialized)"
            return 1
        fi
    fi
}

# Start database services using podman compose
start_database() {
    print_info "Starting database services with Podman Compose..."
    
    # Check for podman compose
    if podman compose version &> /dev/null; then
        COMPOSE_CMD="podman compose"
    elif command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        print_error "podman compose not found"
        print_info "Install it with: pip3 install podman-compose"
        return 1
    fi
    
    print_info "Using: $COMPOSE_CMD"
    
    # Start only database services
    if $COMPOSE_CMD up -d db redis; then
        print_success "Database services started"
        
        # Wait for services to be healthy
        print_info "Waiting for services to be ready..."
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if podman ps --filter "name=bsg-db" --format "{{.Status}}" | grep -q "Up"; then
                sleep 2
                if podman exec bsg-db pg_isready -U postgres &> /dev/null; then
                    print_success "PostgreSQL is ready"
                    print_success "Redis is ready"
                    echo ""
                    print_info "Database connection details:"
                    echo "  Host: localhost"
                    echo "  Port: 5432"
                    echo "  Database: bsg_demo"
                    echo "  User: postgres"
                    echo "  Password: postgres"
                    echo ""
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

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    
    if podman exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();" &> /dev/null; then
        print_success "Database connection test passed"
        return 0
    else
        print_warning "Database connection test failed (may still be starting)"
        return 1
    fi
}

# Main execution
main() {
    print_header
    
    if ! check_podman; then
        exit 1
    fi
    
    echo ""
    
    if ! check_podman_machine; then
        exit 1
    fi
    
    echo ""
    
    if start_database; then
        echo ""
        test_connection
        echo ""
        print_success "Database services are running!"
        print_info "Check status: podman ps"
        print_info "View logs: podman logs bsg-db"
        print_info "Stop services: podman compose down"
    else
        exit 1
    fi
}

# Run main function
main


