from flask import Blueprint, request, jsonify
from app import db
from app.models import AlertSubscription

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/subscribe", methods=["POST"])
def subscribe():
    """POST /api/alerts/subscribe — create an alert subscription"""
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"error": "Email is required"}), 400

    email = data["email"].strip().lower()

    # Check for existing subscription
    existing = AlertSubscription.query.filter_by(email=email).first()
    if existing:
        # Update preferences
        existing.keywords = ",".join(data.get("keywords", []))
        existing.categories = ",".join(data.get("categories", []))
        existing.counties = ",".join(data.get("counties", []))
        existing.is_active = True
        db.session.commit()
        return jsonify({"message": "Subscription updated", "subscription": existing.to_dict()})

    sub = AlertSubscription(
        email=email,
        keywords=",".join(data.get("keywords", [])),
        categories=",".join(data.get("categories", [])),
        counties=",".join(data.get("counties", [])),
        confirmed=True,  # Set to False and send confirmation email in production
    )
    db.session.add(sub)
    db.session.commit()

    return jsonify({
        "message": "Subscribed successfully",
        "subscription": sub.to_dict()
    }), 201


@alerts_bp.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    """POST /api/alerts/unsubscribe — deactivate a subscription"""
    data = request.get_json()
    email = (data or {}).get("email", "").strip().lower()

    sub = AlertSubscription.query.filter_by(email=email).first()
    if not sub:
        return jsonify({"error": "Subscription not found"}), 404

    sub.is_active = False
    db.session.commit()
    return jsonify({"message": "Unsubscribed successfully"})


@alerts_bp.route("/subscription/<email>", methods=["GET"])
def get_subscription(email):
    """GET /api/alerts/subscription/<email> — fetch subscription details"""
    sub = AlertSubscription.query.filter_by(
        email=email.lower(), is_active=True
    ).first()
    if not sub:
        return jsonify({"error": "No active subscription found"}), 404
    return jsonify(sub.to_dict())
