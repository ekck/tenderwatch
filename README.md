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
RESEND_API_KEY=   # optional — for email alerts
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
| `make deploy` | Pull latest + build + start (runs `deploy.sh`) |

---

## Environment Variables

All variables go in `.env` at the project root.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ Yes | Flask secret key — use a long random string |
| `ADMIN_TOKEN` | ✅ Yes | Token for `/api/tenders/sync/trigger` endpoint |
| `RESEND_API_KEY` | Optional | From resend.com — enables email alerts |
| `PORT` | Optional | Host port nginx listens on (default: 80, unused on VPS) |
| `FLASK_ENV` | Optional | `production` or `development` (default: production) |

---

## Deployment to a VPS (shared server with other sites)

This setup is designed for a VPS that already runs other Docker containers or sites.
The internal nginx binds to `127.0.0.1:8080` (localhost only) — your system nginx
proxies the domain to it, so there are no port conflicts.

### 1. Provision a server
Ubuntu 22.04 LTS, minimum 1 GB RAM (2 GB recommended for the Next.js build).

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone and configure
```bash
git clone git@github.com:ekck/tenderwatch.git
cd tenderwatch
cp docker-compose.override.yml.example docker-compose.override.yml
```

### 4. First deploy
```bash
./deploy.sh
```

On first run this creates `.env` from the example and exits with instructions.
Fill in the required values — including the `PORT` binding for a shared VPS:

```bash
nano .env
```

```env
SECRET_KEY=<long random string>
ADMIN_TOKEN=<random token>
PORT=127.0.0.1:8080    # Binds nginx to localhost only — system nginx proxies to it
```

Then run again:
```bash
./deploy.sh      # Builds images and starts all services
```

### 5. Point your domain
Add DNS A records:
```
tenderwatch.co.ke     → your-server-ip
www.tenderwatch.co.ke → your-server-ip
```

### 6. Add a system nginx site

Create `/etc/nginx/sites-available/tenderwatch`:

```nginx
server {
    listen 80;
    server_name tenderwatch.co.ke www.tenderwatch.co.ke;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
```

Enable it and reload:
```bash
sudo ln -s /etc/nginx/sites-available/tenderwatch /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. Add HTTPS with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tenderwatch.co.ke -d www.tenderwatch.co.ke
```

Certbot updates the nginx site config automatically and sets up auto-renewal.

### 8. Load procurement data

```bash
make sync          # Triggers the first PPIP data download
make sync-status   # Check progress
```

The sync also runs automatically every day at **06:00 EAT (03:00 UTC)**.

---

## Updating the app

SSH into the VPS and run:

```bash
cd tenderwatch
./deploy.sh      # pulls latest, rebuilds, restarts
```

Or from your local machine:
```bash
ssh user@your-vps "cd /path/to/tenderwatch && git pull && ./deploy.sh"
```

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
