from datetime import datetime
from app.database.firebase.firebase_db import get_fs_db

fs_db = get_fs_db()

# =========================
# USERS & AUTHENTICATION
# =========================

def create_fsdb_user(user):
    fs_db.collection("user").document(str(user.id)).set({
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password_hash": user.password_hash,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at
    })

def get_user_firestore(user_id):
    doc = fs_db.collection("user").document(str(user_id)).get()
    if doc.exists:
        return doc.to_dict()
    return None