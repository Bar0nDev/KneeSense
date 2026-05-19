from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db

exercise_bp = Blueprint("exercises", __name__)
fs_db = get_fs_db()


# GET /exercises?practitioner_id=<id>
@exercise_bp.route("/exercises", methods=["GET"])
def get_exercises():
    practitioner_id = request.args.get("practitioner_id")
    try:
        ref = fs_db.collection("exercises")
        if practitioner_id:
            docs = ref.where(filter=FieldFilter("practitioner_id", "==", practitioner_id)).stream()
        else:
            docs = ref.stream()

        exercises = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            exercises.append(d)

        exercises.sort(key=lambda e: e.get("name", ""))
        return jsonify(exercises), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# POST /exercises
@exercise_bp.route("/exercises", methods=["POST"])
def create_exercise():
    data = request.json
    if not data.get("name") or not data.get("practitioner_id"):
        return jsonify({"error": "name and practitioner_id are required"}), 400

    doc = {
        "practitioner_id": data["practitioner_id"],
        "name": data["name"],
        "instructions": data.get("instructions"),
        "difficulty": data.get("difficulty"),
        "default_sets": data.get("default_sets", 3),
        "default_reps": data.get("default_reps", 10),
        "reps_min": data.get("reps_min"),
        "reps_max": data.get("reps_max"),
        "media_url": data.get("media_url"),
        "patient_featured": data.get("patient_featured", False),
        "is_favorite": data.get("is_favorite", False),
        "created_at": datetime.now(timezone.utc),
    }

    ref = fs_db.collection("exercises").document()
    ref.set(doc)
    doc["id"] = ref.id
    return jsonify({"message": "Exercise created", "exercise": doc}), 201


# PUT /exercises/<id>
@exercise_bp.route("/exercises/<exercise_id>", methods=["PUT"])
def update_exercise(exercise_id):
    doc_ref = fs_db.collection("exercises").document(exercise_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Exercise not found"}), 404

    data = request.json
    allowed = ["name", "instructions", "difficulty", "default_sets", "default_reps",
               "reps_min", "reps_max", "media_url", "patient_featured", "is_favorite"]
    update_fields = {k: v for k, v in data.items() if k in allowed}

    doc_ref.set(update_fields, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = exercise_id
    return jsonify({"message": "Exercise updated", "exercise": updated}), 200


# DELETE /exercises/<id>
@exercise_bp.route("/exercises/<exercise_id>", methods=["DELETE"])
def delete_exercise(exercise_id):
    doc_ref = fs_db.collection("exercises").document(exercise_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Exercise not found"}), 404

    doc_ref.delete()
    return jsonify({"message": "Exercise deleted"}), 200
