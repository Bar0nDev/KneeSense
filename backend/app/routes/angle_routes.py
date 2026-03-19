from flask import Blueprint, request, jsonify
from app.services.angle_service import predict_knee_angle

angle_bp = Blueprint("angle", __name__)

@angle_bp.route("/angle", methods=["POST"])
def get_angle():

    # Swagger documentation for the /angle endpoint (V1.0)
    """
    Predict Knee Angle from Video Frames
    ---
    tags:
      - AI Analysis
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            frame_paths:
              type: array
              items:
                type: string
              example: ["path/1.jpg", "path/2.jpg", "path/3.jpg", "path/4.jpg", "path/5.jpg", "path/6.jpg", "path/7.jpg", "path/8.jpg", "path/9.jpg"]
              description: A list of exactly 9 file paths to the video frames.
    responses:
      200:
        description: Prediction successful
        schema:
          properties:
            angle:
              type: number
              example: 145.5
      400:
        description: Invalid input data
      500:
        description: AI Model processing error
    """
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