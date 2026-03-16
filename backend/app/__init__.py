from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database.db import db

# import route blueprints
from app.routes.session_routes import session_bp
from app.routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)

    # load config
    app.config.from_object(Config)

    # enable CORS
    CORS(app)

    # initialize database
    db.init_app(app)

    # register API routes
    app.register_blueprint(session_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")

    return app