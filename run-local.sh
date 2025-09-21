#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Daily Flow Application...${NC}"
echo ""

# Function to kill processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to clean up on script exit
trap cleanup EXIT INT TERM

# Start Backend
echo -e "${GREEN}Starting Backend Server on http://localhost:8000${NC}"
cd backend
/Applications/anaconda3/bin/python -m uvicorn simple_main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "${GREEN}Starting Frontend Server on http://localhost:3000${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for everything to start
sleep 3

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Daily Flow is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "🌐 Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "🔧 Backend API: ${YELLOW}http://localhost:8000${NC}"
echo -e "📚 API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for user to stop
wait
