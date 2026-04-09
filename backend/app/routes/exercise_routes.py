from flask import Blueprint, request, jsonify
from datetime import datetime, UTC
from app.database.db import db
from app.database.models import Exercise
from app.database.firebase import firestore_repo as fsdb

exercise_bp = Blueprint("exercises", __name__)


def _serialize(e: Exercise) -> dict:
    return {
        "id": e.id,
        "practitioner_id": e.practitioner_id,
        "name": e.name,
        "instructions": e.instructions,
        "difficulty": e.difficulty,
        "default_sets": e.default_sets,
        "default_reps": e.default_reps,
        "reps_min": e.reps_min,
        "reps_max": e.reps_max,
        "media_url": e.media_url,
        "patient_featured": e.patient_featured,
        "is_favorite": e.is_favorite,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


# GET /exercises?practitioner_id=<id>
@exercise_bp.route("/exercises", methods=["GET"])
def get_exercises():
    practitioner_id = request.args.get("practitioner_id", type=int)
    query = Exercise.query
    if practitioner_id:
        query = query.filter_by(practitioner_id=practitioner_id)
    exercises = query.order_by(Exercise.name).all()
    return jsonify([_serialize(e) for e in exercises]), 200


# POST /exercises
@exercise_bp.route("/exercises", methods=["POST"])
def create_exercise():
    data = request.json
    if not data.get("name") or not data.get("practitioner_id"):
        return jsonify({"error": "name and practitioner_id are required"}), 400

    exercise = Exercise(
        practitioner_id=data["practitioner_id"],
        name=data["name"],
        instructions=data.get("instructions"),
        difficulty=data.get("difficulty"),
        default_sets=data.get("default_sets", 3),
        default_reps=data.get("default_reps", 10),
        reps_min=data.get("reps_min"),
        reps_max=data.get("reps_max"),
        media_url=data.get("media_url"),
        patient_featured=data.get("patient_featured", False),
        is_favorite=data.get("is_favorite", False),
        created_at=datetime.now(UTC),
    )
    db.session.add(exercise)
    db.session.commit()

    try:
        fsdb.fsdb_exercise(exercise)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Exercise created", "exercise": _serialize(exercise)}), 201


# PUT /exercises/<id>
@exercise_bp.route("/exercises/<int:exercise_id>", methods=["PUT"])
def update_exercise(exercise_id):
    exercise = db.session.get(Exercise, exercise_id)
    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404

    data = request.json
    allowed = ["name", "instructions", "difficulty", "default_sets", "default_reps",
               "reps_min", "reps_max", "media_url", "patient_featured", "is_favorite"]
    for field in allowed:
        if field in data:
            setattr(exercise, field, data[field])

    db.session.commit()

    try:
        fsdb.fsdb_exercise(exercise)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Exercise updated", "exercise": _serialize(exercise)}), 200


# DELETE /exercises/<id>
@exercise_bp.route("/exercises/<int:exercise_id>", methods=["DELETE"])
def delete_exercise(exercise_id):
    exercise = db.session.get(Exercise, exercise_id)
    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404

    db.session.delete(exercise)
    db.session.commit()

    try:
        fsdb.delete_fsdb_exercise(exercise_id)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Exercise deleted"}), 200
