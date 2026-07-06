// Admin portal types. All Firestore document ids and foreign keys are strings
// (doc ids / Firebase uids), so ids are typed as string here.

export type PractitionerStatus = "pending" | "approved" | "rejected";
export type SessionStatus = "pending" | "completed" | "failed";

export interface AdminPractitioner {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  clinic_name: string | null;
  specialization: string | null;
  status: PractitionerStatus;
  is_active: boolean;
  patient_count: number;
  created_at: string | null;
}

// Editable fields for the patient / practitioner edit modals.
export interface AdminPatientUpdate {
  name?: string;
  birthday?: string | null;
  sex?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface AdminPractitionerUpdate {
  clinic_name?: string | null;
  specialization?: string | null;
  is_active?: boolean;
}

// A patient row as shown inside a practitioner's detail panel.
export interface AdminPractitionerPatient {
  id: string;
  name: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface AdminPractitionerDetail extends AdminPractitioner {
  patients: AdminPractitionerPatient[];
}

export interface AdminPatient {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  birthday: string | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
  is_active: boolean;
  practitioner_id: string | null;
  practitioner_name: string | null;
  created_at: string | null;
}

// A session row as shown inside a patient's detail panel.
export interface AdminPatientSession {
  id: string;
  status: SessionStatus | null;
  has_analysis: boolean;
  min_angle: number | null;
  max_angle: number | null;
  avg_angle: number | null;
  rom_arc: number | null;
  created_at: string | null;
}

export interface AdminPatientDetail extends AdminPatient {
  sessions: AdminPatientSession[];
}

export interface AdminSession {
  id: string;
  patient_id: string | null;
  patient_name: string | null;
  practitioner_id: string | null;
  practitioner_name: string | null;
  status: SessionStatus | null;
  has_analysis: boolean;
  has_insight: boolean;
  min_angle: number | null;
  max_angle: number | null;
  avg_angle: number | null;
  rom_arc: number | null;
  dominant_zone: string | null;
  created_at: string | null;
  // Present only on the single-session detail endpoint.
  zone1_avg?: number | null;
  zone2_avg?: number | null;
  zone3_avg?: number | null;
  insight_text?: string | null;
  summary_text?: string | null;
  notes?: string | null;
}
