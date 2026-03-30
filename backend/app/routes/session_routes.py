import os
from flask import Blueprint, json, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app.database.firebase import firestore_repo as fsdb
from app.database.db import db
from app.database.models import Session, FramePrediction, LLMInsight
from app.services.video_service import run_inference_and_store
from app.services.insight_service import generate_and_store_insight

session_bp = Blueprint("sessions", __name__)
fs_db = fsdb.get_fs_db()

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi", "mkv"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =========================
# CREATE SESSION (with video upload)
# =========================

@session_bp.route("/sessions", methods=["POST"])
def create_session():
    """
    Create a new Session with Video Upload
    ---
    tags:
      - Sessions
    consumes:
      - multipart/form-data
    parameters:
      - name: video
        in: formData
        type: file
        required: true
        description: Knee motion video file

      - name: patient_id
        in: formData
        type: integer
        required: true

      - name: practitioner_id
        in: formData
        type: integer
        required: true

      - name: notes
        in: formData
        type: string

    responses:
      200:
        description: Session created successfully
        schema:
          type: object
          properties:
            message:
              type: string
            session_id:
              type: integer

      400:
        description: Invalid input
        schema:
          $ref: '#/definitions/Error'
    """
    patient_id = request.form.get("patient_id")
    practitioner_id = request.form.get("practitioner_id")
    notes = request.form.get("notes")

    if not patient_id or not practitioner_id:
        return jsonify({"error": "patient_id and practitioner_id are required"}), 400

    video_path = None
    cloud_url = None

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

    try:
      session = Session(
          patient_id=int(patient_id),
          practitioner_id=int(practitioner_id),
          video_path=video_path,
          notes=notes,
      )
      db.session.add(session)
      db.session.commit()

      try:
          fsdb.fsdb_session(session)
          return jsonify({"message": "Session created", "session_id": session.id})
      except Exception as e:
          print(f"Failed to create session {session.id}: {e}")
      
    except Exception as e:
      db.session.rollback()
      return jsonify({"error": "Failed to create session", "details": str(e)}), 500


# =========================
# GET SESSIONS FOR PATIENT
# =========================

@session_bp.route("/patients/<int:patient_id>/sessions", methods=["GET"])
def get_patient_sessions(patient_id):
    """
    Get all sessions for a patient
    ---
    tags:
      - Sessions
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: List of sessions
        schema:
          type: array
          items:
            $ref: '#/definitions/Session'
    """
    
    try:
        session_ref = fs_db.collection("sessions")
        docs = session_ref.where("patient_id", "==", patient_id).stream()
        
        cloud_sessions = []
        for doc in docs:
            s_data = doc.to_dict()
            s_data['id'] = doc.id
            if 'created_at' in s_data and hasattr(s_data['created_at'], 'isoformat'):
                s_data['created_at'] = s_data['created_at'].isoformat()
            cloud_sessions.append(s_data)
            
        if cloud_sessions:
            return jsonify(cloud_sessions), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch sessions from cloud", "details": str(e)}), 500
    
    sessions = Session.query.filter_by(patient_id=patient_id).all()
    return jsonify([
        {
            "id": s.id,
            "video_path": s.video_path,
            "created_at": s.created_at.isoformat(),
            "notes": s.notes,
        }
        for s in sessions
    ])


# =========================
# ANALYZE SESSION VIDEO
# =========================

