#!/bin/bash

echo "🔄 Restarting ChatPDF servers..."

# Function to kill process on specific port
kill_port() {
    local port=$1
    echo "🔍 Checking for processes on port $port..."
    
    # For Windows (PowerShell)
    if command -v powershell.exe &> /dev/null; then
        echo "💻 Windows detected, using PowerShell..."
        powershell.exe -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
    # For macOS/Linux
    elif command -v lsof &> /dev/null; then
        echo "🐧 Unix detected, using lsof..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    # Alternative for Linux
    elif command -v netstat &> /dev/null; then
        echo "🐧 Unix detected, using netstat..."
        netstat -tlnp | grep :$port | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
    else
        echo "⚠️  Could not find a way to kill processes on port $port"
        echo "   Please manually stop any processes on port $port"
    fi
}

# Kill existing processes
echo "🛑 Stopping existing servers..."
kill_port 3000  # Frontend
kill_port 5000  # Backend

# Wait a moment
sleep 2

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "📋 Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Test backend health
echo "🔍 Testing backend health..."
if command -v curl &> /dev/null; then
    curl -s http://localhost:5000/health || echo "⚠️  Backend health check failed"
else
    echo "ℹ️  curl not found, skipping health check"
fi

# Start frontend
echo "🌐 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "📋 Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Servers started!"
echo "📋 Backend PID: $BACKEND_PID (http://localhost:5000)"
echo "📋 Frontend PID: $FRONTEND_PID (http://localhost:3000)"
echo ""
echo "🔍 Check logs for WebSocket connection status"
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "To stop servers later:"
echo "  kill $BACKEND_PID $FRONTEND_PID"