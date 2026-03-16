import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from app.database.db import db
from app.database.models import Session, FramePrediction, LLMInsight
from app.services.video_service import run_inference_and_store

session_bp = Blueprint("sessions", __name__)

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi", "mkv"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =========================
# CREATE SESSION (with video upload)
# =========================

@session_bp.route("/sessions", methods=["POST"])
def create_session():
    patient_id = request.form.get("patient_id")
    practitioner_id = request.form.get("practitioner_id")
    notes = request.form.get("notes")

    if not patient_id or not practitioner_id:
        return jsonify({"error": "patient_id and practitioner_id are required"}), 400

    video_path = None

    if "video" in request.files:
        file = request.files["video"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        videos_dir = os.path.join(current_app.config["DATA_DIR"], "videos")
        os.makedirs(videos_dir, exist_ok=True)

        filename = secure_filename(file.filename)
        video_path = os.path.join(videos_dir, filename)
        file.save(video_path)

    session = Session(
        patient_id=int(patient_id),
        practitioner_id=int(practitioner_id),
        video_path=video_path,
        notes=notes,
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({"message": "Session created", "session_id": session.id})


# =========================
# GET SESSIONS FOR PATIENT
# =========================

@session_bp.route("/patients/<int:patient_id>/sessions", methods=["GET"])
def get_patient_sessions(patient_id):
    sessions = Session.query.filter_by(patient_id=patient_id).all()
    return jsonify([
        {
            "id": s.id,
            "video_path": s.video_path,
            "created_at": s.created_at,
            "notes": s.notes,
        }
        for s in sessions
    ])


# =========================
# ANALYZE SESSION VIDEO
# =========================

@session_bp.route("/sessions/<int:session_id>/analyze", methods=["POST"])
def analyze_session(session_id):
    session = Session.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if not session.video_path or not os.path.exists(session.video_path):
        return jsonify({"error": "No video found for this session"}), 400

    # Don't re-run if predictions already exist
    existing = FramePrediction.query.filter_by(session_id=session_id).first()
    if existing:
        return jsonify({"error": "Session already analyzed"}), 409

    try:
        predictions = run_inference_and_store(session_id, session.video_path)
        return jsonify({
            "session_id": session_id,
            "total_frames_analyzed": len(predictions),
            "predictions": predictions,
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500


# =========================
# GET PREDICTIONS FOR SESSION
# =========================

@session_bp.route("/sessions/<int:session_id>/predictions", methods=["GET"])
def get_predictions(session_id):
    predictions = FramePrediction.query.filter_by(session_id=session_id)\
        .order_by(FramePrediction.frame_index).all()
    return jsonify([
        {
            "frame_index": p.frame_index,
            "predicted_angle": p.predicted_angle,
        }
        for p in predictions
    ])


# =========================
# STORE LLM INSIGHT
# =========================

@session_bp.route("/sessions/<int:session_id>/insight", methods=["POST"])
def add_llm_insight(session_id):
    data = request.json
    insight = LLMInsight(
        session_id=session_id,
        insight_text=data["insight_text"],
        model_used=data.get("model", "gpt")
    )
    db.session.add(insight)
    db.session.commit()
    return jsonify({"message": "Insight saved"})