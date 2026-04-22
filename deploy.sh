#!/usr/bin/env bash
# TenderWatch deploy script — first-run and updates.
# Usage: ./deploy.sh   (run from the repo directory on the VPS)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
info()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}   $*"; }
abort() { echo -e "${RED}[error]${NC}  $*" >&2; exit 1; }

# 1. Pull latest code
info "Pulling latest from origin main..."
git pull origin main

# 2. Require .env
if [ ! -f .env ]; then
  cp .env.example .env
  warn ".env created from example."
  abort "Edit .env (set SECRET_KEY + ADMIN_TOKEN) then re-run:  nano .env && ./deploy.sh"
fi
info ".env present."

# 3. Require docker-compose.override.yml
if [ ! -f docker-compose.override.yml ]; then
  warn "docker-compose.override.yml not found."
  warn "Create it: cp docker-compose.override.yml.example docker-compose.override.yml"
  abort "Then re-run ./deploy.sh"
fi
info "docker-compose.override.yml present."

# 4. Ensure data directory exists
mkdir -p data
info "data/ ready."

# 5. Build images
info "Building images..."
docker compose build

# 6. Start / restart services
info "Starting services..."
docker compose up -d

echo ""
info "Done. Container status:"
docker compose ps
echo ""
info "Tail logs : docker compose logs -f"
info "First sync: make sync"
