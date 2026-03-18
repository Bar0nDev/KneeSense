from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from app.database.db import db
from app.database.models import User, Practitioner

user_bp = Blueprint("users", __name__)


# =========================
# REGISTER USER
# =========================

@user_bp.route("/users/register", methods=["POST"])
def register_user():

    # Swagger documentation for the /users/register endpoint (V1.0)
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
          properties:
            name:
              type: string
              example: Test
            username:
              type: string
              example: Test123
            password:
              type: string
              example: encryption123
            role:
              type: string
              enum: [practitioner, patient, admin]
              default: practitioner
    responses:
      200:
        description: User created successfully
      400:
        description: Username already exists or missing credentials
    """

    data = request.json

    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "practitioner")

    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({"error": "Username already exists"}), 400

    password_hash = generate_password_hash(password)

    user = User(
        name=name,
        username=username,
        password_hash=password_hash,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    # create practitioner profile automatically
    if role == "practitioner":
        practitioner = Practitioner(user_id=user.id)
        db.session.add(practitioner)
        db.session.commit()

    return jsonify({"message": "User created", "user_id": user.id})


# =========================
# LOGIN
# =========================

@user_bp.route("/users/login", methods=["POST"])
def login():

    # Swagger documentation for the /users/login endpoint (V1.0)
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
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """

    data = request.json

    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role
    })