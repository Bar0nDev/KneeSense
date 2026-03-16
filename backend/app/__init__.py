from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database.db import db

from app.routes.session_routes import session_bp
from app.routes.user_routes import user_bp
from app.routes.angle_routes import angle_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    app.register_blueprint(session_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(angle_bp, url_prefix="/api")

    return app