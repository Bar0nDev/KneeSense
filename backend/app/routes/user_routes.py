from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash
from app.database.firebase import firestore_repo as fsdb
from app.database.db import db
from app.database.models import User, Practitioner, Patient
from app.middleware.auth import require_auth

user_bp = Blueprint("users", __name__)
fs_db = fsdb.get_fs_db()

# =========================
# GET CURRENT USER (Firebase Auth)
# =========================
@user_bp.route("/users/me", methods=["GET"])
def get_me():
    uid = g.uid

    doc = fs_db.collection("user").document(uid).get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404

    user_data = doc.to_dict()
    return jsonify({
        "user_id": uid,
        "username": user_data.get("name", ""),
        "email": user_data.get("email", ""),
        "role": user_data.get("role", "practitioner"),
        "profile_id": user_data.get("profile_id"),
    }), 200


# =========================
# REGISTER
# =========================
@user_bp.route("/users/register", methods=["POST"])
def register_user():
    data = request.json
    uid = g.uid
    email = g.email

    name = data.get("name")
    role = data.get("role", "practitioner")

    if not name:
        return jsonify({"error": "name is required"}), 400

    if fs_db.collection("user").document(uid).get().exists:
        return jsonify({"error": "User already registered"}), 400

    fs_db.collection("user").document(uid).set({
        "name": name,
        "email": email,
        "role": role,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    })

    profile_id = None
    try:
        if role == "practitioner":
            prac_ref = fs_db.collection("practitioners").document()
            prac_ref.set({
                "user_id": uid,
                "clinic_name": None,
                "specialization": None,
                "created_at": datetime.now(timezone.utc),
            })
            profile_id = prac_ref.id

        elif role == "patient":
            patient_ref = fs_db.collection("patients").document()
            patient_ref.set({
                "user_id": uid,
                "name": name,
                "practitioner_id": None,
                "birthday": None,
                "sex": None,
                "height_cm": None,
                "weight_kg": None,
                "notes": None,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            })
            profile_id = patient_ref.id

        if profile_id:
            fs_db.collection("user").document(uid).update({"profile_id": profile_id})

    except Exception as e:
        print(f"Profile creation failed: {e}")

    return jsonify({"message": "User created", "user_id": uid}), 201


# =========================
# LOGIN
# =========================
# Disabled — authentication is now handled by Firebase Auth
# Use POST /users/register to create a profile, GET /users/me to retrieve it
@user_bp.route("/users/login", methods=["POST"])
def login():
    return jsonify({"error": "This endpoint is disabled. Use Firebase Auth."}), 410


# =========================
# GET ALL USERS
# =========================
@user_bp.route("/users", methods=["GET"])
def get_all_users():
    """
    Get all users
    ---
    tags:
      - Users
    responses:
      200:
        description: List of users
        schema:
          type: array
          items:
            $ref: '#/definitions/User'
    """
    try:
        docs = fs_db.collection("user").stream()
        users_list = []
        for doc in docs:
            user_data = doc.to_dict()
            user_data['id'] = doc.id 
            users_list.append(user_data)
            
        return jsonify(users_list), 200

    except Exception as e:
        print(f"Error fetching from Cloud: {e}")
        users = User.query.all()
        return jsonify([_serialize_user(u) for u in users])


# =========================
# GET USER BY ID
# =========================
@user_bp.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """
    Get a user by ID
    ---
    tags:
      - Users
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: User object
        schema:
          $ref: '#/definitions/User'

      404:
        description: User not found
        schema:
          $ref: '#/definitions/Error'
    """
    try:
        doc_ref = fs_db.collection("user").document(str(user_id))
        doc = doc_ref.get()

        if doc.exists:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            return jsonify(user_data), 200
            
    except Exception as e:
        print(f"Cloud fetch failed, checking local: {e}")

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    return jsonify(_serialize_user(user))

# =========================
# UPDATE USER
# =========================
@user_bp.route("/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """
    Update a user
    ---
    tags:
      - Users
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true

      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
            email:
              type: string
            password:
              type: string
            is_active:
              type: boolean

    responses:
      200:
        description: User updated
        schema:
          type: object
          properties:
            message:
              type: string
            user:
              $ref: '#/definitions/User'

      404:
        description: User not found
        schema:
          $ref: '#/definitions/Error'
    """
    data = request.json
    update_fields = {}

    user = db.session.get(User, user_id)
    doc = fs_db.collection("user").document(str(user_id)).get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404

    if "name" in data:
        update_fields["name"] = data["name"]
        if user:
            user.name = data["name"]

    if "email" in data:
        new_email = data["email"]

        existing = (fs_db.collection("user").where("email", "==", new_email).limit(1).get())
        if existing and existing[0].id != str(user_id):
            return jsonify({"error": "Email already in use"}), 400
        if user:
            user.email = new_email
        update_fields["email"] = new_email

    if "password" in data and user:
        user.password_hash = generate_password_hash(data["password"])
    
    if "is_active" in data:
        update_fields["is_active"] = data["is_active"]
        if user:
            user.is_active = data["is_active"]

    if user:
        db.session.commit()

    try:
        if update_fields:
            fs_db.collection("user").document(str(user_id)).set(update_fields, merge=True)
    except Exception as e:
        print(f"Cloud Update Failed: {e}")
        return jsonify({"error": "Firestore update failed"}), 500
    if user:
        return jsonify({"message": "User updated", "updated_fields": update_fields, "user": _serialize_user(user)})
    
    updated_doc = fs_db.collection("user").document(str(user_id)).get()
    return jsonify({"message": "User updated", "updated_fields": update_fields, "user": {"id": user_id, **updated_doc.to_dict()}})


# =========================
# DELETE USER
# =========================
@user_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    Delete a user
    ---
    tags:
      - Users
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true

    responses:
      200:
        description: User deleted
        schema:
          type: object
          properties:
            message:
              type: string

      404:
        description: User not found
        schema:
          $ref: '#/definitions/Error'
    """
    cloud_deleted = False
    try:
        cloud_deleted = fsdb.delete_fsdb_doc("user", user_id)
    except Exception:
        pass
    
    user = db.session.get(User, user_id)
    local_deleted = False

    if not cloud_deleted and not local_deleted:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    local_deleted = True
    return jsonify({"message": "User deleted"})


# =========================
# HELPER
# =========================
def _serialize_user(u: User) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat(),
    }