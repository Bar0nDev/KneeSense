from flask import Blueprint, request, jsonify
from app.database.firebase.firebase_db import get_fs_db
from app.database.firebase import firestore_repo as fsdb
from app.middleware.auth import require_admin

admin_bp = Blueprint("admin", __name__)
fs_db = get_fs_db()


# =========================
# HELPERS
# =========================

def _iso(value):
    """Normalise a Firestore timestamp to an ISO string; pass through otherwise."""
    return value.isoformat() if hasattr(value, "isoformat") else value


def _load_users():
    """Return {uid: user_dict} for all users (doc id is the Firebase uid)."""
    users = {}
    for doc in fs_db.collection("user").stream():
        users[doc.id] = doc.to_dict()
    return users


def _load_practitioners():
    """Return {practitioner_id: practitioner_dict} for all practitioners."""
    practitioners = {}
    for doc in fs_db.collection("practitioners").stream():
        practitioners[doc.id] = doc.to_dict()
    return practitioners


def _practitioner_name(practitioner_id, practitioners, users):
    """Resolve a practitioner's display name via practitioner -> user join."""
    if not practitioner_id:
        return None
    prac = practitioners.get(practitioner_id)
    if not prac:
        return None
    user = users.get(prac.get("user_id"))
    return user.get("name") if user else None


# =========================
# PRACTITIONERS
# =========================

# GET /admin/practitioners
@admin_bp.route("/practitioners", methods=["GET"])
@require_admin
def list_practitioners():
    users = _load_users()

    # Count assigned patients per practitioner in a single pass.
    patient_counts = {}
    for doc in fs_db.collection("patients").stream():
        pid = doc.to_dict().get("practitioner_id")
        if pid:
            patient_counts[pid] = patient_counts.get(pid, 0) + 1

    result = []
    for doc in fs_db.collection("practitioners").stream():
        d = doc.to_dict()
        user = users.get(d.get("user_id"), {})
        result.append({
            "id": doc.id,
            "user_id": d.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "clinic_name": d.get("clinic_name"),
            "specialization": d.get("specialization"),
            # Older docs created before the status field default to "pending".
            "status": d.get("status") or "pending",
            "patient_count": patient_counts.get(doc.id, 0),
            "created_at": _iso(d.get("created_at")),
        })

    return jsonify(result), 200


