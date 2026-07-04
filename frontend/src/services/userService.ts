import apiClient from '@/lib/apiClient';

export const userService = {

  async getProfile() {
    const { data } = await apiClient.get('/users/me');
    return data; // { user_id, name, email, role, profile_id }
  },

  async register(payload: any, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await apiClient.post('/users/register', payload, { headers });
    return data;
  },

  async getUser(userId: number) {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data; // { id, name, email, role, is_active, created_at }
  },

  async getPatientProfile(userId: number) {
    const { data } = await apiClient.get(`/users/${userId}/patient`);
    return data;
  },

  async updatePatientProfile(profileId: number, payload: any) {
    const { data } = await apiClient.put(`/patients/${profileId}`, payload);
    return data;
  },

  async getPractitionerProfile(profileId: number) {
    const { data } = await apiClient.get(`/practitioners/${profileId}`);
    return data;
  },

  async updatePractitionerProfile(profileId: number, payload: any) {
    const { data } = await apiClient.put(`/practitioners/${profileId}`, payload);
    return data;
  },
};