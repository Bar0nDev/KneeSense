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

  // Combined practitioner card: profile + owning user's name, in one shape.
  // Shared by the patient dashboard and profile page so they hit one cache entry.
  async getPractitionerInfo(profileId: number) {
    const profile = await this.getPractitionerProfile(profileId);
    const user = await this.getUser(profile.user_id);
    return {
      name: user.name as string,
      clinic_name: (profile.clinic_name ?? null) as string | null,
      specialization: (profile.specialization ?? null) as string | null,
    };
  },

  async updatePractitionerProfile(profileId: number, payload: any) {
    const { data } = await apiClient.put(`/practitioners/${profileId}`, payload);
    return data;
  },
};