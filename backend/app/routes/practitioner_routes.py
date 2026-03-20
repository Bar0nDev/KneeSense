from flask import Blueprint, request, jsonify

from app.database.db import db
from app.database.models import Practitioner, Patient

practitioner_bp = Blueprint("practitioners", __name__)


# =========================
# GET ALL PRACTITIONERS
# =========================

@practitioner_bp.route("/practitioners", methods=["GET"])
def get_all_practitioners():
    """
    Get all practitioners
    ---
    tags:
      - Practitioners
    responses:
        200:
            description: List of practitioners
            schema:
                type: array
                items:
                    $ref: '#/definitions/Practitioner'
    """
    practitioners = Practitioner.query.all()
    return jsonify([_serialize_practitioner(p) for p in practitioners])


# =========================
# GET PRACTITIONER BY ID
# =========================

@practitioner_bp.route("/practitioners/<int:practitioner_id>", methods=["GET"])
def get_practitioner(practitioner_id):
    """
    Get a practitioner by ID
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: integer
        required: true
    responses:
        200:
            description: Practitioner object
            schema:
                $ref: '#/definitions/Practitioner'

        404:
            description: Not found
            schema:
                $ref: '#/definitions/Error'
    """
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner not found"}), 404
    return jsonify(_serialize_practitioner(practitioner))


# =========================
# CREATE PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners", methods=["POST"])
def create_practitioner():
    """
    Create a practitioner profile manually
    ---
    tags:
      - Practitioners
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            user_id:
              type: integer
            clinic_name:
              type: string
            specialization:
              type: string
    responses:
        201:
            description: Practitioner created
            schema:
                type: object
                properties:
                    message:
                        type: string
                    practitioner_id:
                        type: integer

        400:
            schema:
                $ref: '#/definitions/Error'
    """
    data = request.json

    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if Practitioner.query.filter_by(user_id=user_id).first():
        return jsonify({"error": "Practitioner profile already exists for this user"}), 400

    practitioner = Practitioner(
        user_id=user_id,
        clinic_name=data.get("clinic_name"),
        specialization=data.get("specialization"),
    )
    db.session.add(practitioner)
    db.session.commit()

    return jsonify({"message": "Practitioner created", "practitioner_id": practitioner.id}), 201


# =========================
# UPDATE PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<int:practitioner_id>", methods=["PUT"])
def update_practitioner(practitioner_id):
    """
    Update a practitioner profile
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        schema:
          properties:
            clinic_name:
              type: string
            specialization:
              type: string
    responses:
        200:
            description: Practitioner updated
            schema:
                type: object
                properties:
                    message:
                        type: string
                    practitioner:
                        $ref: '#/definitions/Practitioner'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner not found"}), 404

    data = request.json
    if "clinic_name" in data:
        practitioner.clinic_name = data["clinic_name"]
    if "specialization" in data:
        practitioner.specialization = data["specialization"]

    db.session.commit()
    return jsonify({"message": "Practitioner updated", "practitioner": _serialize_practitioner(practitioner)})


# =========================
# DELETE PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<int:practitioner_id>", methods=["DELETE"])
def delete_practitioner(practitioner_id):
    """
    Delete a practitioner profile
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Practitioner deleted
      404:
        description: Practitioner not found
    """
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner not found"}), 404

    db.session.delete(practitioner)
    db.session.commit()
    return jsonify({"message": "Practitioner deleted"})


# =========================
# GET PATIENTS FOR PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<int:practitioner_id>/patients", methods=["GET"])
def get_practitioner_patients(practitioner_id):
    """
    Get all patients for a specific practitioner
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: integer
        required: true
    responses:
        200:
            description: List of patients
            schema:
                type: array
                items:
                    $ref: '#/definitions/Patient'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner not found"}), 404

    patients = Patient.query.filter_by(practitioner_id=practitioner_id, is_active=True).all()
    return jsonify([_serialize_patient(p) for p in patients])


# =========================
# HELPERS
# =========================

def _serialize_practitioner(p: Practitioner) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "clinic_name": p.clinic_name,
        "specialization": p.specialization,
        "created_at": p.created_at.isoformat(),
    }


def _serialize_patient(p: Patient) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "birthday": p.birthday.isoformat() if p.birthday else None,
        "sex": p.sex,
        "height_cm": p.height_cm,
        "weight_kg": p.weight_kg,
        "notes": p.notes,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat(),
    }