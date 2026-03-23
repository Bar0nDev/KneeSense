from datetime import datetime
from app.database.firebase.firebase_db import get_fs_db

fs_db = get_fs_db()

# =========================
# USER AUTH
# =========================

def create_fsdb_user(user):
    fs_db.collection("user").document(str(user.id)).set({
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at
        # "created_at": datetime.utcnow()
    })