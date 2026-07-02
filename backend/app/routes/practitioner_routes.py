from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db

practitioner_bp = Blueprint("practitioners", __name__)
fs_db = get_fs_db()


# GET /practitioners
@practitioner_bp.route("/practitioners", methods=["GET"])
def get_all_practitioners():
    docs = fs_db.collection("practitioners").stream()
    practitioners = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        practitioners.append(d)
    return jsonify(practitioners), 200


# GET /practitioners/<id>
@practitioner_bp.route("/practitioners/<practitioner_id>", methods=["GET"])
def get_practitioner(practitioner_id):
    doc = fs_db.collection("practitioners").document(practitioner_id).get()
    if not doc.exists:
        return jsonify({"error": "Practitioner not found"}), 404
    d = doc.to_dict()
    d["id"] = doc.id
    return jsonify(d), 200


# POST /practitioners
@practitioner_bp.route("/practitioners", methods=["POST"])
def create_practitioner():
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    existing = fs_db.collection("practitioners").where(filter=FieldFilter("user_id", "==", user_id)).limit(1).get()
    if existing:
        return jsonify({"error": "Practitioner profile already exists for this user"}), 400

    doc = {
        "user_id": user_id,
        "clinic_name": data.get("clinic_name"),
        "specialization": data.get("specialization"),
        "created_at": datetime.now(timezone.utc),
    }
    ref = fs_db.collection("practitioners").document()
    ref.set(doc)
    return jsonify({"message": "Practitioner created", "practitioner_id": ref.id}), 201


# PUT /practitioners/<id>
@practitioner_bp.route("/practitioners/<practitioner_id>", methods=["PUT"])
def update_practitioner(practitioner_id):
    doc_ref = fs_db.collection("practitioners").document(practitioner_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Practitioner not found"}), 404

    data = request.json
    allowed = ["clinic_name", "specialization"]
    update_fields = {k: v for k, v in data.items() if k in allowed}

    if not update_fields:
        return jsonify({"message": "No changes detected"}), 200

    doc_ref.set(update_fields, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = practitioner_id
    return jsonify({"message": "Practitioner updated", "practitioner": updated}), 200


# DELETE /practitioners/<id>
@practitioner_bp.route("/practitioners/<practitioner_id>", methods=["DELETE"])
def delete_practitioner(practitioner_id):
    doc_ref = fs_db.collection("practitioners").document(practitioner_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Practitioner not found"}), 404
    doc_ref.delete()
    return jsonify({"message": "Practitioner deleted"}), 200


# GET /practitioners/<id>/patients
@practitioner_bp.route("/practitioners/<practitioner_id>/patients", methods=["GET"])
def get_practitioner_patients(practitioner_id):
    if not fs_db.collection("practitioners").document(practitioner_id).get().exists:
        return jsonify({"error": "Practitioner not found"}), 404

    docs = fs_db.collection("patients") \
        .where(filter=FieldFilter("practitioner_id", "==", practitioner_id)) \
        .where(filter=FieldFilter("is_active", "==", True)) \
        .stream()

    patients = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        patients.append(d)
    return jsonify(patients), 200
