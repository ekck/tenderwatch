from datetime import datetime
from app import db


class Entity(db.Model):
    """Procuring entity (ministry, county government, parastatal)"""
    __tablename__ = "entities"

    id = db.Column(db.Integer, primary_key=True)
    ocid = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(500), nullable=False)
    entity_type = db.Column(db.String(50))          # national | county | parastatal
    county = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tenders = db.relationship("Tender", back_populates="entity", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "ocid": self.ocid,
            "name": self.name,
            "entity_type": self.entity_type,
            "county": self.county,
            "tender_count": self.tenders.count(),
        }


class Supplier(db.Model):
    """Company or individual that wins contracts"""
    __tablename__ = "suppliers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    identifier = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    awards = db.relationship("Award", back_populates="supplier", lazy="dynamic")

    def to_dict(self):
        total_value = sum(
            a.value_amount or 0 for a in self.awards if a.value_amount
        )
        return {
            "id": self.id,
            "name": self.name,
            "identifier": self.identifier,
            "contract_count": self.awards.count(),
            "total_value": total_value,
        }


class Tender(db.Model):
    """A procurement tender notice"""
    __tablename__ = "tenders"

    id = db.Column(db.Integer, primary_key=True)
    ocid = db.Column(db.String(200), unique=True, nullable=False)
    title = db.Column(db.String(1000))
    description = db.Column(db.Text)
    status = db.Column(db.String(50))               # active | cancelled | complete
    procurement_method = db.Column(db.String(100))  # open | direct | restricted
    category = db.Column(db.String(200))            # works | goods | services
    value_amount = db.Column(db.Float)
    value_currency = db.Column(db.String(10), default="KES")
    tender_period_start = db.Column(db.DateTime)
    tender_period_end = db.Column(db.DateTime)
    date_published = db.Column(db.DateTime)
    county = db.Column(db.String(100))

    entity_id = db.Column(db.Integer, db.ForeignKey("entities.id"))
    entity = db.relationship("Entity", back_populates="tenders")
    award = db.relationship("Award", back_populates="tender", uselist=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, detailed=False):
        data = {
            "id": self.id,
            "ocid": self.ocid,
            "title": self.title,
            "status": self.status,
            "procurement_method": self.procurement_method,
            "category": self.category,
            "value_amount": self.value_amount,
            "value_currency": self.value_currency,
            "tender_period_start": self.tender_period_start.isoformat() if self.tender_period_start else None,
            "tender_period_end": self.tender_period_end.isoformat() if self.tender_period_end else None,
            "date_published": self.date_published.isoformat() if self.date_published else None,
            "county": self.county,
            "entity": self.entity.to_dict() if self.entity else None,
        }
        if detailed:
            data["description"] = self.description
            data["award"] = self.award.to_dict() if self.award else None
        return data


class Award(db.Model):
    """Contract award linked to a tender"""
    __tablename__ = "awards"

    id = db.Column(db.Integer, primary_key=True)
    award_id = db.Column(db.String(200), unique=True)
    title = db.Column(db.String(1000))
    status = db.Column(db.String(50))
    value_amount = db.Column(db.Float)
    value_currency = db.Column(db.String(10), default="KES")
    date_awarded = db.Column(db.DateTime)

    tender_id = db.Column(db.Integer, db.ForeignKey("tenders.id"))
    tender = db.relationship("Tender", back_populates="award")

    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"))
    supplier = db.relationship("Supplier", back_populates="awards")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "award_id": self.award_id,
            "status": self.status,
            "value_amount": self.value_amount,
            "value_currency": self.value_currency,
            "date_awarded": self.date_awarded.isoformat() if self.date_awarded else None,
            "supplier": self.supplier.to_dict() if self.supplier else None,
        }


class AlertSubscription(db.Model):
    """User email alert subscription"""
    __tablename__ = "alert_subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(300), nullable=False)
    keywords = db.Column(db.String(500))        # comma-separated keywords
    categories = db.Column(db.String(300))      # comma-separated categories
    counties = db.Column(db.String(500))        # comma-separated counties
    is_active = db.Column(db.Boolean, default=True)
    confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "keywords": self.keywords.split(",") if self.keywords else [],
            "categories": self.categories.split(",") if self.categories else [],
            "counties": self.counties.split(",") if self.counties else [],
            "is_active": self.is_active,
            "confirmed": self.confirmed,
        }


class SyncLog(db.Model):
    """Tracks ETL sync history"""
    __tablename__ = "sync_logs"

    id = db.Column(db.Integer, primary_key=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    tenders_fetched = db.Column(db.Integer, default=0)
    tenders_new = db.Column(db.Integer, default=0)
    tenders_updated = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default="running")  # running | success | failed
    error = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "tenders_fetched": self.tenders_fetched,
            "tenders_new": self.tenders_new,
            "tenders_updated": self.tenders_updated,
            "status": self.status,
            "error": self.error,
        }
