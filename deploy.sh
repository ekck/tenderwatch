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

# ── 1. Pull latest code ────────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Pulling latest from origin ${BRANCH}..."
git pull origin "${BRANCH}"

# ── 2. Require .env ────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  warn ".env created from example."
  abort "Edit .env (set SECRET_KEY + ADMIN_TOKEN) then re-run:  nano .env && ./deploy.sh"
fi
info ".env present."

# ── 3. Require docker-compose.override.yml ────────────────────────────────────
if [ ! -f docker-compose.override.yml ]; then
  warn "docker-compose.override.yml not found."
  warn "Create it: cp docker-compose.override.yml.example docker-compose.override.yml"
  abort "Then re-run ./deploy.sh"
fi
info "docker-compose.override.yml present."

# ── 4. Check the configured port is free ──────────────────────────────────────
# Read PORT from .env (strip inline comments and whitespace)
CONFIGURED_PORT=$(grep -E '^PORT=' .env | cut -d= -f2 | sed 's/#.*//' | tr -d ' ' || true)
CONFIGURED_PORT="${CONFIGURED_PORT:-80}"

# Extract just the numeric port (handles both "8080" and "127.0.0.1:8080")
HOST_PORT=$(echo "$CONFIGURED_PORT" | grep -oE '[0-9]+$' || true)

if [ -n "$HOST_PORT" ]; then
  # Check if anything (other than our own containers) holds the port
  HOLDER=$(ss -tlnp 2>/dev/null | grep -E ":${HOST_PORT}[[:space:]]" | head -1 || true)
  if [ -n "$HOLDER" ]; then
    # Allow if it's already our nginx container (redeploy case)
    if echo "$HOLDER" | grep -q 'tenderwatch_nginx'; then
      info "Port ${HOST_PORT} held by tenderwatch_nginx — will be released on 'up -d'."
    else
      echo ""
      warn "Port ${HOST_PORT} is already in use:"
      echo "  $HOLDER"
      echo ""
      warn "Pick a free port and update PORT= in .env, then re-run."
      warn "Free ports check:  ss -tlnp | grep -v docker | grep -v tenderwatch"
      abort "Aborting to avoid a failed 'docker compose up'."
    fi
  else
    info "Port ${HOST_PORT} is free."
  fi
fi

# ── 5. Ensure data directory exists ───────────────────────────────────────────
mkdir -p data
info "data/ ready."

# ── 6. Build images ───────────────────────────────────────────────────────────
info "Building images..."
docker compose build

# ── 7. Start / restart services ───────────────────────────────────────────────
info "Starting services..."
docker compose up -d

echo ""
info "Done. Container status:"
docker compose ps
echo ""
info "Tail logs : docker compose logs -f"
info "First sync: make sync"
