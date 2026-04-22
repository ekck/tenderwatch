.PHONY: help build up down logs restart sync sync-status shell-backend shell-frontend health clean deploy

# Derive the host:port to reach nginx from PORT in .env.
# PORT can be "80" (local) or "127.0.0.1:8082" (VPS).
# Either way, strip any interface prefix and keep just the port number,
# then hit 127.0.0.1:<port> so the request reaches nginx regardless of environment.
-include .env
export
_RAW_PORT   := $(or $(PORT),80)
_HOST_PORT  := $(lastword $(subst :, ,$(_RAW_PORT)))
NGINX_URL   := http://127.0.0.1:$(_HOST_PORT)
ADMIN_TOKEN := $(shell grep -E '^ADMIN_TOKEN=' .env 2>/dev/null | cut -d= -f2)

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
	@echo "  make sync-status    Check last sync status"
	@echo "  make shell-backend  Open a shell in the backend container"
	@echo "  make shell-frontend Open a shell in the frontend container"
	@echo "  make health         Check HTTP status of all services"
	@echo "  make clean          Stop and remove all containers + images"
	@echo "  make deploy         Pull latest + build + start (runs deploy.sh)"
	@echo ""

# Build images
build:
	docker compose build --no-cache

# Start in detached mode
up:
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up -d
	@echo ""
	@echo "TenderWatch running at $(NGINX_URL)"
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
	@echo "Triggering PPIP sync via $(NGINX_URL) ..."
	@curl -sf -X POST $(NGINX_URL)/api/tenders/sync/trigger \
		-H "Host: tenderwatch.co.ke" \
		-H "X-Admin-Token: $(ADMIN_TOKEN)" \
		| python3 -m json.tool
	@echo ""

# Check sync status
sync-status:
	@curl -sf $(NGINX_URL)/api/tenders/sync/status \
		-H "Host: tenderwatch.co.ke" \
		| python3 -m json.tool

# Shell access
shell-backend:
	docker compose exec backend /bin/bash

shell-frontend:
	docker compose exec frontend /bin/sh

# Health check
health:
	@echo "Backend:  $$(curl -s -o /dev/null -w '%{http_code}' $(NGINX_URL)/api/tenders/sync/status -H 'Host: tenderwatch.co.ke')"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' $(NGINX_URL)/ -H 'Host: tenderwatch.co.ke')"
	@echo "Nginx:    $$(curl -s -o /dev/null -w '%{http_code}' $(NGINX_URL)/health -H 'Host: tenderwatch.co.ke')"

# Clean everything
clean:
	docker compose down --rmi all --volumes --remove-orphans
	@echo "All containers, images and volumes removed."

# Deploy (first-run and updates)
deploy:
	@chmod +x deploy.sh && ./deploy.sh
