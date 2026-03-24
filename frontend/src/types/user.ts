export type UserRole = 'patient' | 'practitioner' | 'manager' | 'admin';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user_id: number;
  username: string;
  role: UserRole;
  profile_id: number | null;
}