from flask import Flask, app
from flasgger import Swagger
from flask_cors import CORS
from app.config import Config
from app.database.db import db

from app.routes.session_routes import session_bp
from app.routes.user_routes import user_bp
from app.routes.angle_routes import angle_bp
from app.routes.test_route import test_bp # test FE-BE connection and CORS
from app.routes.practitioner_routes import practitioner_bp
from app.routes.patient_routes import patient_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    # added Swagger for API documentation
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "KneeSense Backend",
            "description": "API Documentation for KneeSense: AI-Driven Visuotactile System for Wearable Knee Motion Assessment.",
            "contact": {
                "developedBy": "KneeSense Team",
                "lastUpdatedBy": "Jeremy",
            },
            "version": "1.0.0"
        },
        "basePath": "/api", 
        "schemes": [
            "http",
            "https"
        ]
    }

    Swagger(app, template=swagger_template)

    app.register_blueprint(session_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(angle_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(practitioner_bp, url_prefix="/api")
    app.register_blueprint(patient_bp, url_prefix="/api")

    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        print("Database initialized.")

    return app