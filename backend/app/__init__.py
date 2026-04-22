import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///tenderwatch.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, origins=["http://localhost:3000", "https://tenderwatch.zanah.co.ke"])

    db.init_app(app)

    # Register blueprints
    from app.routes.tenders import tenders_bp
    from app.routes.entities import entities_bp
    from app.routes.alerts import alerts_bp
    from app.routes.analytics import analytics_bp

    app.register_blueprint(tenders_bp, url_prefix="/api/tenders")
    app.register_blueprint(entities_bp, url_prefix="/api/entities")
    app.register_blueprint(alerts_bp, url_prefix="/api/alerts")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")

    with app.app_context():
        db.create_all()

    return app
