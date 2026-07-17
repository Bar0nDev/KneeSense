import io
import os
import tempfile
from datetime import datetime, timezone, timedelta
from flask import Blueprint, json, request, jsonify, current_app, send_file
from google.cloud import storage as gcs
from werkzeug.utils import secure_filename
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db
from app.database.firebase import firestore_repo as fsdb
from app.services.video_service import run_inference_and_store
from app.services.insight_service import generate_and_store_insight

session_bp = Blueprint("sessions", __name__)
fs_db = get_fs_db()

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi", "mkv", "webm"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =========================
# CREATE SESSION
# =========================
@session_bp.route("/sessions", methods=["POST"])
def create_session():
    patient_id = request.form.get("patient_id")
    practitioner_id = request.form.get("practitioner_id")
    notes = request.form.get("notes")

    if not patient_id:
        return jsonify({"error": "patient_id is required"}), 400

    ref = fs_db.collection("sessions").document()

    video_path = None
    if "video" in request.files:
        file = request.files["video"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        ext = secure_filename(file.filename).rsplit(".", 1)[-1]
        blob_name = f"videos/{ref.id}.{ext}"
        bucket = gcs.Client().bucket(current_app.config["GCS_BUCKET_NAME"])
        bucket.blob(blob_name).upload_from_file(file, content_type=f"video/{ext}")
        video_path = blob_name
    ref.set({
        "patient_id": patient_id,
        "practitioner_id": practitioner_id,
        "video_path": video_path,
        "fps": 30,
        "notes": notes,
        "status": "pending",
        "has_analysis": False,
        "has_insight": False,
        "created_at": datetime.now(timezone.utc),
    })

    return jsonify({"message": "Session created", "session_id": ref.id}), 201


# =========================
# GET SESSIONS FOR PATIENT
# =========================
@session_bp.route("/patients/<patient_id>/sessions", methods=["GET"])
def get_patient_sessions(patient_id):
    docs = fs_db.collection("sessions") \
        .where(filter=FieldFilter("patient_id", "==", patient_id)) \
        .stream()

    sessions = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        sessions.append(d)

    return jsonify(sessions), 200


# =========================
# ANALYZE SESSION VIDEO
# =========================
@session_bp.route("/sessions/<session_id>/analyze", methods=["POST"])
def analyze_session(session_id):
    doc_ref = fs_db.collection("sessions").document(session_id)
    doc = doc_ref.get()

    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    session_data = doc.to_dict()

    if session_data.get("has_analysis"):
        return jsonify({"error": "Session already analyzed"}), 409

    video_gcs_path = session_data.get("video_path")
    if not video_gcs_path:
        return jsonify({"error": "No video found for this session"}), 400

    ext = video_gcs_path.rsplit(".", 1)[-1]
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=f".{ext}")
    os.close(tmp_fd)
    bucket = gcs.Client().bucket(current_app.config["GCS_BUCKET_NAME"])
    bucket.blob(video_gcs_path).download_to_filename(tmp_path)

    try:
        predictions, flow_results = run_inference_and_store(session_id, tmp_path)

        angles = [p["predicted_angle"] for p in predictions if p.get("predicted_angle") is not None]
        avg_angle = sum(angles) / len(angles) if angles else None
        min_angle = min(angles) if angles else None
        max_angle = max(angles) if angles else None
        rom_arc = (max_angle - min_angle) if angles else None

        if flow_results:
            z1 = [r["zone1_percent"] for r in flow_results]
            z2 = [r["zone2_percent"] for r in flow_results]
            z3 = [r["zone3_percent"] for r in flow_results]
            zone1_avg = sum(z1) / len(z1)
            zone2_avg = sum(z2) / len(z2)
            zone3_avg = sum(z3) / len(z3)
            dominant_zone = ["zone1", "zone2", "zone3"][
                [zone1_avg, zone2_avg, zone3_avg].index(max(zone1_avg, zone2_avg, zone3_avg))
            ]
        else:
            zone1_avg = zone2_avg = zone3_avg = None
            dominant_zone = None

        json_filename = f"analysis_{session_id}.json"
        analysis_dir = os.path.join(current_app.config["DATA_DIR"], "analysis")
        os.makedirs(analysis_dir, exist_ok=True)
        with open(os.path.join(analysis_dir, json_filename), "w") as f:
            json.dump({"predictions": predictions, "flow_results": flow_results}, f)

        fsdb.mark_analysis_complete(
            session_id=session_id,
            json_filename=json_filename,
            total_frames=len(predictions),
            min_angle=min_angle,
            max_angle=max_angle,
            avg_angle=avg_angle,
            rom_arc=rom_arc,
            zone1_avg=zone1_avg,
            zone2_avg=zone2_avg,
            zone3_avg=zone3_avg,
            dominant_zone=dominant_zone,
        )

        return jsonify({
            "session_id": session_id,
            "total_frames_analyzed": len(predictions),
            "predictions": predictions,
            "flow_results": flow_results,
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# =========================
# GET PREDICTIONS FOR SESSION
# =========================
@session_bp.route("/sessions/<session_id>/predictions", methods=["GET"])
def get_predictions(session_id):
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    data = doc.to_dict()
    json_filename = data.get("analysis_json_name")
    if not json_filename:
        return jsonify({"error": "No analysis found for this session"}), 404

    analysis_dir = os.path.join(current_app.config["DATA_DIR"], "analysis")
    json_path = os.path.join(analysis_dir, json_filename)

    if not os.path.exists(json_path):
        return jsonify({"error": "Analysis file not found on server"}), 404

    with open(json_path, "r") as f:
        saved = json.load(f)

    return jsonify({
        "session_id": session_id,
        "total_frames": len(saved.get("predictions", [])),
        "predictions": saved.get("predictions", []),
        "flow_results": saved.get("flow_results", []),
    }), 200


# =========================
# GET OPTICAL FLOW FOR SESSION
# =========================
@session_bp.route("/sessions/<session_id>/flow", methods=["GET"])
def get_optical_flow(session_id):
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    data = doc.to_dict()
    json_filename = data.get("analysis_json_name")
    if not json_filename:
        return jsonify({"error": "No analysis found for this session"}), 404

    analysis_dir = os.path.join(current_app.config["DATA_DIR"], "analysis")
    json_path = os.path.join(analysis_dir, json_filename)

    if not os.path.exists(json_path):
        return jsonify({"error": "Analysis file not found on server"}), 404

    with open(json_path, "r") as f:
        saved = json.load(f)

    flow_results = saved.get("flow_results", [])
    return jsonify({
        "session_id": session_id,
        "total_frames": len(flow_results),
        "flow_results": flow_results,
    }), 200


# =========================
# GENERATE LLM INSIGHT
# =========================
@session_bp.route("/sessions/<session_id>/generate-insight", methods=["POST"])
def generate_insight(session_id):
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    session_data = doc.to_dict()

    if not session_data.get("has_analysis"):
        return jsonify({"error": "No analysis found. Call POST /analyze first"}), 400

    if session_data.get("has_insight"):
        return jsonify({"error": "Insight already exists for this session"}), 409

    json_filename = session_data.get("analysis_json_name")
    analysis_dir = os.path.join(current_app.config["DATA_DIR"], "analysis")
    json_path = os.path.join(analysis_dir, json_filename) if json_filename else None

    try:
        fps = session_data.get("fps", 30)
        result = generate_and_store_insight(session_id, json_path=json_path, fps=fps)

        fsdb.mark_insight_complete(
            session_id=session_id,
            insight_text=result.get("insight_text"),
            summary_text=result.get("summary_text"),
            model_used=result.get("model_used"),
        )

        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Insight generation failed: {str(e)}"}), 500


# =========================
# GET INSIGHT FOR SESSION
# =========================
@session_bp.route("/sessions/<session_id>/insight", methods=["GET"])
def get_insight(session_id):
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    data = doc.to_dict()
    if not data.get("insight_text"):
        return jsonify({"error": "No insight found. Generate one first."}), 404

    return jsonify({
        "session_id": session_id,
        "insight_text": data.get("insight_text"),
        "summary_text": data.get("summary_text"),
        "model": data.get("model"),
    }), 200


# =========================
# STORE LLM INSIGHT (manual)
# =========================
@session_bp.route("/sessions/<session_id>/insight", methods=["POST"])
def add_llm_insight(session_id):
    data = request.json
    if not data or "insight_text" not in data:
        return jsonify({"error": "Missing insight_text"}), 400

    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    if doc.to_dict().get("has_insight"):
        return jsonify({"error": "Insight already exists for this session"}), 409

    fsdb.mark_insight_complete(
        session_id=session_id,
        insight_text=data["insight_text"],
        summary_text=data.get("summary_text"),
        model_used=data.get("model", "manual"),
    )

    return jsonify({"message": "Insight saved"}), 200


# =========================
# GET SIGNED VIDEO URL FOR SESSION
# =========================
@session_bp.route("/sessions/<session_id>/video-url", methods=["GET"])
def get_video_url(session_id):
    # Returns a short-lived signed URL that points directly at GCS. The browser's
    # <video> element loads from storage.googleapis.com, bypassing the ngrok
    # tunnel entirely — the tunnel's browser-warning interstitial was replacing
    # the video bytes with an HTML page, breaking playback in production.
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    video_path = doc.to_dict().get("video_path")
    if not video_path:
        return jsonify({"error": "No video for this session"}), 404

    bucket = gcs.Client().bucket(current_app.config["GCS_BUCKET_NAME"])
    url = bucket.blob(video_path).generate_signed_url(
        version="v4",
        expiration=timedelta(hours=1),
        method="GET",
    )
    return jsonify({"url": url}), 200


# =========================
# SERVE VIDEO FILE (from GCS)
# =========================
@session_bp.route("/data/videos/<path:filename>", methods=["GET"])
def serve_video(filename):
    blob_name = f"videos/{filename}"
    bucket = gcs.Client().bucket(current_app.config["GCS_BUCKET_NAME"])
    blob = bucket.blob(blob_name)
    ext = filename.rsplit(".", 1)[-1]
    return send_file(
        io.BytesIO(blob.download_as_bytes()),
        mimetype=f"video/{ext}",
    )
