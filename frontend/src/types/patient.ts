export interface PatientProfile {
  id: string;
  user_id: string | null;
  practitioner_id: string | null;
  name: string;
  birthday: string | null; // YYYY-MM-DD
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}