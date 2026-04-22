# TenderWatch — Kenya Procurement Tracker
> A data-driven web app that aggregates Kenya government tenders from PPIP (tenders.go.ke),
> enabling SMEs, journalists and NGOs to monitor procurement opportunities and flag patterns.

## Tech Stack
- **Backend:** Python Flask + SQLAlchemy
- **Database:** SQLite (dev) → PostgreSQL (production)
- **Data Source:** PPIP OCDS feed via Open Contracting Partnership
- **Email Alerts:** Resend
- **Scheduler:** APScheduler (daily sync at 6 AM EAT)
- **Deploy:** Railway (backend) + Vercel (Next.js frontend)

## Setup

### 1. Clone & install
```bash
git clone https://github.com/youruser/tenderwatch
cd tenderwatch
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your RESEND_API_KEY and SECRET_KEY
```

### 3. Run the server
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Tenders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenders/` | List tenders (filterable) |
| GET | `/api/tenders/<id>` | Tender detail + award |
| GET | `/api/tenders/sync/status` | Latest sync log |
| POST | `/api/tenders/sync/trigger` | Trigger manual sync |

**Query params for listing:**
- `q` — keyword search
- `category` — works / goods / services
- `county` — e.g. Nairobi, Bomet
- `method` — open / direct / restricted
- `status` — active / complete / cancelled
- `page`, `per_page`

### Entities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entities/` | List procuring entities |
| GET | `/api/entities/<id>` | Entity profile + tenders |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/alerts/subscribe` | Subscribe to alerts |
| POST | `/api/alerts/unsubscribe` | Unsubscribe |
| GET | `/api/alerts/subscription/<email>` | Get subscription |

**Subscribe payload:**
```json
{
  "email": "user@example.com",
  "keywords": ["construction", "road"],
  "categories": ["works"],
  "counties": ["Bomet", "Nakuru"]
}
```

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Headline stats |
| GET | `/api/analytics/by-county` | Spend by county |
| GET | `/api/analytics/by-category` | Spend by category |
| GET | `/api/analytics/by-method` | Open vs direct procurement |
| GET | `/api/analytics/top-suppliers` | Top suppliers by value |
| GET | `/api/analytics/top-entities` | Top spenders |

## Triggering a Manual Sync
```bash
curl -X POST http://localhost:5000/api/tenders/sync/trigger \
  -H "X-Admin-Token: dev-admin"
```

## Deploying to Railway
1. Push to GitHub
2. Create Railway project → connect repo
3. Add environment variables from `.env`
4. Railway auto-detects `Procfile` and deploys

## Data Source
Primary data: [PPIP OCDS — Open Contracting Partnership](https://data.open-contracting.org/en/publication/147)
Updated daily from `tenders.go.ke/ocds`
