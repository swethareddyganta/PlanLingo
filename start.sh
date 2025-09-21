#!/bin/bash

echo "🚀 Starting Daily Flow Application..."

# Start Backend
echo "Starting Backend on http://localhost:8000..."
cd backend
python enhanced_main.py &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Daily Flow is running!"
echo "🌐 Frontend: http://localhost:5173/"
echo "🔧 Backend API: http://localhost:8000/"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
