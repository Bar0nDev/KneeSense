from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db

template_bp = Blueprint("templates", __name__)
fs_db = get_fs_db()


# GET /templates?practitioner_id=<id>
@template_bp.route("/templates", methods=["GET"])
def get_templates():
    practitioner_id = request.args.get("practitioner_id")
    try:
        ref = fs_db.collection("templates")
        if practitioner_id:
            docs = ref.where(filter=FieldFilter("practitioner_id", "==", practitioner_id)).stream()
        else:
            docs = ref.stream()

        templates = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            templates.append(d)

        templates.sort(key=lambda t: t.get("name", ""))
        return jsonify(templates), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# POST /templates
@template_bp.route("/templates", methods=["POST"])
def create_template():
    data = request.json
    if not data.get("name") or not data.get("practitioner_id"):
        return jsonify({"error": "name and practitioner_id are required"}), 400

    exercises = [
        {
            "exercise_id": ex["exercise_id"],
            "position": i,
            "sets_override": ex.get("sets_override"),
            "reps_override": ex.get("reps_override"),
        }
        for i, ex in enumerate(data.get("exercises", []))
    ]

    doc = {
        "practitioner_id": data["practitioner_id"],
        "name": data["name"],
        "sub_label": data.get("sub_label", ""),
        "is_favorite": data.get("is_favorite", False),
        "exercises": exercises,
        "created_at": datetime.now(timezone.utc),
    }

    ref = fs_db.collection("templates").document()
    ref.set(doc)
    doc["id"] = ref.id
    return jsonify({"message": "Template created", "template": doc}), 201


# PUT /templates/<id>
@template_bp.route("/templates/<template_id>", methods=["PUT"])
def update_template(template_id):
    doc_ref = fs_db.collection("templates").document(template_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Template not found"}), 404

    data = request.json
    update_fields = {}

    for field in ["name", "sub_label", "is_favorite"]:
        if field in data:
            update_fields[field] = data[field]

    if "exercises" in data:
        update_fields["exercises"] = [
            {
                "exercise_id": ex["exercise_id"],
                "position": i,
                "sets_override": ex.get("sets_override"),
                "reps_override": ex.get("reps_override"),
            }
            for i, ex in enumerate(data["exercises"])
        ]

    doc_ref.set(update_fields, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = template_id
    return jsonify({"message": "Template updated", "template": updated}), 200


# DELETE /templates/<id>
@template_bp.route("/templates/<template_id>", methods=["DELETE"])
def delete_template(template_id):
    doc_ref = fs_db.collection("templates").document(template_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "Template not found"}), 404

    doc_ref.delete()
    return jsonify({"message": "Template deleted"}), 200
