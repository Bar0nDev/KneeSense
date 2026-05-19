from flask import Blueprint, request, jsonify
from datetime import date
from app.database.firebase import firestore_repo as fsdb
from app.database.db import db
from app.database.models import Patient, Practitioner

patient_bp = Blueprint("patients", __name__)
fs_db = fsdb.get_fs_db()

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
    
    try:
        docs = fs_db.collection("patients").stream()
        patients_list = []

        for doc in docs:
            patient_data = doc.to_dict()
            patient_data['id'] = doc.id 
            is_active = patient_data.get("is_active", True)
            if not include_inactive and not is_active:
                continue

            patients_list.append(patient_data)

        return jsonify(patients_list), 200
        
    except Exception as e:
        query = Patient.query if include_inactive else Patient.query.filter_by(is_active=True)
        return jsonify([_serialize_patient(p) for p in query.all()])
    
    
    


# =========================
# GET PATIENT BY ID
# =========================

@patient_bp.route("/patients/<patient_id>", methods=["GET"])
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
    try:
        doc_ref = fs_db.collection("patients").document(str(patient_id))
        doc = doc_ref.get()

        if doc.exists:
            patient_data = doc.to_dict()
            patient_data['id'] = doc.id 
            return jsonify(patient_data), 200
        
    except Exception as e:
        print(f"Error fetching from Cloud: {e}")
    
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404
    return jsonify(_serialize_patient(patient))


# =========================
# GET PATIENT BY USER ID
# Used by a logged-in patient to fetch their own profile
# =========================

@patient_bp.route("/users/<user_id>/patient", methods=["GET"])
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
    try:
        pt_ref = fs_db.collection("patients")
        query = pt_ref.where("user_id", "==", user_id).limit(1).get()

        if query:
            doc = query[0]
            patient_data = doc.to_dict()
            patient_data['id'] = doc.id 
            return jsonify(patient_data), 200
        
    except Exception as e:
        print(f"Error fetching from Cloud: {e}")
    
    patient = Patient.query.filter_by(user_id=user_id).first()
    if patient:
        return jsonify(_serialize_patient(patient))
    
    return jsonify({"error": "No patient profile found for this user"}), 404


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

    try:
        fsdb.fsdb_patient(patient)
    except Exception as e:
        print(f"Error creating patient profile: {e}")

    return jsonify({"message": "Patient created", "patient_id": patient.id}), 201


# =========================
# UPDATE PATIENT
# =========================

@patient_bp.route("/patients/<patient_id>", methods=["PUT"])
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
    data = request.json
    patient = db.session.get(Patient, patient_id)
    doc_ref = fs_db.collection("patients").document(str(patient_id))

    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    
    allowed_fields = ["name", "sex", "height_cm", "weight_kg", "notes", "practitioner_id", "is_active"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if "birthday" in data and data["birthday"]:
        try:
            patient.birthday = date.fromisoformat(data["birthday"])
            update_fields["birthday"] = data["birthday"] 
        except ValueError:
            return jsonify({"error": "birthday must be YYYY-MM-DD"}), 400

    if not update_fields and "birthday" not in data:
        return jsonify({"message": "No changes detected"}), 200

    try:
        for key, value in update_fields.items():
            if key != "birthday":
                setattr(patient, key, value)
        
        db.session.commit()
        doc_ref.set(update_fields, merge=True)

    except Exception as e:
        db.session.rollback()
        print(f"Update failed: {e}")
        return jsonify({"error": "Update failed", "details": str(e)}), 500
    
    return jsonify({"message": "Patient updated", "patient": _serialize_patient(patient)})


# =========================
# ASSIGN PRACTITIONER TO PATIENT
# Convenience endpoint for the "claim/assign" flow
# =========================

@patient_bp.route("/patients/<patient_id>/assign", methods=["PUT"])
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
        return jsonify({"error": "Practitioner_id is required"}), 400
    
    # Verify practitioner exists
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner does not exist"}), 404
    
    try:
        patient.practitioner_id = practitioner_id
        db.session.commit()

        doc_ref = fs_db.collection("patients").document(str(patient_id))
        doc_ref.set({"practitioner_id": practitioner_id}, merge=True)

    except Exception as e:
        db.session.rollback()
        print(f"Assignment failed: {e}")
        return jsonify({"error": "Failed to assign practitioner", "details": str(e)}), 500
    
    return jsonify({"message": "Practitioner assigned", "patient": _serialize_patient(patient)})


# =========================
# SOFT DELETE
# =========================

@patient_bp.route("/patients/<patient_id>", methods=["DELETE"])
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
    
    try:
        patient.is_active = False
        db.session.commit()
        doc_ref = fs_db.collection("patients").document(str(patient_id))
        doc_ref.update({"is_active": False})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to deactivate patient", "details": str(e)}), 500

    return jsonify({"message": "Patient deactivated"})


# =========================
# HARD DELETE
# =========================

@patient_bp.route("/patients/<patient_id>/purge", methods=["DELETE"])
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
    try:
        db.session.delete(patient)
        db.session.commit()
        doc_ref = fs_db.collection("patients").document(str(patient_id))
        doc_ref.delete()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to permanently delete patient", "details": str(e)}), 500
    
    return jsonify({"message": "Patient permanently deleted"})


# =========================
# ASSIGN PROGRAM TO PATIENT
# =========================

@patient_bp.route("/patients/<patient_id>/program", methods=["PUT"])
def assign_program(patient_id):
    """Assign a template-based program to a patient (stored in Firestore)."""
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

    try:
        doc_ref = fs_db.collection("patients").document(str(patient_id))
        doc_ref.set(update, merge=True)
        return jsonify({"message": "Program assigned"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# CLINIC ANALYTICS
# =========================

@patient_bp.route("/analytics/clinic", methods=["GET"])
def get_clinic_analytics():
    try:
        patient_docs = list(fs_db.collection("patients").stream())
        session_docs = list(fs_db.collection("sessions").where("status", "==", "completed").stream())

        from collections import defaultdict
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
            compliance = min(len(sessions) * 10, 100)

            result.append({
                "id": pid,
                "name": d.get("name", ""),
                "birthday": d.get("birthday"),
                "practitioner_id": d.get("practitioner_id"),
                "compliance": compliance,
                "session_count": len(sessions),
                "rom_arc": latest.get("rom_arc"),
                "avg_angle": latest.get("avg_angle"),
                "zone1_avg": latest.get("zone1_avg"),
                "zone2_avg": latest.get("zone2_avg"),
                "zone3_avg": latest.get("zone3_avg"),
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Analytics error: {e}")
        return jsonify({"error": str(e)}), 500


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