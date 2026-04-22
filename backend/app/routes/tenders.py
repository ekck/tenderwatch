from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app import db
from app.models import Tender, SyncLog

tenders_bp = Blueprint("tenders", __name__)


@tenders_bp.route("/", methods=["GET"])
def list_tenders():
    """
    GET /api/tenders/
    Query params:
      - q: keyword search in title
      - category: filter by category (works|goods|services)
      - county: filter by county
      - method: procurement method (open|direct|restricted)
      - status: tender status (active|complete|cancelled)
      - page: page number (default 1)
      - per_page: results per page (default 20, max 100)
    """
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    query = Tender.query

    # Keyword search
    q = request.args.get("q", "").strip()
    if q:
        query = query.filter(
            or_(
                Tender.title.ilike(f"%{q}%"),
                Tender.description.ilike(f"%{q}%"),
            )
        )

    # Filters
    if category := request.args.get("category"):
        query = query.filter(Tender.category.ilike(f"%{category}%"))

    if county := request.args.get("county"):
        query = query.filter(Tender.county.ilike(f"%{county}%"))

    if method := request.args.get("method"):
        query = query.filter(Tender.procurement_method.ilike(f"%{method}%"))

    if status := request.args.get("status"):
        query = query.filter(Tender.status == status)

    # Sort newest first
    query = query.order_by(Tender.date_published.desc().nullslast(), Tender.created_at.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "tenders": [t.to_dict() for t in paginated.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": paginated.total,
            "pages": paginated.pages,
            "has_next": paginated.has_next,
            "has_prev": paginated.has_prev,
        }
    })


@tenders_bp.route("/<int:tender_id>", methods=["GET"])
def get_tender(tender_id):
    """GET /api/tenders/<id> — full tender detail with award info"""
    tender = Tender.query.get_or_404(tender_id)
    return jsonify(tender.to_dict(detailed=True))


@tenders_bp.route("/sync/status", methods=["GET"])
def sync_status():
    """GET /api/tenders/sync/status — latest sync log"""
    log = SyncLog.query.order_by(SyncLog.started_at.desc()).first()
    if not log:
        return jsonify({"status": "never_run"})
    return jsonify(log.to_dict())


@tenders_bp.route("/sync/trigger", methods=["POST"])
def trigger_sync():
    """
    POST /api/tenders/sync/trigger — manually trigger a sync.
    In production, protect this with an admin token.
    """
    token = request.headers.get("X-Admin-Token", "")
    import os
    if token != os.getenv("ADMIN_TOKEN", "dev-admin"):
        return jsonify({"error": "Unauthorized"}), 401

    import threading
    from flask import current_app
    from app.services.ingestion import run_sync

    app = current_app._get_current_object()
    thread = threading.Thread(target=run_sync, args=(app,))
    thread.daemon = True
    thread.start()

    return jsonify({"message": "Sync triggered in background"}), 202
