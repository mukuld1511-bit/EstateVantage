#!/bin/bash

# run_all.sh
# Starts FastAPI backend on port 8000 and React frontend on port 3000 concurrently.
# Cleanly terminates both processes upon Ctrl+C signal.

trap 'echo "Stopping all services..."; kill 0' EXIT INT TERM

echo "=================================================================="
echo " Launching Real Estate RAG System (Backend: 8000 | Frontend: 3000)"
echo "=================================================================="

# Start backend in background
./run_backend.sh &

# Wait briefly for backend to initialize
sleep 3

# Start frontend in foreground
./run_frontend.sh
