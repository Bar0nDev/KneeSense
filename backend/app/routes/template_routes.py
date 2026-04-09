from flask import Blueprint, request, jsonify
from datetime import datetime, UTC
from app.database.db import db
from app.database.models import Template, TemplateExercise, Exercise
from app.database.firebase import firestore_repo as fsdb

template_bp = Blueprint("templates", __name__)


def _serialize(t: Template) -> dict:
    return {
        "id": t.id,
        "practitioner_id": t.practitioner_id,
        "name": t.name,
        "sub_label": t.sub_label,
        "is_favorite": t.is_favorite,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "exercises": [
            {
                "id": te.id,
                "exercise_id": te.exercise_id,
                "position": te.position,
                "sets_override": te.sets_override,
                "reps_override": te.reps_override,
                "name": te.exercise_ref.name if te.exercise_ref else None,
                "media_url": te.exercise_ref.media_url if te.exercise_ref else None,
                "default_sets": te.exercise_ref.default_sets if te.exercise_ref else None,
                "default_reps": te.exercise_ref.default_reps if te.exercise_ref else None,
            }
            for te in t.exercises
        ],
    }


# GET /templates?practitioner_id=<id>
@template_bp.route("/templates", methods=["GET"])
def get_templates():
    practitioner_id = request.args.get("practitioner_id", type=int)
    query = Template.query
    if practitioner_id:
        query = query.filter_by(practitioner_id=practitioner_id)
    templates = query.order_by(Template.name).all()
    return jsonify([_serialize(t) for t in templates]), 200


# POST /templates
@template_bp.route("/templates", methods=["POST"])
def create_template():
    data = request.json
    if not data.get("name") or not data.get("practitioner_id"):
        return jsonify({"error": "name and practitioner_id are required"}), 400

    template = Template(
        practitioner_id=data["practitioner_id"],
        name=data["name"],
        sub_label=data.get("sub_label", ""),
        is_favorite=data.get("is_favorite", False),
        created_at=datetime.now(UTC),
    )
    db.session.add(template)
    db.session.flush()  # get template.id before committing

    for i, ex in enumerate(data.get("exercises", [])):
        te = TemplateExercise(
            template_id=template.id,
            exercise_id=ex["exercise_id"],
            position=i,
            sets_override=ex.get("sets_override"),
            reps_override=ex.get("reps_override"),
        )
        db.session.add(te)

    db.session.commit()
    db.session.refresh(template)

    try:
        fsdb.fsdb_template(template, template.exercises)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Template created", "template": _serialize(template)}), 201


# PUT /templates/<id>
@template_bp.route("/templates/<int:template_id>", methods=["PUT"])
def update_template(template_id):
    template = db.session.get(Template, template_id)
    if not template:
        return jsonify({"error": "Template not found"}), 404

    data = request.json
    for field in ["name", "sub_label", "is_favorite"]:
        if field in data:
            setattr(template, field, data[field])

    if "exercises" in data:
        # Replace all exercises
        TemplateExercise.query.filter_by(template_id=template_id).delete()
        for i, ex in enumerate(data["exercises"]):
            te = TemplateExercise(
                template_id=template_id,
                exercise_id=ex["exercise_id"],
                position=i,
                sets_override=ex.get("sets_override"),
                reps_override=ex.get("reps_override"),
            )
            db.session.add(te)

    db.session.commit()
    db.session.refresh(template)

    try:
        fsdb.fsdb_template(template, template.exercises)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Template updated", "template": _serialize(template)}), 200


# DELETE /templates/<id>
@template_bp.route("/templates/<int:template_id>", methods=["DELETE"])
def delete_template(template_id):
    template = db.session.get(Template, template_id)
    if not template:
        return jsonify({"error": "Template not found"}), 404

    db.session.delete(template)
    db.session.commit()

    try:
        fsdb.delete_fsdb_template(template_id)
    except Exception as e:
        print(f"Firestore sync error: {e}")

    return jsonify({"message": "Template deleted"}), 200
