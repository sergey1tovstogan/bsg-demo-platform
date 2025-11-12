#!/bin/bash

##############################################################################
# BSG Demo Platform - Start Database with Docker
# This script starts PostgreSQL and Redis using Docker
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

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_CMD="docker"
        print_success "Docker found: $(docker --version)"
        return 0
    else
        print_error "Docker is not installed or not in PATH"
        echo ""
        echo "To install Docker on macOS:"
        echo "  1. Install Docker Desktop:"
        echo "     Download from: https://www.docker.com/products/docker-desktop/"
        echo ""
        echo "  2. Or install via Homebrew:"
        echo "     brew install --cask docker"
        echo ""
        echo "  3. Start Docker Desktop application"
        echo ""
        echo "  4. Verify installation:"
        echo "     docker --version"
        echo ""
        return 1
    fi
}

# Check if Docker daemon is running
check_docker_daemon() {
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
        return 0
    else
        print_error "Docker daemon is not running"
        print_info "Please start Docker Desktop application"
        return 1
    fi
}

# Start database services using docker compose
start_database() {
    print_info "Starting database services with Docker Compose..."
    
    # Check for docker compose
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        print_info "Using: docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        print_info "Using: docker-compose"
    else
        print_error "docker compose not found"
        print_info "Docker Compose should be included with Docker Desktop"
        return 1
    fi
    
    # Start only database services
    print_info "Starting PostgreSQL and Redis containers..."
    if $COMPOSE_CMD up -d db redis; then
        print_success "Database services started"
        
        # Wait for services to be healthy
        print_info "Waiting for services to be ready..."
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if docker ps --filter "name=bsg-db" --format "{{.Status}}" | grep -q "Up"; then
                sleep 2
                if docker exec bsg-db pg_isready -U postgres &> /dev/null; then
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
    
    if docker exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();" &> /dev/null; then
        print_success "Database connection test passed"
        docker exec bsg-db psql -U postgres -d bsg_demo -c "SELECT version();" | head -3
        return 0
    else
        print_warning "Database connection test failed (may still be starting)"
        return 1
    fi
}

# Main execution
main() {
    print_header
    
    if ! check_docker; then
        exit 1
    fi
    
    echo ""
    
    if ! check_docker_daemon; then
        exit 1
    fi
    
    echo ""
    
    if start_database; then
        echo ""
        test_connection
        echo ""
        print_success "Database services are running!"
        print_info "Check status: docker ps"
        print_info "View logs: docker logs bsg-db"
        print_info "Stop services: docker compose down"
    else
        exit 1
    fi
}

# Run main function
main


