#!/bin/bash
# BSG Demo Platform - Backend Startup Script
# Starts the FastAPI backend with Azure Cosmos DB MongoDB connection

echo "========================================"
echo "  BSG Demo Platform - Backend Startup"
echo "========================================"
echo ""

# Set Azure Cosmos DB MongoDB connection string
export DATABASE_URL="mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@"
export DATABASE_NAME="bsg_demo"
export ENVIRONMENT="development"
export DEBUG="True"
export LOG_LEVEL="INFO"

echo "Configuration:"
echo "  Database: Azure Cosmos DB MongoDB"
echo "  Host: bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255"
echo "  Database Name: $DATABASE_NAME"
echo "  Environment: $ENVIRONMENT"
echo ""

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Warning: Port 8000 is already in use!"
    echo "Stopping existing processes on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "Starting FastAPI backend server..."
echo "  Host: 0.0.0.0"
echo "  Port: 8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Health: http://localhost:8000/api/v1/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

