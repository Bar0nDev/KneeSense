import apiClient from '@/lib/apiClient';

export const userService = {
  async login(username: string, password: string) {
    const { data } = await apiClient.post('/users/login', { username, password });
    return data; 
  },

  async register(payload: any) {
    const { data } = await apiClient.post('/users/register', payload);
    return data;
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