@session_bp.route("/sessions/<int:session_id>/analyze", methods=["POST"])
def analyze_session(session_id):
    """
    Trigger AI inference on session video
    ---
    tags:
      - AI Analysis
    parameters:
      - name: session_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: Analysis complete
        schema:
          type: object
          properties:
            session_id:
              type: integer
            total_frames_analyzed:
              type: integer
            predictions:
              type: array
              items:
                $ref: '#/definitions/Prediction'

      400:
        description: Bad request
        schema:
          $ref: '#/definitions/Error'

      404:
        description: Session not found
        schema:
          $ref: '#/definitions/Error'

      409:
        description: Already analyzed
        schema:
          $ref: '#/definitions/Error'

      500:
        description: Inference failure
        schema:
          $ref: '#/definitions/Error'
    """
    session = db.session.get(Session, session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if not session.video_path or not os.path.exists(session.video_path):
        return jsonify({"error": "No video found for this session"}), 400

    existing = FramePrediction.query.filter_by(session_id=session_id).first()
    if existing:
        return jsonify({"error": "Session already analyzed"}), 409

    try:
        predictions = run_inference_and_store(session_id, session.video_path)
        
        json_filename = f"analysis_{session_id}.json"
        analysis_dir = os.path.join(current_app.config["DATA_DIR"], "analysis")
        os.makedirs(analysis_dir, exist_ok=True)
        final_json_path = os.path.join(analysis_dir, json_filename)
        
        with open(final_json_path, "w") as f:
            json.dump(predictions, f)
            
        fsdb.mark_analysis_complete(
            session_id=session_id, 
            json_filename=json_filename, 
            total_frames=len(predictions)
        )

        return jsonify({
            "session_id": session_id,
            "total_frames_analyzed": len(predictions),
            "predictions": predictions,
        }), 200

    except ValueError as e:
      fsdb.mark_analysis_failed(session_id)
      return jsonify({"error": str(e)}), 400
    
    except Exception as e:
      return jsonify({"error": f"Inference pipeline failed: {str(e)}"}), 500
        
# =========================
# GET PREDICTIONS FOR SESSION
# =========================

@session_bp.route("/sessions/<int:session_id>/predictions", methods=["GET"])
def get_predictions(session_id):
    """
    Get predictions for a session
    ---
    tags:
      - Sessions
    parameters:
      - name: session_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: List of predictions
        schema:
          type: array
          items:
            $ref: '#/definitions/Prediction'
    """
    try:
        doc = fs_db.collection("sessions").document(str(session_id)).get()
        if doc.exists:
            data = doc.to_dict()
            json_name = data.get("analysis_json_name")
            
            if json_name:
                return jsonify({
                    "session_id": session_id,
                    "source": "cloud_storage",
                    "file_name": json_name,
                    "status": data.get("status")
                }), 200
            
    except Exception as e:
        print(f"Cloud check failed: {e}")
    
    predictions = FramePrediction.query.filter_by(session_id=session_id)\
        .order_by(FramePrediction.frame_index).all()
    
    if predictions:
      return jsonify([
          {
              "frame_index": p.frame_index,
              "predicted_angle": p.predicted_angle,
          }
          for p in predictions
      ])

    return jsonify({"error": "No predictions found for this session"}), 404


# =========================
# GENERATE LLM INSIGHT (auto, calls Claude)
# =========================

@session_bp.route("/sessions/<int:session_id>/generate-insight", methods=["POST"])
def generate_insight(session_id):
    """
    Auto-generate a clinical insight using Claude AI
    ---
    tags:
      - AI Analysis
    parameters:
      - name: session_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: Insight generated and saved
        schema:
          $ref: '#/definitions/Insight'

      400:
        description: No predictions found — run /analyze first
        schema:
          $ref: '#/definitions/Error'

      404:
        description: Session not found
        schema:
          $ref: '#/definitions/Error'

      409:
        description: Insight already exists for this session
        schema:
          $ref: '#/definitions/Error'

      500:
        description: LLM generation failed
        schema:
          $ref: '#/definitions/Error'
    """
    session = db.session.get(Session, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    try:
        doc_ref = fs_db.collection("sessions").document(str(session_id)).get()
        if not doc_ref.exists:
            return jsonify({"error": "Session not found in Cloud"}), 404
        
        doc_data = doc_ref.to_dict()
        if not doc_data.get("has_analysis"):
            return jsonify({"error": "No analysis found. Call POST /analyze first"}), 400
        
        if doc_data.get("has_insight"):
            return jsonify({"error": "Insight already exists for this session in Cloud"}), 409
            
    except Exception as e:
        return jsonify({"error": f"Failed to verify Cloud status: {str(e)}"}), 500
    
    # Don't regenerate if one already exists
    existing = LLMInsight.query.filter_by(session_id=session_id).first()
    if existing:
        return jsonify({"error": "Insight already exists for this session"}), 409

    try:
        fps = session.fps or 30
        result = generate_and_store_insight(session_id, fps=fps)
        i_text = result.get("insight_text")
        i_model = result.get("model_used")

        fs_db.mark_insight_complete(
            session_id=session_id, 
            insight_text=i_text, 
            model_used=i_model
        )

        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Insight generation failed: {str(e)}"}), 500


# =========================
# GET INSIGHT FOR SESSION
# =========================

@session_bp.route("/sessions/<int:session_id>/insight", methods=["GET"])
def get_insight(session_id):
    """
    Get the stored LLM insight for a session
    ---
    tags:
      - AI Analysis
    parameters:
      - name: session_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: Insight found
        schema:
          $ref: '#/definitions/Insight'

      404:
        description: No insight found — generate one first
        schema:
          $ref: '#/definitions/Error'
    """
    insight = LLMInsight.query.filter_by(session_id=session_id)\
        .order_by(LLMInsight.id.desc()).first()

    if not insight:
        return jsonify({"error": "No insight found. Call POST /generate-insight first."}), 404
    
    try:
        doc_ref = fs_db.collection("sessions").document(str(session_id))
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            if not data.get("has_insight"):
                fs_db.mark_insight_complete(
                    session_id=session_id,
                    insight_text=insight.insight_text,
                    model_used=insight.model_used
                )
    except Exception as e:
        print(f"Failed to retrieve insight {insight.id}: {e}")

    return jsonify({
        "session_id": session_id,
        "insight_text": insight.insight_text,
        "model": insight.model_used,
        "created_at": insight.created_at.isoformat(),
    })


# =========================
# STORE LLM INSIGHT (manual, kept for compatibility)
# =========================

@session_bp.route("/sessions/<int:session_id>/insight", methods=["POST"])
def add_llm_insight(session_id):
    """
    Manually store an LLM-generated insight
    ---
    tags:
      - AI Analysis
    parameters:
      - name: session_id
        in: path
        type: integer
        required: true

      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - insight_text
          properties:
            insight_text:
              type: string
            model:
              type: string
              example: gpt-4

    responses:
      200:
        description: Insight saved
        schema:
          type: object
          properties:
            message:
              type: string

      400:
        description: Invalid input
        schema:
          $ref: '#/definitions/Error'
    """
    data = request.json
    if not data or "insight_text" not in data:
        return jsonify({"error": "Missing insight_text"}), 400
    
    try:
        doc_ref = fs_db.collection("sessions").document(str(session_id))
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Session not found in the Cloud"}), 404
        
        doc_data = doc.to_dict()
        if doc_data.get("has_insight"):
            return jsonify({"error": "An insight already exists for this session in the Cloud."}), 409
            
    except Exception as e:
        return jsonify({"error": f"Cloud verification failed: {str(e)}"}), 500

    insight = LLMInsight(
        session_id=session_id,
        insight_text=data["insight_text"],
        model_used=data.get("model", "manual")
    )
    db.session.add(insight)
    
    try:
        db.session.commit()
        fsdb.mark_insight_complete(
            session_id=session_id,
            insight_text=data["insight_text"],
            model_used=data.get("model", "manual")
        )

        return jsonify({"message": "Insight saved"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save insight: {str(e)}"}), 500

    # insight = LLMInsight(
    #     session_id=session_id,
    #     insight_text=data["insight_text"],
    #     model_used=data.get("model", "manual")
    # )
    # db.session.add(insight)
    # db.session.commit()
    # return jsonify({"message": "Insight saved"})



# =========================
# Temporary route to serve analysis JSON files (for frontend dev testing)
# =========================
@session_bp.route("/data/analysis/<path:filename>", methods=["GET"])
def serve_analysis_file(filename):
    analysis_dir = os.path.join(current_app.root_path, "..", current_app.config["DATA_DIR"], "analysis")
    analysis_dir = os.path.abspath(analysis_dir)
    return send_from_directory(analysis_dir, filename)