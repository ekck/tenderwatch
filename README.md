# TenderWatch Kenya — Docker Monorepo

Kenya government procurement tracker. Runs as a single Docker Compose stack:
**Nginx → Next.js frontend + Flask API backend**, with SQLite persisted to a host volume.

```
tenderwatch-docker/
├── backend/          Flask API + PPIP data ingestion
├── frontend/         Next.js 14 frontend
├── nginx/            Reverse proxy config
├── data/             SQLite database (persisted, gitignored)
├── docker-compose.yml
├── .env.example
└── Makefile          Convenience commands
```

## Architecture

```
Browser
  │
  ▼ :80
┌──────────────────────────────────────────┐
│              Nginx (reverse proxy)       │
│  /api/*  ──────────────► Flask :5000     │
│  /*      ──────────────► Next.js :3000   │
└──────────────────────────────────────────┘
                 │
                 ▼
           SQLite /data/tenderwatch.db
           (mounted from ./data/ on host)
```

---

## Quick Start

### Prerequisites
- Docker ≥ 24
- Docker Compose v2 (`docker compose` not `docker-compose`)

### 1. Clone and configure

```bash
git clone https://github.com/youruser/tenderwatch
cd tenderwatch

cp .env.example .env
```

Edit `.env` — at minimum set a strong `SECRET_KEY` and `ADMIN_TOKEN`:

```env
SECRET_KEY=your-long-random-secret-here
ADMIN_TOKEN=your-admin-token-here
RESEND_API_KEY=           # optional — for email alerts
NEXT_PUBLIC_ADSENSE_ID=   # optional — add after AdSense approval
```

### 2. Build and start

```bash
make build   # Build all images (~3–5 minutes first time)
make up      # Start all services in background
```

Or in one step with logs visible:
```bash
make up-logs
```

### 3. Verify it's running

```bash
make health
# Backend:  200
# Frontend: 200
# Nginx:    200
```

Open **http://localhost** in your browser.

### 4. Load procurement data

Trigger the first PPIP sync (downloads ~year of Kenya tender data):

```bash
make sync
```

This runs in the background. Check progress:
```bash
make sync-status
```

The sync runs automatically every day at **06:00 EAT (03:00 UTC)**.

---

## Common Commands

| Command | What it does |
|---|---|
| `make build` | Build all Docker images |
| `make up` | Start all services (detached) |
| `make down` | Stop all services |
| `make logs` | Tail all logs |
| `make logs-backend` | Flask API logs only |
| `make logs-frontend` | Next.js logs only |
| `make sync` | Trigger manual PPIP data sync |
| `make sync-status` | Check last sync status |
| `make shell-backend` | Shell into Flask container |
| `make health` | Check HTTP status of all services |
| `make clean` | Remove all containers + images |

---

## Environment Variables

All variables go in `.env` at the project root.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ Yes | Flask secret key — use a long random string |
| `ADMIN_TOKEN` | ✅ Yes | Token for `/api/tenders/sync/trigger` endpoint |
| `RESEND_API_KEY` | Optional | From resend.com — enables email alerts |
| `NEXT_PUBLIC_ADSENSE_ID` | Optional | Google AdSense publisher ID (ca-pub-XXXX) |
| `PORT` | Optional | Host port nginx listens on (default: 80) |
| `FLASK_ENV` | Optional | `production` or `development` (default: production) |

---

## Activating Google AdSense

1. Apply at [google.com/adsense](https://google.com/adsense) using your domain
2. Add the verification script — paste your publisher ID into `.env`:
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
3. Rebuild the frontend image (AdSense ID is baked into the build):
   ```bash
   docker compose build frontend
   docker compose up -d frontend
   ```
4. After approval, create ad units in AdSense dashboard and replace the
   placeholder slot IDs in `frontend/components/ads/AdUnit.tsx` and the
   page files. See `frontend/README.md` for the full slot reference table.

---

## Deployment to a VPS (DigitalOcean / Hetzner / AWS EC2)

### 1. Provision a server
Ubuntu 22.04 LTS, minimum 1GB RAM (2GB recommended for the Next.js build).

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone and configure
```bash
git clone https://github.com/youruser/tenderwatch
cd tenderwatch
cp .env.example .env
nano .env   # Fill in SECRET_KEY, ADMIN_TOKEN, RESEND_API_KEY
```

### 4. Point your domain
Add a DNS A record:
```
tenderwatch.zanah.co.ke → your-server-ip
```

### 5. Build and start
```bash
make build && make up
```

### 6. Add HTTPS with Certbot (recommended)

Install nginx on the host as a TLS terminator, then proxy to Docker's port 80.
Or use Traefik as the reverse proxy with automatic Let's Encrypt:

```bash
# Option A: Certbot on host nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tenderwatch.zanah.co.ke
```

Update `PORT=8080` in `.env` so Docker nginx doesn't conflict with host nginx,
then configure host nginx to proxy `https://tenderwatch.zanah.co.ke` → `http://localhost:8080`.

---

## Data Persistence

The SQLite database is stored in `./data/tenderwatch.db` on the host machine,
mounted into the backend container at `/data/tenderwatch.db`. This means:

- ✅ Data survives container restarts and image rebuilds
- ✅ You can back up the database by copying `./data/tenderwatch.db`
- ✅ You can inspect it with any SQLite client

```bash
# Backup
cp ./data/tenderwatch.db ./data/tenderwatch-backup-$(date +%Y%m%d).db

# Inspect
sqlite3 ./data/tenderwatch.db ".tables"
sqlite3 ./data/tenderwatch.db "SELECT count(*) FROM tenders;"
```

---

## API Reference

All API endpoints are available at `/api/*` (proxied through nginx):

| Endpoint | Description |
|---|---|
| `GET /api/tenders/` | List tenders (filterable) |
| `GET /api/tenders/<id>` | Tender detail |
| `GET /api/tenders/sync/status` | Last sync info |
| `POST /api/tenders/sync/trigger` | Manual sync (requires X-Admin-Token header) |
| `GET /api/entities/` | List entities |
| `GET /api/entities/<id>` | Entity profile |
| `GET /api/analytics/summary` | Dashboard stats |
| `GET /api/analytics/by-county` | Spend by county |
| `GET /api/analytics/by-category` | Spend by category |
| `GET /api/analytics/by-method` | Open vs direct procurement |
| `GET /api/analytics/top-suppliers` | Top suppliers by value |
| `POST /api/alerts/subscribe` | Subscribe to alerts |
| `POST /api/alerts/unsubscribe` | Unsubscribe |

---

## Troubleshooting

**Backend not starting:**
```bash
make logs-backend
# Check for missing SECRET_KEY or database permission errors
```

**Frontend build fails:**
```bash
docker compose build frontend --no-cache
# Usually a missing dependency — check package.json
```

**Nginx 502 Bad Gateway:**
```bash
make logs-nginx
# Usually means backend or frontend hasn't started yet — wait 30s and retry
```

**Sync not running:**
```bash
make sync-status   # Check last sync log
make sync          # Trigger manually
make logs-backend  # Watch the ingestion output
```
