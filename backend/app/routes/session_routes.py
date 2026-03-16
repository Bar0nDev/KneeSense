from flask import Blueprint, request, jsonify

from app.database.db import db
from app.database.models import (
    Session,
    Patient,
    FramePrediction,
    LLMInsight
)

session_bp = Blueprint("sessions", __name__)


# =========================
# CREATE SESSION
# =========================

@session_bp.route("/sessions", methods=["POST"])
def create_session():

    data = request.json

    patient_id = data.get("patient_id")
    practitioner_id = data.get("practitioner_id")
    video_path = data.get("video_path")

    session = Session(
        patient_id=patient_id,
        practitioner_id=practitioner_id,
        video_path=video_path
    )

    db.session.add(session)
    db.session.commit()

    return jsonify({
        "message": "Session created",
        "session_id": session.id
    })


# =========================
# GET SESSIONS FOR PATIENT
# =========================

@session_bp.route("/patients/<int:patient_id>/sessions", methods=["GET"])
def get_patient_sessions(patient_id):

    sessions = Session.query.filter_by(patient_id=patient_id).all()

    results = []

    for s in sessions:
        results.append({
            "id": s.id,
            "video_path": s.video_path,
            "created_at": s.created_at
        })

    return jsonify(results)


# =========================
# STORE FRAME PREDICTION
# =========================

@session_bp.route("/sessions/<int:session_id>/predictions", methods=["POST"])
def add_prediction(session_id):

    data = request.json

    prediction = FramePrediction(
        session_id=session_id,
        frame_index=data["frame_index"],
        predicted_angle=data["predicted_angle"],
        region1_activation=data.get("region1"),
        region2_activation=data.get("region2"),
        region3_activation=data.get("region3")
    )

    db.session.add(prediction)
    db.session.commit()

    return jsonify({"message": "Prediction saved"})


# =========================
# STORE LLM Insight
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