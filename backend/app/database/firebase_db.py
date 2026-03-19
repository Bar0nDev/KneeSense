import firebase_admin
from firebase_admin import credentials, firestore
import os

def init_firebase():
    
    # Initialize Firebase Admin SDK >> (TBD on account creation)
    cred_path = os.path.join(os.getcwd(), "firebase-key.json")
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Export the db instance
fs_db = init_firebase()

# To-do:
# - discuss account for firebase and set up environment variables for credentials
# - implement Firestore interactions in routes (e.g., saving sessions, retrieving patient data)
# - create Database Utility functions for common Firestore operations (CRUD) to keep route code clean

# Example
# Create a new patient document in Firestore:
# new_patient = {
#     "name": "John Doe",
#     "age": 45,
#     "practitioner_id": "prac_123", >>> uuid
#     "notes": "Recovering from ACL surgery"
# }
#
# Push to Firestore:
# db.collection("patients").add(new_patient)

# # Create a reference to a specific patient
# patient_ref = db.collection("patients").document("p_12345")

# # Link it in the session
# db.collection("sessions").add({
#     "patient_ref": patient_ref, # This is the "FK"
#     "video_url": "...",
#     "created_at": firestore.SERVER_TIMESTAMP
# })