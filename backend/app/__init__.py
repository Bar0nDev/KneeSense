from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from app.config import Config
from app.database.db import db

from app.routes.session_routes import session_bp
from app.routes.user_routes import user_bp
from app.routes.test_route import test_bp # test FE-BE connection and CORS
from app.routes.practitioner_routes import practitioner_bp
from app.routes.patient_routes import patient_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "KneeSense Backend",
            "description": "API Documentation for KneeSense",
            "version": "1.0.0"
        },
        "basePath": "/api",
        "schemes": ["http", "https"],

        "definitions": {
            "User": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "username": {"type": "string"},
                    "email": {"type": "string"},
                    "role": {"type": "string"},
                    "is_active": {"type": "boolean"},
                    "created_at": {
                        "type": "string",
                        "format": "date-time"
                    }
                }
            },
            
            "Error": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                }
            },

            # Practitioner
            "Practitioner": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "clinic_name": {"type": "string"},
                    "specialization": {"type": "string"},
                    "created_at": {
                        "type": "string",
                        "format": "date-time"
                    }
                }
            },

            # Patient
            "Patient": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "practitioner_id": {"type": "integer"},
                    "name": {"type": "string"},
                    "birthday": {
                        "type": "string",
                        "format": "date"
                    },
                    "sex": {"type": "string"},
                    "height_cm": {"type": "number"},
                    "weight_kg": {"type": "number"},
                    "notes": {"type": "string"},
                    "is_active": {"type": "boolean"},
                    "created_at": {
                        "type": "string",
                        "format": "date-time"
                    }
                }
            },

            # Angle prediction response
            "AnglePrediction": {
                "type": "object",
                "properties": {
                    "angle": {
                        "type": "number",
                        "example": 145.5
                    }
                }
            },

            # Session object
            "Session": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "patient_id": {"type": "integer"},
                    "practitioner_id": {"type": "integer"},
                    "video_path": {"type": "string"},
                    "notes": {"type": "string"},
                    "created_at": {
                        "type": "string",
                        "format": "date-time"
                    }
                }
            },

            # Prediction
            "Prediction": {
                "type": "object",
                "properties": {
                    "frame_index": {"type": "integer"},
                    "predicted_angle": {"type": "number"}
                }
            },

            # LLM Insight
            "Insight": {
                "type": "object",
                "properties": {
                    "session_id": {"type": "integer"},
                    "insight_text": {"type": "string"},
                    "model": {"type": "string"}
                }
            }
        }
    }

    Swagger(app, template=swagger_template)

    app.register_blueprint(session_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(practitioner_bp, url_prefix="/api")
    app.register_blueprint(patient_bp, url_prefix="/api")

    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        print("Database initialized.")

    return app