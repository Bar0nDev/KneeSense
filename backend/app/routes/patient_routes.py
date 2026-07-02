from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from collections import defaultdict
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db

patient_bp = Blueprint("patients", __name__)
fs_db = get_fs_db()


# GET /patients
@patient_bp.route("/patients", methods=["GET"])
def get_all_patients():
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"
    docs = fs_db.collection("patients").stream()
    patients = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        if not include_inactive and not d.get("is_active", True):
            continue
        patients.append(d)
    return jsonify(patients), 200


# GET /patients/<id>
@patient_bp.route("/patients/<patient_id>", methods=["GET"])
def get_patient(patient_id):
    doc = fs_db.collection("patients").document(patient_id).get()
    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404
    d = doc.to_dict()
    d["id"] = doc.id
    return jsonify(d), 200


# GET /users/<user_id>/patient
@patient_bp.route("/users/<user_id>/patient", methods=["GET"])
def get_patient_by_user(user_id):
    query = fs_db.collection("patients").where(filter=FieldFilter("user_id", "==", user_id)).limit(1).get()
    if not query:
        return jsonify({"error": "No patient profile found for this user"}), 404
    doc = query[0]
    d = doc.to_dict()
    d["id"] = doc.id
    return jsonify(d), 200


# POST /patients
@patient_bp.route("/patients", methods=["POST"])
def create_patient():
    data = request.json
    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    doc = {
        "user_id": None,
        "practitioner_id": data.get("practitioner_id"),
        "name": data["name"],
        "birthday": data.get("birthday"),
        "sex": data.get("sex"),
        "height_cm": data.get("height_cm"),
        "weight_kg": data.get("weight_kg"),
        "notes": data.get("notes"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }
    ref = fs_db.collection("patients").document()
    ref.set(doc)
    return jsonify({"message": "Patient created", "patient_id": ref.id}), 201


# PUT /patients/<id>
@patient_bp.route("/patients/<patient_id>", methods=["PUT"])
def update_patient(patient_id):
    doc_ref = fs_db.collection("patients").document(patient_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Patient not found"}), 404

    data = request.json
    allowed = ["name", "birthday", "sex", "height_cm", "weight_kg", "notes", "practitioner_id", "is_active"]
    update_fields = {k: v for k, v in data.items() if k in allowed}

    if not update_fields:
        return jsonify({"message": "No changes detected"}), 200

    doc_ref.set(update_fields, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = patient_id
    return jsonify({"message": "Patient updated", "patient": updated}), 200


# PUT /patients/<id>/assign
@patient_bp.route("/patients/<patient_id>/assign", methods=["PUT"])
def assign_practitioner(patient_id):
    doc_ref = fs_db.collection("patients").document(patient_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Patient not found"}), 404

    data = request.json
    practitioner_id = data.get("practitioner_id")
    if not practitioner_id:
        return jsonify({"error": "practitioner_id is required"}), 400

    if not fs_db.collection("practitioners").document(practitioner_id).get().exists:
        return jsonify({"error": "Practitioner does not exist"}), 404

    doc_ref.set({"practitioner_id": practitioner_id}, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = patient_id
    return jsonify({"message": "Practitioner assigned", "patient": updated}), 200


# DELETE /patients/<id> — soft delete
@patient_bp.route("/patients/<patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    doc_ref = fs_db.collection("patients").document(patient_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Patient not found"}), 404
    doc_ref.update({"is_active": False})
    return jsonify({"message": "Patient deactivated"}), 200


# DELETE /patients/<id>/purge — hard delete
@patient_bp.route("/patients/<patient_id>/purge", methods=["DELETE"])
def purge_patient(patient_id):
    doc_ref = fs_db.collection("patients").document(patient_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Patient not found"}), 404
    doc_ref.delete()
    return jsonify({"message": "Patient permanently deleted"}), 200


# PUT /patients/<id>/program
@patient_bp.route("/patients/<patient_id>/program", methods=["PUT"])
def assign_program(patient_id):
    data = request.json or {}
    update = {}
    if "template_id" in data:
        update["template_id"] = data["template_id"]
    if "frequency" in data:
        update["program_frequency"] = data["frequency"]
    if "duration_weeks" in data:
        update["program_duration_weeks"] = data["duration_weeks"]
    if "start_date" in data:
        update["program_start_date"] = data["start_date"]

    if not update:
        return jsonify({"message": "No changes"}), 200

    fs_db.collection("patients").document(patient_id).set(update, merge=True)
    return jsonify({"message": "Program assigned"}), 200


# GET /analytics/clinic
@patient_bp.route("/analytics/clinic", methods=["GET"])
def get_clinic_analytics():
    patient_docs = list(fs_db.collection("patients").stream())
    session_docs = list(fs_db.collection("sessions").where(filter=FieldFilter("status", "==", "completed")).stream())

    sessions_by_patient = defaultdict(list)
    for doc in session_docs:
        d = doc.to_dict()
        pid = str(d.get("patient_id", ""))
        if pid:
            sessions_by_patient[pid].append(d)

    result = []
    for doc in patient_docs:
        d = doc.to_dict()
        if not d.get("is_active", True):
            continue
        pid = doc.id
        sessions = sessions_by_patient.get(pid, [])
        sessions_sorted = sorted(sessions, key=lambda s: s.get("created_at") or 0, reverse=True)
        latest = sessions_sorted[0] if sessions_sorted else {}

        result.append({
            "id": pid,
            "name": d.get("name", ""),
            "birthday": d.get("birthday"),
            "practitioner_id": d.get("practitioner_id"),
            "compliance": min(len(sessions) * 10, 100),
            "session_count": len(sessions),
            "rom_arc": latest.get("rom_arc"),
            "avg_angle": latest.get("avg_angle"),
            "zone1_avg": latest.get("zone1_avg"),
            "zone2_avg": latest.get("zone2_avg"),
            "zone3_avg": latest.get("zone3_avg"),
        })

    return jsonify(result), 200
