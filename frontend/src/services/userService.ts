import apiClient from '@/lib/apiClient';

export const userService = {
  async login(username: string, password: string) {
    const { data } = await apiClient.post('/users/login', { username, password });
    return data; // { user_id, username, role, profile_id }
  },

  async register(payload: any) {
    const { data } = await apiClient.post('/users/register', payload);
    return data;
  },

  // Full user info — GET /users/:id
  async getUser(userId: number) {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data; // { id, name, username, email, role, is_active, created_at }
  },

  // Patient profile — GET /users/:user_id/patient
  async getPatientProfile(userId: number) {
    const { data } = await apiClient.get(`/users/${userId}/patient`);
    return data;
  },

  async updatePatientProfile(profileId: number, payload: any) {
    const { data } = await apiClient.put(`/patients/${profileId}`, payload);
    return data;
  },

  // Practitioner profile — GET /practitioners/:id
  async getPractitionerProfile(profileId: number) {
    const { data } = await apiClient.get(`/practitioners/${profileId}`);
    return data;
  },

  async updatePractitionerProfile(profileId: number, payload: any) {
    const { data } = await apiClient.put(`/practitioners/${profileId}`, payload);
    return data;
  },
};