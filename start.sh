#!/bin/bash

# BSG Demo Platform - Start Script
# Launches both frontend and backend in development mode

echo "🚀 Starting BSG Demo Platform..."
echo ""

# Kill any existing processes on the ports
echo "📋 Checking for existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✓ Killed existing backend process on port 8000"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✓ Killed existing frontend process on port 5173"
echo ""

# Start Backend
echo "🔧 Starting Backend (FastAPI on port 8000)..."
cd backend
source venv/bin/activate 2>/dev/null || echo "⚠ Virtual environment not activated (proceeding anyway)"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"
cd ..
echo ""

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "🎨 Starting Frontend (Vite on port 5173)..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"
cd ..
echo ""

echo "✅ Both services started successfully!"
echo ""
echo "📊 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: pkill -f 'python3 main.py' && pkill -f 'vite'"
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 3

# Check if services are running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
else
    echo "⚠ Backend might still be starting... check backend.log"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready!"
else
    echo "⏳ Frontend is still starting... (this is normal, wait a few more seconds)"
fi

echo ""
echo "🎉 Setup complete! Open http://localhost:3000 in your browser"
