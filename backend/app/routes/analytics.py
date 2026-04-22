from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import db
from app.models import Tender, Award, Entity, Supplier

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
def summary():
    """GET /api/analytics/summary — headline stats for the dashboard"""
    total_tenders = Tender.query.count()
    total_awards = Award.query.count()
    total_entities = Entity.query.count()
    total_suppliers = Supplier.query.count()

    total_value = db.session.query(func.sum(Award.value_amount)).scalar() or 0

    direct_procurement = Tender.query.filter(
        Tender.procurement_method.ilike("%direct%")
    ).count()

    return jsonify({
        "total_tenders": total_tenders,
        "total_awards": total_awards,
        "total_entities": total_entities,
        "total_suppliers": total_suppliers,
        "total_contract_value_kes": total_value,
        "direct_procurement_count": direct_procurement,
        "direct_procurement_pct": round(
            (direct_procurement / total_tenders * 100) if total_tenders else 0, 1
        ),
    })


@analytics_bp.route("/by-county", methods=["GET"])
def by_county():
    """GET /api/analytics/by-county — tender counts and values by county"""
    results = (
        db.session.query(
            Tender.county,
            func.count(Tender.id).label("tender_count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.county.isnot(None))
        .group_by(Tender.county)
        .order_by(func.count(Tender.id).desc())
        .all()
    )

    return jsonify([
        {
            "county": r.county,
            "tender_count": r.tender_count,
            "total_value": float(r.total_value or 0),
        }
        for r in results
    ])


@analytics_bp.route("/by-category", methods=["GET"])
def by_category():
    """GET /api/analytics/by-category — tender split by procurement category"""
    results = (
        db.session.query(
            Tender.category,
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.category.isnot(None))
        .group_by(Tender.category)
        .order_by(func.count(Tender.id).desc())
        .all()
    )

    return jsonify([
        {
            "category": r.category,
            "count": r.count,
            "total_value": float(r.total_value or 0),
        }
        for r in results
    ])


@analytics_bp.route("/by-method", methods=["GET"])
def by_method():
    """GET /api/analytics/by-method — open vs direct vs restricted procurement"""
    results = (
        db.session.query(
            Tender.procurement_method,
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.procurement_method.isnot(None))
        .group_by(Tender.procurement_method)
        .order_by(func.count(Tender.id).desc())
        .all()
    )

    return jsonify([
        {
            "method": r.procurement_method,
            "count": r.count,
            "total_value": float(r.total_value or 0),
        }
        for r in results
    ])


@analytics_bp.route("/top-suppliers", methods=["GET"])
def top_suppliers():
    """GET /api/analytics/top-suppliers — suppliers by total contract value"""
    limit = request.args.get("limit", 10, type=int)
    results = (
        db.session.query(
            Supplier.name,
            func.count(Award.id).label("contract_count"),
            func.sum(Award.value_amount).label("total_value"),
        )
        .join(Award, Award.supplier_id == Supplier.id)
        .group_by(Supplier.id)
        .order_by(func.sum(Award.value_amount).desc())
        .limit(limit)
        .all()
    )

    return jsonify([
        {
            "supplier": r.name,
            "contract_count": r.contract_count,
            "total_value": float(r.total_value or 0),
        }
        for r in results
    ])


@analytics_bp.route("/top-entities", methods=["GET"])
def top_entities():
    """GET /api/analytics/top-entities — entities by total procurement spend"""
    limit = request.args.get("limit", 10, type=int)
    results = (
        db.session.query(
            Entity.name,
            Entity.county,
            func.count(Tender.id).label("tender_count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .join(Tender, Tender.entity_id == Entity.id)
        .group_by(Entity.id)
        .order_by(func.sum(Tender.value_amount).desc())
        .limit(limit)
        .all()
    )

    return jsonify([
        {
            "entity": r.name,
            "county": r.county,
            "tender_count": r.tender_count,
            "total_value": float(r.total_value or 0),
        }
        for r in results
    ])


@analytics_bp.route("/by-status", methods=["GET"])
def by_status():
    """GET /api/analytics/by-status — tender counts by status"""
    results = (
        db.session.query(
            Tender.status,
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.status.isnot(None))
        .group_by(Tender.status)
        .order_by(func.count(Tender.id).desc())
        .all()
    )
    return jsonify([
        {"status": r.status, "count": r.count, "total_value": float(r.total_value or 0)}
        for r in results
    ])


@analytics_bp.route("/by-month", methods=["GET"])
def by_month():
    """GET /api/analytics/by-month — tender volume by month (last 12 months)"""
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(days=365)

    results = (
        db.session.query(
            func.strftime('%Y-%m', Tender.date_published).label("month"),
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.date_published >= cutoff)
        .filter(Tender.date_published.isnot(None))
        .group_by(func.strftime('%Y-%m', Tender.date_published))
        .order_by(func.strftime('%Y-%m', Tender.date_published))
        .all()
    )
    return jsonify([
        {"month": r.month, "count": r.count, "total_value": float(r.total_value or 0)}
        for r in results
    ])


@analytics_bp.route("/value-ranges", methods=["GET"])
def value_ranges():
    """GET /api/analytics/value-ranges — tender distribution by contract value band"""
    from sqlalchemy import case
    bands = (
        db.session.query(
            case(
                (Tender.value_amount < 1_000_000, 'Under 1M'),
                (Tender.value_amount < 10_000_000, '1M–10M'),
                (Tender.value_amount < 50_000_000, '10M–50M'),
                (Tender.value_amount < 100_000_000, '50M–100M'),
                (Tender.value_amount < 500_000_000, '100M–500M'),
                else_='Over 500M'
            ).label("band"),
            func.count(Tender.id).label("count"),
        )
        .filter(Tender.value_amount.isnot(None))
        .group_by("band")
        .all()
    )
    order = ['Under 1M','1M–10M','10M–50M','50M–100M','100M–500M','Over 500M']
    data = {r.band: r.count for r in bands}
    return jsonify([{"band": b, "count": data.get(b, 0)} for b in order])


@analytics_bp.route("/county/<county_name>", methods=["GET"])
def county_detail(county_name):
    """GET /api/analytics/county/<name> — full analytics for a specific county"""
    from datetime import datetime, timedelta

    # Normalize county name for flexible matching
    county_q = county_name.replace('-', ' ').replace('_', ' ')

    base = Tender.query.filter(Tender.county.ilike(f"%{county_q}%"))

    total_tenders   = base.count()
    active_tenders  = base.filter(Tender.status == 'active').count()
    total_value     = db.session.query(func.sum(Tender.value_amount)).filter(
        Tender.county.ilike(f"%{county_q}%")
    ).scalar() or 0

    direct = base.filter(Tender.procurement_method.ilike('%direct%')).count()
    direct_pct = round((direct / total_tenders * 100) if total_tenders else 0, 1)

    # By category
    by_category = (
        db.session.query(
            Tender.category,
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .filter(Tender.category.isnot(None))
        .group_by(Tender.category)
        .order_by(func.count(Tender.id).desc())
        .all()
    )

    # By method
    by_method = (
        db.session.query(
            Tender.procurement_method,
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .filter(Tender.procurement_method.isnot(None))
        .group_by(Tender.procurement_method)
        .order_by(func.count(Tender.id).desc())
        .all()
    )

    # By status
    by_status = (
        db.session.query(
            Tender.status,
            func.count(Tender.id).label("count"),
        )
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .filter(Tender.status.isnot(None))
        .group_by(Tender.status)
        .all()
    )

    # Monthly trend (last 18 months)
    cutoff = datetime.utcnow() - timedelta(days=548)
    by_month = (
        db.session.query(
            func.strftime('%Y-%m', Tender.date_published).label("month"),
            func.count(Tender.id).label("count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .filter(Tender.date_published >= cutoff)
        .filter(Tender.date_published.isnot(None))
        .group_by(func.strftime('%Y-%m', Tender.date_published))
        .order_by(func.strftime('%Y-%m', Tender.date_published))
        .all()
    )

    # Top entities in county
    top_entities = (
        db.session.query(
            Entity.name,
            func.count(Tender.id).label("tender_count"),
            func.sum(Tender.value_amount).label("total_value"),
        )
        .join(Tender, Tender.entity_id == Entity.id)
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .group_by(Entity.id)
        .order_by(func.sum(Tender.value_amount).desc())
        .limit(8)
        .all()
    )

    # Top suppliers in county (via award join)
    top_suppliers = (
        db.session.query(
            Supplier.name,
            func.count(Award.id).label("contract_count"),
            func.sum(Award.value_amount).label("total_value"),
        )
        .join(Award, Award.supplier_id == Supplier.id)
        .join(Tender, Award.tender_id == Tender.id)
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .group_by(Supplier.id)
        .order_by(func.sum(Award.value_amount).desc())
        .limit(8)
        .all()
    )

    # Value ranges
    from sqlalchemy import case
    ranges = (
        db.session.query(
            case(
                (Tender.value_amount < 1_000_000, 'Under 1M'),
                (Tender.value_amount < 10_000_000, '1M–10M'),
                (Tender.value_amount < 50_000_000, '10M–50M'),
                (Tender.value_amount < 100_000_000, '50M–100M'),
                (Tender.value_amount < 500_000_000, '100M–500M'),
                else_='Over 500M'
            ).label("band"),
            func.count(Tender.id).label("count"),
        )
        .filter(Tender.county.ilike(f"%{county_q}%"))
        .filter(Tender.value_amount.isnot(None))
        .group_by("band")
        .all()
    )
    band_order = ['Under 1M', '1M–10M', '10M–50M', '50M–100M', '100M–500M', 'Over 500M']
    range_data = {r.band: r.count for r in ranges}

    return jsonify({
        "county": county_q.title(),
        "summary": {
            "total_tenders": total_tenders,
            "active_tenders": active_tenders,
            "total_value": float(total_value),
            "direct_procurement_pct": direct_pct,
            "direct_count": direct,
        },
        "by_category": [
            {"category": r.category, "count": r.count, "total_value": float(r.total_value or 0)}
            for r in by_category
        ],
        "by_method": [
            {"method": r.procurement_method, "count": r.count, "total_value": float(r.total_value or 0)}
            for r in by_method
        ],
        "by_status": [
            {"status": r.status, "count": r.count}
            for r in by_status
        ],
        "by_month": [
            {"month": r.month, "count": r.count, "total_value": float(r.total_value or 0)}
            for r in by_month
        ],
        "top_entities": [
            {"entity": r.name, "tender_count": r.tender_count, "total_value": float(r.total_value or 0)}
            for r in top_entities
        ],
        "top_suppliers": [
            {"supplier": r.name, "contract_count": r.contract_count, "total_value": float(r.total_value or 0)}
            for r in top_suppliers
        ],
        "value_ranges": [
            {"band": b, "count": range_data.get(b, 0)} for b in band_order
        ],
    })
