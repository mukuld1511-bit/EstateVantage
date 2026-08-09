#!/bin/bash

# run_backend.sh
# Creates/activates Python virtual environment and launches FastAPI server on port 8000

echo "=== Starting Real Estate Agent RAG Backend Service ==="

cd "$(dirname "$0")/backend" || exit 1

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/Scripts/activate

echo "Installing required Python packages..."
pip install -r requirements.txt

echo "Starting Uvicorn server on http://localhost:8000..."
uvicorn app:app --reload --port 8000 --host 0.0.0.0
