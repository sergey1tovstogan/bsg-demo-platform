@echo off
REM BSG Demo Platform - Startup Script for Windows
REM Detects and uses Docker or Podman for containerization

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   BSG Demo Platform - Startup Script
echo ==========================================
echo.

REM Detect container runtime
set CONTAINER_RUNTIME=
set COMPOSE_CMD=

echo Detecting container runtime...

REM Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    docker info >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set CONTAINER_RUNTIME=docker
        set COMPOSE_CMD=docker compose
        echo [32m+ Docker detected and running[0m
        docker --version
        goto :runtime_detected
    ) else (
        echo [33m! Docker found but not running[0m
    )
)

REM Check for Podman
where podman >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set CONTAINER_RUNTIME=podman
    REM Check for podman-compose
    where podman-compose >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set COMPOSE_CMD=podman-compose
    ) else (
        REM Try podman compose
        podman compose version >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            set COMPOSE_CMD=podman compose
        ) else (
            echo [31m- Podman found but podman-compose is not installed[0m
            echo [33m  Install with: pip install podman-compose[0m
            exit /b 1
        )
    )
    echo [32m+ Podman detected[0m
    podman --version
    goto :runtime_detected
)

REM Neither found
echo [31m- Neither Docker nor Podman found[0m
echo [33m  Please install Docker or Podman:[0m
echo [33m  - Docker: https://docs.docker.com/get-docker/[0m
echo [33m  - Podman: https://podman.io/getting-started/installation[0m
exit /b 1

:runtime_detected

REM Check if .env file exists
if not exist .env (
    echo [33m! No .env file found[0m
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
        echo [32m+ Created .env file[0m
        echo [33m! Please review and update .env with your configuration[0m
    ) else (
        echo [33m! No .env.example found either[0m
    )
) else (
    echo [32m+ .env file exists[0m
)

REM Parse command
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=up

if "%COMMAND%"=="up" goto :start_services
if "%COMMAND%"=="start" goto :start_services
if "%COMMAND%"=="down" goto :stop_services
if "%COMMAND%"=="stop" goto :stop_services
if "%COMMAND%"=="restart" goto :restart_services
if "%COMMAND%"=="logs" goto :show_logs
if "%COMMAND%"=="status" goto :show_status
if "%COMMAND%"=="ps" goto :show_status
if "%COMMAND%"=="migrate" goto :run_migrations

REM Unknown command
echo.
echo Usage: %0 {up^|down^|restart^|logs^|status^|migrate}
echo.
echo Commands:
echo   up/start   - Start all services
echo   down/stop  - Stop all services
echo   restart    - Restart all services
echo   logs       - Show service logs
echo   status/ps  - Show service status
echo   migrate    - Run database migrations
exit /b 1

:start_services
echo.
echo Starting BSG Demo Platform services...
echo Container runtime: %CONTAINER_RUNTIME%
echo Compose command: %COMPOSE_CMD%
echo.
%COMPOSE_CMD% up -d
echo.
echo [32m+ Services started successfully![0m
echo.
echo Service URLs:
echo   - Backend API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo   - Health Check: http://localhost:8000/api/v1/health
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo.
goto :end

:stop_services
echo.
echo Stopping BSG Demo Platform services...
%COMPOSE_CMD% down
echo [32m+ Services stopped[0m
goto :end

:restart_services
call :stop_services
call :start_services
goto :end

:show_logs
echo.
echo Showing logs (Ctrl+C to exit)...
%COMPOSE_CMD% logs -f
goto :end

:show_status
echo.
echo Service Status:
%COMPOSE_CMD% ps
goto :end

:run_migrations
echo.
echo Running database migrations...
%COMPOSE_CMD% exec backend alembic upgrade head
echo [32m+ Migrations completed[0m
goto :end

:end
endlocal