# GET /admin/practitioners/<id>
@admin_bp.route("/practitioners/<practitioner_id>", methods=["GET"])
@require_admin
def get_practitioner_detail(practitioner_id):
    doc = fs_db.collection("practitioners").document(practitioner_id).get()
    if not doc.exists:
        return jsonify({"error": "Practitioner not found"}), 404

    d = doc.to_dict()
    users = _load_users()
    user = users.get(d.get("user_id"), {})

    patients = []
    for pdoc in fs_db.collection("patients").stream():
        pd = pdoc.to_dict()
        if pd.get("practitioner_id") != practitioner_id:
            continue
        patients.append({
            "id": pdoc.id,
            "name": pd.get("name"),
            "is_active": pd.get("is_active", True),
            "created_at": _iso(pd.get("created_at")),
        })

    return jsonify({
        "id": doc.id,
        "user_id": d.get("user_id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "clinic_name": d.get("clinic_name"),
        "specialization": d.get("specialization"),
        "status": d.get("status") or "pending",
        "patient_count": len(patients),
        "created_at": _iso(d.get("created_at")),
        "patients": patients,
    }), 200


# PUT /admin/practitioners/<id>/approve
@admin_bp.route("/practitioners/<practitioner_id>/approve", methods=["PUT"])
@require_admin
def approve_practitioner(practitioner_id):
    if not fsdb.set_practitioner_status(practitioner_id, "approved"):
        return jsonify({"error": "Practitioner not found"}), 404
    return jsonify({"message": "Practitioner approved", "status": "approved"}), 200


# PUT /admin/practitioners/<id>/reject
@admin_bp.route("/practitioners/<practitioner_id>/reject", methods=["PUT"])
@require_admin
def reject_practitioner(practitioner_id):
    if not fsdb.set_practitioner_status(practitioner_id, "rejected"):
        return jsonify({"error": "Practitioner not found"}), 404
    return jsonify({"message": "Practitioner rejected", "status": "rejected"}), 200


# =========================
# PATIENTS
# =========================

# GET /admin/patients
@admin_bp.route("/patients", methods=["GET"])
@require_admin
def list_patients():
    users = _load_users()
    practitioners = _load_practitioners()

    result = []
    for doc in fs_db.collection("patients").stream():
        d = doc.to_dict()
        user = users.get(d.get("user_id"), {})
        result.append({
            "id": doc.id,
            "user_id": d.get("user_id"),
            "name": d.get("name"),
            "email": user.get("email"),
            "birthday": d.get("birthday"),
            "sex": d.get("sex"),
            "height_cm": d.get("height_cm"),
            "weight_kg": d.get("weight_kg"),
            "notes": d.get("notes"),
            "is_active": d.get("is_active", True),
            "practitioner_id": d.get("practitioner_id"),
            "practitioner_name": _practitioner_name(d.get("practitioner_id"), practitioners, users),
            "created_at": _iso(d.get("created_at")),
        })

    return jsonify(result), 200


# GET /admin/patients/<id>
@admin_bp.route("/patients/<patient_id>", methods=["GET"])
@require_admin
def get_patient_detail(patient_id):
    doc = fs_db.collection("patients").document(patient_id).get()
    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    d = doc.to_dict()
    users = _load_users()
    practitioners = _load_practitioners()
    user = users.get(d.get("user_id"), {})

    sessions = []
    for sdoc in fs_db.collection("sessions").stream():
        sd = sdoc.to_dict()
        if sd.get("patient_id") != patient_id:
            continue
        sessions.append({
            "id": sdoc.id,
            "status": sd.get("status"),
            "has_analysis": sd.get("has_analysis", False),
            "min_angle": sd.get("min_angle"),
            "max_angle": sd.get("max_angle"),
            "avg_angle": sd.get("avg_angle"),
            "rom_arc": sd.get("rom_arc"),
            "created_at": _iso(sd.get("created_at")),
        })

    return jsonify({
        "id": doc.id,
        "user_id": d.get("user_id"),
        "name": d.get("name"),
        "email": user.get("email"),
        "birthday": d.get("birthday"),
        "sex": d.get("sex"),
        "height_cm": d.get("height_cm"),
        "weight_kg": d.get("weight_kg"),
        "notes": d.get("notes"),
        "is_active": d.get("is_active", True),
        "practitioner_id": d.get("practitioner_id"),
        "practitioner_name": _practitioner_name(d.get("practitioner_id"), practitioners, users),
        "created_at": _iso(d.get("created_at")),
        "sessions": sessions,
    }), 200


# =========================
# SESSIONS
# =========================

def _serialize_session(session_id, sd, patients, practitioners, users, detail=False):
    patient = patients.get(sd.get("patient_id"), {})
    # Prefer the practitioner recorded on the session; fall back to the patient's.
    practitioner_id = sd.get("practitioner_id") or patient.get("practitioner_id")

    out = {
        "id": session_id,
        "patient_id": sd.get("patient_id"),
        "patient_name": patient.get("name"),
        "practitioner_id": practitioner_id,
        "practitioner_name": _practitioner_name(practitioner_id, practitioners, users),
        "status": sd.get("status"),
        "has_analysis": sd.get("has_analysis", False),
        "has_insight": sd.get("has_insight", False),
        "min_angle": sd.get("min_angle"),
        "max_angle": sd.get("max_angle"),
        "avg_angle": sd.get("avg_angle"),
        "rom_arc": sd.get("rom_arc"),
        "dominant_zone": sd.get("dominant_zone"),
        "created_at": _iso(sd.get("created_at")),
    }

    if detail:
        out.update({
            "zone1_avg": sd.get("zone1_avg"),
            "zone2_avg": sd.get("zone2_avg"),
            "zone3_avg": sd.get("zone3_avg"),
            "insight_text": sd.get("insight_text"),
            "summary_text": sd.get("summary_text"),
            "notes": sd.get("notes"),
        })

    return out


# GET /admin/sessions  (optional ?patient_id=)
@admin_bp.route("/sessions", methods=["GET"])
@require_admin
def list_sessions():
    patient_filter = request.args.get("patient_id")

    patients = {doc.id: doc.to_dict() for doc in fs_db.collection("patients").stream()}
    practitioners = _load_practitioners()
    users = _load_users()

    result = []
    for doc in fs_db.collection("sessions").stream():
        sd = doc.to_dict()
        if patient_filter and sd.get("patient_id") != patient_filter:
            continue
        result.append(_serialize_session(doc.id, sd, patients, practitioners, users))

    return jsonify(result), 200


# GET /admin/sessions/<id>
@admin_bp.route("/sessions/<session_id>", methods=["GET"])
@require_admin
def get_session_detail(session_id):
    doc = fs_db.collection("sessions").document(session_id).get()
    if not doc.exists:
        return jsonify({"error": "Session not found"}), 404

    patients = {pdoc.id: pdoc.to_dict() for pdoc in fs_db.collection("patients").stream()}
    practitioners = _load_practitioners()
    users = _load_users()

    return jsonify(_serialize_session(doc.id, doc.to_dict(), patients, practitioners, users, detail=True)), 200
