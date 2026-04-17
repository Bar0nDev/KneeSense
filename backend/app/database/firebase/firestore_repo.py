from datetime import datetime
from app.database.firebase.firebase_db import get_fs_db

fs_db = get_fs_db()

# =========================
# USERS & AUTHENTICATION
# =========================

def create_fsdb_user(name, username, email, password_hash, role, is_active, created_at) -> str:
    _, doc_ref = fs_db.collection("user").add({
        "name": name,
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "is_active": is_active,
        "created_at": created_at,
    })
    return doc_ref.id


def get_user_firestore(user_id):
    doc = fs_db.collection("user").document(str(user_id)).get()
    if doc.exists:
        return doc.to_dict()
    return None


def delete_fsdb_doc(collection_name, doc_id):
    try:
        doc_ref = fs_db.collection(collection_name).document(str(doc_id))
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
    except Exception:
        return False


# =========================
# PRACTITIONERS & PATIENTS
# =========================

def create_fsdb_practitioner(user_id, clinic_name, specialization, created_at) -> str:

    _, doc_ref = fs_db.collection("practitioners").add({
        "user_id": user_id,
        "clinic_name": clinic_name,
        "specialization": specialization,
        "created_at": created_at,
    })
    return doc_ref.id


def create_fsdb_patient(user_id, practitioner_id, name, birthday, sex, height_cm, weight_kg, notes, is_active, created_at) -> str:

    _, doc_ref = fs_db.collection("patients").add({
        "user_id": user_id,
        "practitioner_id": practitioner_id,
        "name": name,
        "birthday": birthday.isoformat() if birthday else None,
        "sex": sex,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "notes": notes,
        "is_active": is_active,
        "created_at": created_at,
    })
    return doc_ref.id

def fsdb_patient(patient):
    fs_db.collection("patients").document(str(patient.id)).set({
        "user_id": patient.user_id,
        "practitioner_id": patient.practitioner_id,
        "name": patient.name,
        "birthday": patient.birthday.isoformat() if patient.birthday else None,
        "sex": patient.sex,
        "height_cm": patient.height_cm,
        "weight_kg": patient.weight_kg,
        "notes": patient.notes,
        "is_active": patient.is_active,
        "created_at": patient.created_at
    })

# =========================
# SESSIONS & AI ANALYSIS
# =========================

def fsdb_session(session):
    fs_db.collection("sessions").document(str(session.id)).set({
        "patient_id": session.patient_id,
        "practitioner_id": session.practitioner_id,
        "video_path": session.video_path,
        "fps": session.fps or 30,
        "notes": session.notes,
        "created_at": session.created_at,
        
        "status": "pending",
        "has_analysis": False,
        "has_insight": False,

        "prediction_count": 0
    }, merge=True)


def mark_analysis_complete(session_id, json_filename, total_frames,
                           min_angle=None, max_angle=None, avg_angle=None, rom_arc=None, zone1_avg=None, zone2_avg=None, zone3_avg=None, dominant_zone=None):

    fs_db.collection("sessions").document(str(session_id)).update({
        "status": "completed",
        "has_analysis": True,
        "analysis_json_name": json_filename,
        "total_frames": total_frames,
        "prediction_count": total_frames,
        "min_angle": min_angle,
        "max_angle": max_angle,
        "avg_angle": avg_angle,
        "rom_arc": rom_arc,
        "zone1_avg": zone1_avg,
        "zone2_avg": zone2_avg,
        "zone3_avg": zone3_avg,
        "dominant_zone": dominant_zone
    })


def mark_analysis_failed(session_id):
    fs_db.collection("sessions").document(str(session_id)).update({
        "status": "failed"
    })


def mark_insight_complete(session_id, insight_text, model_used, summary_text=None):
    fs_db.collection("sessions").document(str(session_id)).update({
        "insight_text": insight_text,
        "summary_text": summary_text,
        "model": model_used,
        "has_insight": True
    })


# =========================
# EXERCISES
# =========================

def fsdb_exercise(exercise):
    fs_db.collection("exercises").document(str(exercise.id)).set({
        "practitioner_id": exercise.practitioner_id,
        "name": exercise.name,
        "instructions": exercise.instructions,
        "difficulty": exercise.difficulty,
        "default_sets": exercise.default_sets,
        "default_reps": exercise.default_reps,
        "reps_min": exercise.reps_min,
        "reps_max": exercise.reps_max,
        "media_url": exercise.media_url,
        "patient_featured": exercise.patient_featured,
        "is_favorite": exercise.is_favorite,
        "created_at": exercise.created_at,
    })


def delete_fsdb_exercise(exercise_id):
    fs_db.collection("exercises").document(str(exercise_id)).delete()


# =========================
# TEMPLATES
# =========================

def fsdb_template(template, exercises):
    fs_db.collection("templates").document(str(template.id)).set({
        "practitioner_id": template.practitioner_id,
        "name": template.name,
        "sub_label": template.sub_label,
        "is_favorite": template.is_favorite,
        "created_at": template.created_at,
        "exercises": [
            {
                "exercise_id": te.exercise_id,
                "position": te.position,
                "sets_override": te.sets_override,
                "reps_override": te.reps_override,
            }
            for te in exercises
        ],
    })


def delete_fsdb_template(template_id):
    fs_db.collection("templates").document(str(template_id)).delete()