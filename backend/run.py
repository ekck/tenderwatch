import logging
import os
from app import create_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s"
)

app = create_app()


def start_scheduler():
    """Start APScheduler to run daily sync at 6 AM EAT (3 AM UTC)."""
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.services.ingestion import run_sync

    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        func=run_sync,
        args=[app],
        trigger="cron",
        hour=3,
        minute=0,
        id="daily_ppip_sync",
        replace_existing=True,
    )
    scheduler.start()
    logging.getLogger(__name__).info("Scheduler started — daily sync at 03:00 UTC")
    return scheduler


if __name__ == "__main__":
    scheduler = start_scheduler()
    try:
        app.run(
            host="0.0.0.0",
            port=int(os.getenv("PORT", 5000)),
            debug=os.getenv("FLASK_ENV") == "development",
        )
    finally:
        scheduler.shutdown()
