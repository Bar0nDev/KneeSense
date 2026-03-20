from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from app.database.db import db
from app.database.models import User, Practitioner, Patient

user_bp = Blueprint("users", __name__)

# =========================
# REGISTER
# =========================
@user_bp.route("/users/register", methods=["POST"])
def register_user():
    """
    Register a new User
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - username
            - password
          properties:
            name:
              type: string
              example: Jane Doe
            username:
              type: string
            email:
              type: string
            password:
              type: string
            role:
              type: string
              enum: [practitioner, patient, manager, admin]

    responses:
      201:
        description: User created successfully
        schema:
          type: object
          properties:
            message:
              type: string
            user_id:
              type: integer

      400:
        description: Validation error
        schema:
          $ref: '#/definitions/Error'
    """
    data = request.json

    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "practitioner")

    if not name or not username or not password:
        return jsonify({"error": "name, username, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already in use"}), 400

    user = User(
        name=name,
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    if role == "practitioner":
        db.session.add(Practitioner(user_id=user.id))
        db.session.commit()
    elif role == "patient":
        db.session.add(Patient(user_id=user.id, name=name))
        db.session.commit()

    return jsonify({"message": "User created", "user_id": user.id}), 201


# =========================
# LOGIN
# =========================
@user_bp.route("/users/login", methods=["POST"])
def login():
    """
    User Login
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
            password:
              type: string

    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
            user_id:
              type: integer
            username:
              type: string
            role:
              type: string
            profile_id:
              type: integer
              nullable: true

      401:
        description: Invalid credentials
        schema:
          $ref: '#/definitions/Error'
    """
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    profile_id = None
    if user.role == "practitioner" and user.practitioner_profile:
        profile_id = user.practitioner_profile.id
    elif user.role == "patient" and user.patient_profile:
        profile_id = user.patient_profile.id

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "profile_id": profile_id,
    })


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
    users = User.query.all()
    return jsonify([_serialize_user(u) for u in users])


# =========================
# GET USER BY ID
# =========================
@user_bp.route("/users/<int:user_id>", methods=["GET"])
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
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_serialize_user(user))


# =========================
# UPDATE USER
# =========================
@user_bp.route("/users/<int:user_id>", methods=["PUT"])
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
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json

    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        if data["email"] != user.email and User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already in use"}), 400
        user.email = data["email"]
    if "password" in data:
        user.password_hash = generate_password_hash(data["password"])
    if "is_active" in data:
        user.is_active = data["is_active"]

    db.session.commit()
    return jsonify({"message": "User updated", "user": _serialize_user(user)})


# =========================
# DELETE USER
# =========================
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
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
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
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