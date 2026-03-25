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

def delete_fsdb_doc(collection_name, doc_id):
    try:
        doc_ref = fs_db.collection(collection_name).document(str(doc_id))
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
    except Exception as e:
        return False
    
# =========================
# PRACTITIONERS & PATIENTS
# =========================
def fsdb_practitioner(practitioner):
    fs_db.collection("practitioners").document(str(practitioner.id)).set({
        "user_id": practitioner.user_id,
        "clinic_name": practitioner.clinic_name,
        "specialization": practitioner.specialization,
        "created_at": practitioner.created_at
    })
    
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
        "has_llm_insight": False,
        "prediction_count": len(session.frame_predictions) if session.frame_predictions else 0
    }, merge=True)

def mark_analysis_complete(session_id, json_filename, total_frames):
    fs_db.collection("sessions").document(str(session_id)).update({
        "status": "completed",
        "has_analysis": True,
        "total_frames": total_frames,
        "analysis_json_name": json_filename
    })

def mark_analysis_failed(session_id):
    fs_db.collection("sessions").document(str(session_id)).update({
        "status": "failed"
    })

def mark_insight_complete(session_id, insight_text, model_used):
    doc_ref = fs_db.collection("sessions").document(str(session_id))
    insight_payload = {
        "insight_text": insight_text,
        "model": model_used,
        "session_id": session_id,
        "has_insight": True,
        "status": "completed"
    }
    doc_ref.update(insight_payload)