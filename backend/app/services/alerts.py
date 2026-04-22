"""
Alert Service — matches new tenders to subscriptions and sends emails via Resend.
"""
import os
import logging
import resend
from datetime import datetime, timedelta
from app import db
from app.models import Tender, AlertSubscription

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = "TenderWatch <alerts@tenderwatch.zanah.co.ke>"


def _tender_matches_subscription(tender, sub):
    """Check if a tender matches a user's alert subscription."""
    keywords = [k.strip().lower() for k in sub.keywords.split(",") if k.strip()] if sub.keywords else []
    categories = [c.strip().lower() for c in sub.categories.split(",") if c.strip()] if sub.categories else []
    counties = [c.strip().lower() for c in sub.counties.split(",") if c.strip()] if sub.counties else []

    # If no filters set, match everything
    if not keywords and not categories and not counties:
        return True

    searchable = f"{tender.title or ''} {tender.description or ''}".lower()

    keyword_match = any(kw in searchable for kw in keywords) if keywords else True
    category_match = (tender.category or "").lower() in categories if categories else True
    county_match = (tender.county or "").lower() in counties if counties else True

    return keyword_match and category_match and county_match


def _build_email_html(tenders, email):
    """Build HTML email body for matched tenders."""
    rows = ""
    for t in tenders:
        value_str = f"KES {t.value_amount:,.0f}" if t.value_amount else "Not specified"
        deadline = t.tender_period_end.strftime("%d %b %Y") if t.tender_period_end else "Open"
        rows += f"""
        <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">
                <strong>{t.title or 'Untitled Tender'}</strong><br>
                <span style="color:#666;font-size:13px;">
                    {t.entity.name if t.entity else 'Unknown Entity'} &bull;
                    {t.category or 'General'} &bull;
                    {t.county or 'National'}
                </span>
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;white-space:nowrap;">{value_str}</td>
            <td style="padding:12px;border-bottom:1px solid #eee;white-space:nowrap;">{deadline}</td>
        </tr>
        """

    unsubscribe_url = f"https://tenderwatch.zanah.co.ke/unsubscribe?email={email}"

    return f"""
    <html>
    <body style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#333;">
        <div style="background:#1a56db;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">🔔 TenderWatch — New Matching Tenders</h1>
        </div>
        <div style="padding:20px;background:#f9f9f9;">
            <p>We found <strong>{len(tenders)} new tender(s)</strong> matching your alert preferences.</p>
            <table style="width:100%;background:white;border-radius:8px;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f0f4ff;">
                        <th style="padding:12px;text-align:left;">Tender</th>
                        <th style="padding:12px;text-align:left;">Value</th>
                        <th style="padding:12px;text-align:left;">Deadline</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <p style="margin-top:20px;">
                <a href="https://tenderwatch.zanah.co.ke" style="background:#1a56db;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
                    View All Tenders →
                </a>
            </p>
        </div>
        <div style="padding:15px;color:#999;font-size:12px;text-align:center;">
            TenderWatch by Zanah &bull;
            <a href="{unsubscribe_url}" style="color:#999;">Unsubscribe</a>
        </div>
    </body>
    </html>
    """


def send_matching_alerts(app):
    """
    For each active confirmed subscription, find tenders created in the
    last 24 hours that match, and send an email digest.
    """
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set — skipping alerts")
        return

    with app.app_context():
        subscriptions = AlertSubscription.query.filter_by(
            is_active=True, confirmed=True
        ).all()

        since = datetime.utcnow() - timedelta(hours=24)
        new_tenders = Tender.query.filter(Tender.created_at >= since).all()

        if not new_tenders:
            logger.info("No new tenders — skipping alerts")
            return

        sent_count = 0
        for sub in subscriptions:
            matched = [t for t in new_tenders if _tender_matches_subscription(t, sub)]
            if not matched:
                continue

            try:
                resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": [sub.email],
                    "subject": f"TenderWatch: {len(matched)} new tender(s) for you",
                    "html": _build_email_html(matched, sub.email),
                })
                sent_count += 1
                logger.info(f"Alert sent to {sub.email} — {len(matched)} tenders")
            except Exception as e:
                logger.error(f"Failed to send alert to {sub.email}: {e}")

        logger.info(f"Alerts sent to {sent_count} subscribers")
