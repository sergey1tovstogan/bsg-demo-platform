#!/bin/bash

# BSG Demo Platform - Startup Script
# Detects and uses Docker or Podman for containerization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print header
print_header() {
    echo ""
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "  BSG Demo Platform - Startup Script"
    print_message "$BLUE" "=========================================="
    echo ""
}

# Detect container runtime (Docker or Podman)
detect_container_runtime() {
    print_message "$YELLOW" "Detecting container runtime..."

    # Check for Docker
    if command -v docker &> /dev/null; then
        # Verify Docker is running
        if docker info &> /dev/null; then
            CONTAINER_RUNTIME="docker"
            COMPOSE_CMD="docker compose"
            print_message "$GREEN" "✓ Docker detected and running"
            docker --version
            return 0
        else
            print_message "$YELLOW" "⚠ Docker found but not running"
        fi
    fi

    # Check for Podman
    if command -v podman &> /dev/null; then
        CONTAINER_RUNTIME="podman"
        # Check if podman-compose is available
        if command -v podman-compose &> /dev/null; then
            COMPOSE_CMD="podman-compose"
        else
            # Try using podman compose (podman 3.0+)
            if podman compose version &> /dev/null 2>&1; then
                COMPOSE_CMD="podman compose"
            else
                print_message "$RED" "✗ Podman found but podman-compose is not installed"
                print_message "$YELLOW" "  Install with: pip install podman-compose"
                exit 1
            fi
        fi
        print_message "$GREEN" "✓ Podman detected"
        podman --version
        return 0
    fi

    # Neither found
    print_message "$RED" "✗ Neither Docker nor Podman found"
    print_message "$YELLOW" "  Please install Docker or Podman:"
    print_message "$YELLOW" "  - Docker: https://docs.docker.com/get-docker/"
    print_message "$YELLOW" "  - Podman: https://podman.io/getting-started/installation"
    exit 1
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_message "$YELLOW" "⚠ No .env file found"
        if [ -f .env.example ]; then
            print_message "$BLUE" "Creating .env from .env.example..."
            cp .env.example .env
            print_message "$GREEN" "✓ Created .env file"
            print_message "$YELLOW" "⚠ Please review and update .env with your configuration"
        else
            print_message "$YELLOW" "⚠ No .env.example found either"
        fi
    else
        print_message "$GREEN" "✓ .env file exists"
    fi
}

# Start services
start_services() {
    print_message "$BLUE" "Starting BSG Demo Platform services..."
    print_message "$YELLOW" "Container runtime: $CONTAINER_RUNTIME"
    print_message "$YELLOW" "Compose command: $COMPOSE_CMD"
    echo ""

    # Run docker-compose/podman-compose
    $COMPOSE_CMD up -d

    echo ""
    print_message "$GREEN" "✓ Services started successfully!"
    echo ""
    print_message "$BLUE" "Service URLs:"
    print_message "$BLUE" "  - Backend API: http://localhost:8000"
    print_message "$BLUE" "  - API Docs: http://localhost:8000/docs"
    print_message "$BLUE" "  - Health Check: http://localhost:8000/api/v1/health"
    print_message "$BLUE" "  - PostgreSQL: localhost:5432"
    print_message "$BLUE" "  - Redis: localhost:6379"
    echo ""
}

# Show logs
show_logs() {
    print_message "$BLUE" "Showing logs (Ctrl+C to exit)..."
    $COMPOSE_CMD logs -f
}

# Stop services
stop_services() {
    print_message "$BLUE" "Stopping BSG Demo Platform services..."
    $COMPOSE_CMD down
    print_message "$GREEN" "✓ Services stopped"
}

# Show status
show_status() {
    print_message "$BLUE" "Service Status:"
    $COMPOSE_CMD ps
}

# Run database migrations
run_migrations() {
    print_message "$BLUE" "Running database migrations..."
    $COMPOSE_CMD exec backend alembic upgrade head
    print_message "$GREEN" "✓ Migrations completed"
}

# Main script
main() {
    print_header

    # Parse command line arguments
    COMMAND=${1:-up}

    case $COMMAND in
        up|start)
            detect_container_runtime
            check_env_file
            start_services
            ;;
        down|stop)
            detect_container_runtime
            stop_services
            ;;
        restart)
            detect_container_runtime
            stop_services
            start_services
            ;;
        logs)
            detect_container_runtime
            show_logs
            ;;
        status|ps)
            detect_container_runtime
            show_status
            ;;
        migrate)
            detect_container_runtime
            run_migrations
            ;;
        *)
            print_message "$YELLOW" "Usage: $0 {up|down|restart|logs|status|migrate}"
            print_message "$YELLOW" ""
            print_message "$YELLOW" "Commands:"
            print_message "$YELLOW" "  up/start   - Start all services"
            print_message "$YELLOW" "  down/stop  - Stop all services"
            print_message "$YELLOW" "  restart    - Restart all services"
            print_message "$YELLOW" "  logs       - Show service logs"
            print_message "$YELLOW" "  status/ps  - Show service status"
            print_message "$YELLOW" "  migrate    - Run database migrations"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
