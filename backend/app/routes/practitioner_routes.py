from flask import Blueprint, request, jsonify
from app.database.firebase import firestore_repo as fsdb
from app.database.db import db
from app.database.models import Practitioner, Patient

practitioner_bp = Blueprint("practitioners", __name__)
fs_db = fsdb.get_fs_db()

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
    try:
        docs = fs_db.collection("practitioners").stream()
        practitioners_list = []
        for doc in docs:
            practitioner_data = doc.to_dict()
            practitioner_data['id'] = doc.id 
            practitioners_list.append(practitioner_data)

        return jsonify(practitioners_list), 200

    except Exception as e:
        print(f"Error fetching from Cloud: {e}")
        practitioners = Practitioner.query.all()
        return jsonify([_serialize_practitioner(p) for p in practitioners])


# =========================
# GET PRACTITIONER BY ID
# =========================

@practitioner_bp.route("/practitioners/<string:practitioner_id>", methods=["GET"])
def get_practitioner(practitioner_id):
    """
    Get a practitioner by ID
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: string
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
    try:
        doc_ref = fs_db.collection("practitioners").document(str(practitioner_id))
        doc = doc_ref.get()

        if doc.exists:
            practitioner_data = doc.to_dict()
            practitioner_data['id'] = doc.id
            return jsonify(practitioner_data), 200
            
    except Exception as e:
        print(f"Cloud fetch failed, checking local: {e}")
        
    practitioner = db.session.get(Practitioner, practitioner_id)
    if not practitioner:
        return jsonify({"error": "Practitioner not found"}), 404
    return jsonify(_serialize_practitioner(practitioner))


# =========================
# CREATE PRACTITIONER (TBD)*
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
    try:
        db.session.add(practitioner)
        db.session.commit()
        fsdb.fsdb_practitioner(practitioner)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create profile", "details": str(e)}), 500

    return jsonify({"message": "Practitioner created", "practitioner_id": practitioner.id}), 201


# =========================
# UPDATE PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<string:practitioner_id>", methods=["PUT"])
def update_practitioner(practitioner_id):
    """
    Update a practitioner profile
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: string
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
    data = request.json
    # practitioner = db.session.get(Practitioner, practitioner_id)
    doc_ref = fs_db.collection("practitioners").document(str(practitioner_id))
    
    try:
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Practitioner not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Cloud check failed: {str(e)}"}), 500

    allowed_fields = ["clinic_name", "specialization"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({"message": "No changes detected"}), 200

    # cloud-first
    try:
        doc_ref.set(update_fields, merge=True)
    except Exception as e:
        return jsonify({"error": f"Cloud update failed: {str(e)}"}), 500
    
    # sql fallback
    practitioner = db.session.get(Practitioner, practitioner_id)
    if practitioner:
        try:
            for key, value in update_fields.items():
                setattr(practitioner, key, value)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Local update failed (cloud already updated): {e}")

        return jsonify({"message": "Practitioner updated", "practitioner": _serialize_practitioner(practitioner)})

# =========================
# DELETE PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<string:practitioner_id>", methods=["DELETE"])
def delete_practitioner(practitioner_id):
    """
    Delete a practitioner profile
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: string
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

    fsdb.delete_fsdb_doc("practitioners", practitioner_id)
    db.session.delete(practitioner)
    db.session.commit()
    return jsonify({"message": "Practitioner deleted"})


# =========================
# GET PATIENTS FOR PRACTITIONER
# =========================

@practitioner_bp.route("/practitioners/<string:practitioner_id>/patients", methods=["GET"])
def get_practitioner_patients(practitioner_id):
    """
    Get all patients for a specific practitioner
    ---
    tags:
      - Practitioners
    parameters:
      - name: practitioner_id
        in: path
        type: string
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