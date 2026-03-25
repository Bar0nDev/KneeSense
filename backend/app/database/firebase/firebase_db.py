import firebase_admin
from firebase_admin import credentials, firestore
from app.config import Config

_fs_db = None

def get_fs_db():
    global _fs_db

    if _fs_db:
        return _fs_db

    if not firebase_admin._apps:
        cred = credentials.Certificate(Config.FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)

    _fs_db = firestore.client()
    return _fs_db