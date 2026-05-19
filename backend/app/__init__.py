from flask import Flask, request, jsonify, g
from flasgger import Swagger
from flask_cors import CORS
from app.config import Config
from app.database.firebase.firebase_db import get_fs_db
from firebase_admin import auth as firebase_auth
from app.middleware.auth import PUBLIC_ROUTES

from app.routes.session_routes import session_bp
from app.routes.user_routes import user_bp
from app.routes.test_route import test_bp # test FE-BE connection and CORS
from app.routes.practitioner_routes import practitioner_bp
from app.routes.patient_routes import patient_bp
from app.routes.exercise_routes import exercise_bp
from app.routes.template_routes import template_bp
from app.routes.upload_routes import upload_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)


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

    # Initialize Firebase so firebase_auth is ready before any request
    get_fs_db()

    @app.before_request
    def auth_middleware():
        if request.method == "OPTIONS":
            return None
        if request.path in PUBLIC_ROUTES:
            return None
        if request.path.startswith("/apidocs") or request.path.startswith("/apispec"):
            return None
        if request.path.startswith("/api/data/videos/"):
            return None

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split("Bearer ")[1]
        try:
            decoded = firebase_auth.verify_id_token(token)
            g.uid = decoded["uid"]
            g.email = decoded.get("email", "")
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

    app.register_blueprint(session_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(practitioner_bp, url_prefix="/api")
    app.register_blueprint(patient_bp, url_prefix="/api")
    app.register_blueprint(exercise_bp, url_prefix="/api")
    app.register_blueprint(template_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")

    return app