#!/bin/bash

# run_frontend.sh
# Installs Node dependencies and starts Vite React frontend on port 3000

echo "=== Starting Real Estate Agent RAG Frontend Application ==="

cd "$(dirname "$0")" || exit 1

echo "Checking dependencies..."
npm install

echo "Starting Vite dev server on port 3000..."
npm run dev
