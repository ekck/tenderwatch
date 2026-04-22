.PHONY: help build up down logs restart sync shell-backend shell-frontend clean

# Default target
help:
	@echo ""
	@echo "TenderWatch — Docker Commands"
	@echo "─────────────────────────────"
	@echo "  make build          Build all Docker images"
	@echo "  make up             Start all services (detached)"
	@echo "  make down           Stop all services"
	@echo "  make logs           Tail logs from all services"
	@echo "  make logs-backend   Tail backend logs only"
	@echo "  make logs-frontend  Tail frontend logs only"
	@echo "  make restart        Restart all services"
	@echo "  make sync           Trigger a manual PPIP data sync"
	@echo "  make shell-backend  Open a shell in the backend container"
	@echo "  make shell-frontend Open a shell in the frontend container"
	@echo "  make clean          Stop and remove all containers + images"
	@echo ""

# Build images
build:
	docker compose build --no-cache

# Start in detached mode
up:
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up -d
	@echo ""
	@echo "✅ TenderWatch running at http://localhost:80"
	@echo "   API:      http://localhost:80/api/tenders/"
	@echo "   Frontend: http://localhost:80"
	@echo ""

# Start with logs visible
up-logs:
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up

# Stop
down:
	docker compose down

# Tail all logs
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-nginx:
	docker compose logs -f nginx

# Restart
restart:
	docker compose restart

# Trigger a manual PPIP data sync
sync:
	@echo "Triggering PPIP sync..."
	@curl -s -X POST http://localhost:80/api/tenders/sync/trigger \
		-H "X-Admin-Token: $$(grep ADMIN_TOKEN .env | cut -d= -f2)" \
		| python3 -m json.tool
	@echo ""

# Check sync status
sync-status:
	@curl -s http://localhost:80/api/tenders/sync/status | python3 -m json.tool

# Shell access
shell-backend:
	docker compose exec backend /bin/bash

shell-frontend:
	docker compose exec frontend /bin/sh

# Health check
health:
	@echo "Backend:  $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:80/api/tenders/sync/status)"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:80)"
	@echo "Nginx:    $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:80/health)"

# Clean everything
clean:
	docker compose down --rmi all --volumes --remove-orphans
	@echo "All containers, images and volumes removed."
