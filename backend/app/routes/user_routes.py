from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from google.cloud.firestore_v1 import FieldFilter
from app.database.firebase.firebase_db import get_fs_db

user_bp = Blueprint("users", __name__)
fs_db = get_fs_db()


# =========================
# GET CURRENT USER
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
        "name": user_data.get("name", ""),
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
# LOGIN — disabled
# =========================
@user_bp.route("/users/login", methods=["POST"])
def login():
    return jsonify({"error": "This endpoint is disabled. Use Firebase Auth."}), 410


# =========================
# GET ALL USERS
# =========================
@user_bp.route("/users", methods=["GET"])
def get_all_users():
    docs = fs_db.collection("user").stream()
    users = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        users.append(d)
    return jsonify(users), 200


# =========================
# GET USER BY ID
# =========================
@user_bp.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    doc = fs_db.collection("user").document(user_id).get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404
    d = doc.to_dict()
    d["id"] = doc.id
    return jsonify(d), 200


# =========================
# UPDATE USER
# =========================
@user_bp.route("/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    doc_ref = fs_db.collection("user").document(user_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    allowed = ["name", "is_active"]
    update_fields = {k: v for k, v in data.items() if k in allowed}

    if "email" in data:
        existing = fs_db.collection("user").where(filter=FieldFilter("email", "==", data["email"])).limit(1).get()
        if existing and existing[0].id != user_id:
            return jsonify({"error": "Email already in use"}), 400
        update_fields["email"] = data["email"]

    if not update_fields:
        return jsonify({"message": "No changes detected"}), 200

    doc_ref.set(update_fields, merge=True)
    updated = doc_ref.get().to_dict()
    updated["id"] = user_id
    return jsonify({"message": "User updated", "user": updated}), 200


# =========================
# DELETE USER
# =========================
@user_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    doc_ref = fs_db.collection("user").document(user_id)
    if not doc_ref.get().exists:
        return jsonify({"error": "User not found"}), 404
    doc_ref.delete()
    return jsonify({"message": "User deleted"}), 200
