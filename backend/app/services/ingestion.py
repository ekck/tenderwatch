"""
PPIP OCDS Ingestion Service
Fetches Kenya procurement data from tenders.go.ke/ocds
and normalizes it into the TenderWatch database.
"""
import os
import json
import logging
import requests
from datetime import datetime, date
from app import db
from app.models import Tender, Entity, Supplier, Award, SyncLog

logger = logging.getLogger(__name__)

PPIP_BASE_URL = os.getenv("PPIP_BASE_URL", "https://tenders.go.ke/ocds")

# OCP bulk download — we pull the current year's dataset
OCP_DOWNLOAD_URL = "https://data.open-contracting.org/en/publication/147/download"

KENYA_COUNTIES = {
    "nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika",
    "meru", "nyeri", "kakamega", "machakos", "bomet", "kitui",
    "kilifi", "kwale", "garissa", "isiolo", "marsabit", "wajir",
    "mandera", "turkana", "west pokot", "samburu", "trans nzoia",
    "uasin gishu", "elgeyo marakwet", "nandi", "baringo", "laikipia",
    "nakuru", "narok", "kajiado", "kericho", "bomet", "kakamega",
    "vihiga", "bungoma", "busia", "siaya", "kisumu", "homa bay",
    "migori", "kisii", "nyamira", "nairobi", "muranga", "kiambu",
    "nyandarua", "nyeri", "kirinyaga", "embu", "tharaka nithi",
    "meru", "isiolo", "marsabit", "turkana", "samburu", "machakos",
    "makueni", "kitui", "taita taveta", "kilifi", "mombasa",
    "kwale", "lamu", "tana river", "garissa", "wajir", "mandera"
}


def _parse_date(date_str):
    """Safely parse ISO date strings from OCDS data."""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(tzinfo=None)
    except (ValueError, AttributeError):
        return None


def _detect_county(text):
    """Attempt to detect a Kenya county from entity/tender text."""
    if not text:
        return None
    text_lower = text.lower()
    for county in KENYA_COUNTIES:
        if county in text_lower:
            return county.title()
    return None


def _get_or_create_entity(buyer_data):
    """Find or create a procuring entity."""
    if not buyer_data:
        return None

    ocid = buyer_data.get("id", "")
    name = buyer_data.get("name", "Unknown Entity")

    if not ocid and not name:
        return None

    entity = Entity.query.filter_by(ocid=ocid).first() if ocid else None
    if not entity and name:
        entity = Entity.query.filter_by(name=name).first()

    if not entity:
        county = _detect_county(name)
        entity_type = "county" if county else "national"
        entity = Entity(
            ocid=ocid or name[:100],
            name=name,
            entity_type=entity_type,
            county=county,
        )
        db.session.add(entity)
        db.session.flush()

    return entity


def _get_or_create_supplier(supplier_data):
    """Find or create a supplier."""
    if not supplier_data:
        return None

    name = supplier_data.get("name", "")
    identifier = supplier_data.get("identifier", {}).get("id", "")

    if not name:
        return None

    supplier = None
    if identifier:
        supplier = Supplier.query.filter_by(identifier=identifier).first()
    if not supplier:
        supplier = Supplier.query.filter_by(name=name).first()

    if not supplier:
        supplier = Supplier(name=name, identifier=identifier)
        db.session.add(supplier)
        db.session.flush()

    return supplier


def process_ocds_record(record):
    """
    Process a single OCDS contracting process record.
    Returns (is_new, is_updated) tuple.
    """
    ocid = record.get("ocid")
    if not ocid:
        return False, False

    tender_data = record.get("tender", {})
    buyer_data = record.get("buyer", {})
    awards_data = record.get("awards", [])

    # Get or create entity
    entity = _get_or_create_entity(buyer_data)

    # Check if tender exists
    existing = Tender.query.filter_by(ocid=ocid).first()
    is_new = existing is None

    tender = existing or Tender(ocid=ocid)

    # Map OCDS fields to our model
    tender.title = tender_data.get("title", "")[:1000] if tender_data.get("title") else ""
    tender.description = tender_data.get("description", "")
    tender.status = tender_data.get("status", "")
    tender.procurement_method = tender_data.get("procurementMethod", "")
    tender.category = tender_data.get("mainProcurementCategory", "")
    tender.entity = entity
    tender.county = (entity.county if entity else None) or _detect_county(tender.title)

    # Value
    value = tender_data.get("value", {})
    if value:
        tender.value_amount = value.get("amount")
        tender.value_currency = value.get("currency", "KES")

    # Dates
    period = tender_data.get("tenderPeriod", {})
    tender.tender_period_start = _parse_date(period.get("startDate"))
    tender.tender_period_end = _parse_date(period.get("endDate"))
    tender.date_published = _parse_date(record.get("date"))

    if is_new:
        db.session.add(tender)
    db.session.flush()

    # Process awards
    for award_data in (awards_data or []):
        award_id = award_data.get("id", "")
        if not award_id:
            continue

        existing_award = Award.query.filter_by(award_id=award_id).first()
        award = existing_award or Award(award_id=award_id)

        award.title = award_data.get("title", "")[:1000] if award_data.get("title") else ""
        award.status = award_data.get("status", "")
        award.date_awarded = _parse_date(award_data.get("date"))
        award.tender = tender

        award_value = award_data.get("value", {})
        if award_value:
            award.value_amount = award_value.get("amount")
            award.value_currency = award_value.get("currency", "KES")

        suppliers = award_data.get("suppliers", [])
        if suppliers:
            award.supplier = _get_or_create_supplier(suppliers[0])

        if not existing_award:
            db.session.add(award)

    return is_new, not is_new


def run_sync(app, year=None):
    """
    Main sync job. Downloads OCDS data from OCP registry
    for the given year (defaults to current year) and upserts into DB.
    """
    if year is None:
        year = date.today().year

    log = SyncLog(started_at=datetime.utcnow(), status="running")

    with app.app_context():
        db.session.add(log)
        db.session.commit()

        try:
            url = f"{OCP_DOWNLOAD_URL}?name={year}.jsonl.gz"
            logger.info(f"Fetching PPIP data from {url}")

            resp = requests.get(url, stream=True, timeout=120)
            resp.raise_for_status()

            import gzip
            import io

            new_count = 0
            updated_count = 0
            total = 0
            batch_size = 100

            with gzip.GzipFile(fileobj=io.BytesIO(resp.content)) as gz:
                for line in gz:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        record = json.loads(line)
                        is_new, is_updated = process_ocds_record(record)
                        if is_new:
                            new_count += 1
                        elif is_updated:
                            updated_count += 1
                        total += 1

                        if total % batch_size == 0:
                            db.session.commit()
                            logger.info(f"Processed {total} records...")

                    except (json.JSONDecodeError, Exception) as e:
                        logger.warning(f"Skipping bad record: {e}")
                        continue

            db.session.commit()

            log.completed_at = datetime.utcnow()
            log.tenders_fetched = total
            log.tenders_new = new_count
            log.tenders_updated = updated_count
            log.status = "success"
            db.session.commit()

            logger.info(
                f"Sync complete — {total} records, {new_count} new, {updated_count} updated"
            )

            # Trigger alerts for new tenders
            from app.services.alerts import send_matching_alerts
            send_matching_alerts(app)

        except Exception as e:
            logger.error(f"Sync failed: {e}")
            log.status = "failed"
            log.error = str(e)
            log.completed_at = datetime.utcnow()
            db.session.commit()
            raise
