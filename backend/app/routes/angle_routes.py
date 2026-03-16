# app/routes/angle_routes.py

from flask import Blueprint, jsonify
from app.services.angle_service import get_knee_angle

angle_bp = Blueprint("angle", __name__)

@angle_bp.route("/angle")
def angle():
    angle = get_knee_angle()
    return jsonify({"angle": angle})