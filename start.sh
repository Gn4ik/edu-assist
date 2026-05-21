#!/usr/bin/env bash
set -euo pipefail

echo "=== EduAssist v2 — One-Command Startup ==="

if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &>/dev/null; then
    echo "ERROR: Docker Compose v2 is not installed."
    exit 1
fi

echo "[1/3] Starting Ollama service..."
docker compose up -d ollama

echo "[2/3] Pulling models (this may take a few minutes on first run)..."
docker compose up -d ollama-pull
docker compose logs -f ollama-pull 2>/dev/null || true

echo "[3/3] Starting all services..."
docker compose up -d --build

echo "Waiting for backend to become healthy..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/api/health | grep -q "ok"; then
        echo ""
        echo "=== EduAssist is running! ==="
        echo "  Frontend:  http://localhost:5173"
        echo "  Backend:   http://localhost:8000"
        echo "  API Docs:  http://localhost:8000/docs"
        echo "============================="
        exit 0
    fi
    sleep 2
done

echo "WARNING: Backend health check timed out. Check logs with: docker compose logs backend"
exit 1
