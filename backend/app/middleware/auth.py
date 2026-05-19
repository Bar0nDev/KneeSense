from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth

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
