from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.database.firebase import firestore_repo as fsdb
from app.database.db import db
from app.database.models import User, Practitioner, Patient

user_bp = Blueprint("users", __name__)
fs_db = fsdb.get_fs_db()

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

    try:
        fsdb.create_fsdb_user(user)

        if role == "practitioner":
            practitioner = Practitioner(user_id=user.id)
            db.session.add(practitioner)
            db.session.commit()
            fsdb.fsdb_practitioner(practitioner)

        elif role == "patient":
            patient = Patient(user_id=user.id, name=user.name)
            db.session.add(patient)
            db.session.commit()
            fsdb.fsdb_patient(patient)

    except Exception as e:
        print(f"Cloud Sync Failed: {e}")

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
    if not user:
        try:
            users_ref = fs_db.collection("user")
            query = users_ref.where("username", "==", username).limit(1).stream()
            
            fsdb_user_doc = None
            for doc in query:
                fsdb_user_doc = doc
                break

            if fsdb_user_doc:
                user_data = fsdb_user_doc.to_dict()
                if check_password_hash(user_data.get("password_hash", ""), password):
                    #sync from cloud to local
                    user = User(
                        id=int(fsdb_user_doc.id),
                        name=user_data.get("name"),
                        username=user_data.get("username"),
                        email=user_data.get("email"),
                        password_hash=user_data.get("password_hash"),
                        role=user_data.get("role", "practitioner")
                    )
                    db.session.add(user)
                    db.session.commit()
                    print(f"User {username} recovered from Cloud to Local DB.") 
                else:
                    return jsonify({"error": "Invalid credentials"}), 401
            else:
                return jsonify({"error": "User not found"}), 401

        except Exception as e:
            print(f"Cloud Login Check Failed: {e}")
            return jsonify({"error": "Authentication service error"}), 500
    
    elif not check_password_hash(user.password_hash, password):
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
        return jsonify({"error": "User not found in Cloud or Local DB"}), 404
        
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