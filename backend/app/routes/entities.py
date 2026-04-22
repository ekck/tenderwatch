from flask import Blueprint, request, jsonify
from app.models import Entity, Tender
from sqlalchemy import func
from app import db

entities_bp = Blueprint("entities", __name__)


@entities_bp.route("/", methods=["GET"])
def list_entities():
    """GET /api/entities/ — list procuring entities with tender counts"""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    county = request.args.get("county", "").strip()
    entity_type = request.args.get("type", "").strip()

    query = Entity.query
    if county:
        query = query.filter(Entity.county.ilike(f"%{county}%"))
    if entity_type:
        query = query.filter(Entity.entity_type == entity_type)

    query = query.order_by(Entity.name)
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "entities": [e.to_dict() for e in paginated.items],
        "pagination": {
            "page": page,
            "total": paginated.total,
            "pages": paginated.pages,
        }
    })


@entities_bp.route("/<int:entity_id>", methods=["GET"])
def get_entity(entity_id):
    """GET /api/entities/<id> — entity profile with recent tenders"""
    entity = Entity.query.get_or_404(entity_id)
    recent_tenders = (
        entity.tenders.order_by(Tender.date_published.desc()).limit(10).all()
    )

    # Total contract value
    total_value = db.session.query(
        func.sum(Tender.value_amount)
    ).filter(Tender.entity_id == entity_id).scalar() or 0

    data = entity.to_dict()
    data["total_contract_value"] = total_value
    data["recent_tenders"] = [t.to_dict() for t in recent_tenders]
    return jsonify(data)
