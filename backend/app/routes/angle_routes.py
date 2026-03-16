from flask import Blueprint, request, jsonify
from app.services.angle_service import predict_knee_angle

angle_bp = Blueprint("angle", __name__)

@angle_bp.route("/angle", methods=["POST"])
def get_angle():
    data = request.json

    if not data or "frame_paths" not in data:
        return jsonify({"error": "Missing 'frame_paths' in request body"}), 400

    frame_paths = data["frame_paths"]

    if not isinstance(frame_paths, list) or len(frame_paths) != 9:
        return jsonify({"error": "frame_paths must be a list of exactly 9 paths"}), 400

    try:
        result = predict_knee_angle(frame_paths)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500