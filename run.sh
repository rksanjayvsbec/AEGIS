#!/bin/bash

# Exit on error
set -e

echo "=========================================================="
echo "🛡️  AEGIS NETWORK COMPLIANCE AUDITOR (SIH 26155) - STARTUP"
echo "=========================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping backend and frontend servers..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Use virtual environment if present
if [ -d "venv" ]; then
    PYTHON_BIN="venv/bin/python3"
else
    PYTHON_BIN="python3"
fi

echo "👉 Step 1: Installing Python Backend dependencies..."
$PYTHON_BIN -m pip install -r backend/requirements.txt

echo "👉 Step 2: Installing Node.js Frontend dependencies..."
cd frontend
npm install
cd ..

echo "👉 Step 3: Starting FastAPI Backend on http://localhost:8000..."
$PYTHON_BIN -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "👉 Step 4: Starting React + Vite Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=========================================================="
echo "🚀 Aegis Auditor is active!"
echo "   • Administrative Portal: http://localhost:5173"
echo "   • Interactive Swagger API: http://localhost:8000/docs"
echo "   Press Ctrl+C to shut down both systems."
echo "=========================================================="

# Keep running
wait
