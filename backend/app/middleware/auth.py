from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from app.database.firebase.firebase_db import get_fs_db

# Routes that don't require a Firebase token
PUBLIC_ROUTES = {
    "/api/users/login",
    "/api/test",
}


def verify_token():
    """Verify Firebase token and set g.uid / g.email. Returns error response or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid authorization header"}), 401

    token = auth_header.split("Bearer ")[1]
    try:
        decoded = auth.verify_id_token(token)
        g.uid = decoded["uid"]
        g.email = decoded.get("email", "")
    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 401

    return None


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        error = verify_token()
        if error:
            return error
        return f(*args, **kwargs)
    return decorated


def get_current_user_role():
    """Look up the current user's role from their Firestore user doc via g.uid.
    The global before_request middleware has already verified the token and set
    g.uid, so this only reads the role. Returns the role string or None."""
    uid = getattr(g, "uid", None)
    if not uid:
        return None
    doc = get_fs_db().collection("user").document(uid).get()
    if not doc.exists:
        return None
    return doc.to_dict().get("role")


def require_role(*allowed_roles):
    """Decorator enforcing that the authenticated user's role is one of
    `allowed_roles`. Assumes the token is already verified (g.uid set) by the
    global auth middleware; rejects with 403 on a role mismatch."""
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            role = get_current_user_role()
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient permissions"}), 403
            return f(*args, **kwargs)
        return decorated
    return wrapper


def require_admin(f):
    """Convenience decorator: restrict a route to users with the "admin" role."""
    return require_role("admin")(f)
