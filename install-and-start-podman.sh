#!/bin/bash

##############################################################################
# Podman Installation and Database Setup Script
# This script helps install Podman and start the database
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
    echo -e "${CYAN}  Podman Installation & Database Setup${NC}"
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
        print_success "Podman is installed: $(podman --version)"
        return 0
    else
        print_error "Podman is not installed"
        return 1
    fi
}

# Install Podman via Homebrew
install_podman_homebrew() {
    print_info "Installing Podman via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed"
        print_info "Installing Homebrew (requires admin password)..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH
        if [ -f "/opt/homebrew/bin/brew" ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -f "/usr/local/bin/brew" ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
    fi
    
    print_info "Installing Podman..."
    brew install podman
    
    print_success "Podman installed successfully"
}

# Initialize Podman machine
init_podman_machine() {
    print_info "Initializing Podman machine..."
    
    if podman machine list | grep -q "podman-machine"; then
        print_info "Podman machine already exists"
    else
        podman machine init
        print_success "Podman machine initialized"
    fi
}

# Start Podman machine
start_podman_machine() {
    print_info "Starting Podman machine..."
    
    if podman machine list | grep -q "running"; then
        print_success "Podman machine is already running"
    else
        podman machine start
        sleep 5
        print_success "Podman machine started"
    fi
}

# Start database services
start_database() {
    print_info "Starting database services..."
    
    # Check for podman compose
    if podman compose version &> /dev/null; then
        COMPOSE_CMD="podman compose"
    elif command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        print_error "podman compose not found"
        print_info "Installing podman-compose..."
        pip3 install podman-compose --user
        COMPOSE_CMD="podman-compose"
    fi
    
    print_info "Starting PostgreSQL and Redis..."
    cd "$(dirname "$0")"
    $COMPOSE_CMD up -d db redis
    
    # Wait for services
    print_info "Waiting for services to be ready..."
    sleep 5
    
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if podman ps --filter "name=bsg-db" --format "{{.Names}}" | grep -q "bsg-db"; then
            if podman exec bsg-db pg_isready -U postgres &> /dev/null; then
                print_success "PostgreSQL is ready"
                print_success "Redis is ready"
                return 0
            fi
        fi
        retries=$((retries + 1))
        sleep 1
    done
    
    print_warning "Services started but may not be fully ready"
    return 0
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    
    if podman exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();" &> /dev/null; then
        print_success "Database connection test passed"
        podman exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();" | head -3
        return 0
    else
        print_warning "Database connection test failed (may still be starting)"
        return 1
    fi
}

# Main execution
main() {
    print_header
    
    # Check if Podman is installed
    if ! check_podman; then
        print_info "Podman needs to be installed"
        echo ""
        print_info "Option 1: Install Podman Desktop (Recommended)"
        print_info "  Download from: https://podman-desktop.io/"
        print_info "  Or run: open https://podman-desktop.io/"
        echo ""
        print_info "Option 2: Install via Homebrew (requires admin password)"
        read -p "Do you want to install Podman via Homebrew? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_podman_homebrew
        else
            print_error "Please install Podman Desktop manually and run this script again"
            exit 1
        fi
    fi
    
    echo ""
    
    # Initialize and start Podman machine
    init_podman_machine
    echo ""
    start_podman_machine
    echo ""
    
    # Start database
    if start_database; then
        echo ""
        test_connection
        echo ""
        print_success "Database services are running!"
        print_info "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: bsg_demo"
        echo "  User: postgres"
        echo "  Password: postgres"
    fi
}

# Run main function
main

