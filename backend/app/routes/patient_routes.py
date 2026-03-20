from flask import Blueprint, request, jsonify
from datetime import date

from app.database.db import db
from app.database.models import Patient

patient_bp = Blueprint("patients", __name__)


# =========================
# GET ALL PATIENTS
# =========================

@patient_bp.route("/patients", methods=["GET"])
def get_all_patients():
    """
    Get all patients (active only by default)
    ---
    tags:
      - Patients
    parameters:
      - name: include_inactive
        in: query
        type: boolean
        default: false
    responses:
        200:
            description: List of patients
            schema:
                type: array
                items:
                    $ref: '#/definitions/Patient'
    """
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"
    query = Patient.query if include_inactive else Patient.query.filter_by(is_active=True)
    return jsonify([_serialize_patient(p) for p in query.all()])


# =========================
# GET PATIENT BY ID
# =========================

@patient_bp.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    """
    Get a patient by ID
    ---
    tags:
      - Patients
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true
    responses:
        200:
            schema:
                $ref: '#/definitions/Patient'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(_serialize_patient(patient))


# =========================
# GET PATIENT BY USER ID
# Used by a logged-in patient to fetch their own profile
# =========================

@patient_bp.route("/users/<int:user_id>/patient", methods=["GET"])
def get_patient_by_user(user_id):
    """
    Get a patient profile by their User ID
    ---
    tags:
      - Patients
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
    responses:
        200:
            schema:
                $ref: '#/definitions/Patient'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return jsonify({"error": "No patient profile found for this user"}), 404
    return jsonify(_serialize_patient(patient))


# =========================
# CREATE PATIENT (manual, by practitioner)
# Self-registered patients are created via /users/register
# =========================

@patient_bp.route("/patients", methods=["POST"])
def create_patient():
    """
    Create a patient record manually (by a practitioner)
    ---
    tags:
      - Patients
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            practitioner_id:
              type: integer
            name:
              type: string
              example: Jane Doe
            birthday:
              type: string
              format: date
              example: "1990-05-15"
            sex:
              type: string
              example: female
            height_cm:
              type: number
            weight_kg:
              type: number
            notes:
              type: string
    responses:
        201:
            description: Patient created
            schema:
                type: object
                properties:
                    message:
                        type: string
                    patient_id:
                        type: integer

        400:
            schema:
                $ref: '#/definitions/Error'
    """
    data = request.json

    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400

    birthday = None
    if "birthday" in data and data["birthday"]:
        try:
            birthday = date.fromisoformat(data["birthday"])
        except ValueError:
            return jsonify({"error": "birthday must be YYYY-MM-DD"}), 400

    patient = Patient(
        # user_id intentionally not set — no login account yet
        practitioner_id=data.get("practitioner_id"),
        name=name,
        birthday=birthday,
        sex=data.get("sex"),
        height_cm=data.get("height_cm"),
        weight_kg=data.get("weight_kg"),
        notes=data.get("notes"),
    )
    db.session.add(patient)
    db.session.commit()

    return jsonify({"message": "Patient created", "patient_id": patient.id}), 201


# =========================
# UPDATE PATIENT
# =========================

@patient_bp.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    """
    Update a patient record
    ---
    tags:
      - Patients
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        schema:
          properties:
            name:
              type: string
            birthday:
              type: string
              format: date
            sex:
              type: string
            height_cm:
              type: number
            weight_kg:
              type: number
            notes:
              type: string
            practitioner_id:
              type: integer
            is_active:
              type: boolean
    responses:
        200:
            description: Patient updated
            schema:
                type: object
                properties:
                    message:
                        type: string
                    patient:
                        $ref: '#/definitions/Patient'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    data = request.json

    if "name" in data:
        patient.name = data["name"]
    if "birthday" in data and data["birthday"]:
        try:
            patient.birthday = date.fromisoformat(data["birthday"])
        except ValueError:
            return jsonify({"error": "birthday must be YYYY-MM-DD"}), 400
    if "sex" in data:
        patient.sex = data["sex"]
    if "height_cm" in data:
        patient.height_cm = data["height_cm"]
    if "weight_kg" in data:
        patient.weight_kg = data["weight_kg"]
    if "notes" in data:
        patient.notes = data["notes"]
    if "practitioner_id" in data:
        patient.practitioner_id = data["practitioner_id"]
    if "is_active" in data:
        patient.is_active = data["is_active"]

    db.session.commit()
    return jsonify({"message": "Patient updated", "patient": _serialize_patient(patient)})


# =========================
# ASSIGN PRACTITIONER TO PATIENT
# Convenience endpoint for the "claim/assign" flow
# =========================

@patient_bp.route("/patients/<int:patient_id>/assign", methods=["PUT"])
def assign_practitioner(patient_id):
    """
    Assign a practitioner to a patient
    ---
    tags:
      - Patients
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          properties:
            practitioner_id:
              type: integer
    responses:
        200:
            description: Practitioner assigned
            schema:
                type: object
                properties:
                    message:
                        type: string
                    patient:
                        $ref: '#/definitions/Patient'

        400:
            schema:
                $ref: '#/definitions/Error'

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    data = request.json
    practitioner_id = data.get("practitioner_id")
    if not practitioner_id:
        return jsonify({"error": "practitioner_id is required"}), 400

    patient.practitioner_id = practitioner_id
    db.session.commit()
    return jsonify({"message": "Practitioner assigned", "patient": _serialize_patient(patient)})


# =========================
# SOFT DELETE
# =========================

@patient_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    """
    Soft-delete a patient (sets is_active=False)
    ---
    tags:
      - Patients
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true
    responses:
        200:
            description: Success
            schema:
                type: object
                properties:
                    message:
                        type: string

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    patient.is_active = False
    db.session.commit()
    return jsonify({"message": "Patient deactivated"})


# =========================
# HARD DELETE
# =========================

@patient_bp.route("/patients/<int:patient_id>/purge", methods=["DELETE"])
def purge_patient(patient_id):
    """
    Permanently delete a patient and all associated records
    ---
    tags:
      - Patients
    parameters:
      - name: patient_id
        in: path
        type: integer
        required: true
    responses:
        200:
            description: Success
            schema:
                type: object
                properties:
                    message:
                        type: string

        404:
            schema:
                $ref: '#/definitions/Error'
    """
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient permanently deleted"})


# =========================
# HELPER
# =========================

def _serialize_patient(p: Patient) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "practitioner_id": p.practitioner_id,
        "name": p.name,
        "birthday": p.birthday.isoformat() if p.birthday else None,
        "sex": p.sex,
        "height_cm": p.height_cm,
        "weight_kg": p.weight_kg,
        "notes": p.notes,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat(),
    }