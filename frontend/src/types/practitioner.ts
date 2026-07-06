export interface PractitionerProfile {
  id: number;
  user_id: number;
  clinic_name: string | null;
  specialization: string | null;
  // Admin approval gate. Legacy docs created before this field may be undefined.
  status?: "pending" | "approved" | "rejected";
  created_at: string;
}