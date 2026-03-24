export interface PatientProfile {
  id: number;
  user_id: number | null;
  practitioner_id: number | null;
  name: string;
  birthday: string | null; // YYYY-MM-DD
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}