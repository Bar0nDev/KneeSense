import apiClient from '@/lib/apiClient';
import { AuthResponse } from '@/types/user';

export const userService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post('/users/login', { username, password });
    return data;
  },

  async register(authPayload: any): Promise<any> {
    const { data } = await apiClient.post('/users/register', authPayload);
    return data;
  },

  async updatePatientProfile(profileId: number, profilePayload: any): Promise<any> {
    const { data } = await apiClient.put(`/patients/${profileId}`, profilePayload);
    return data;
  },

  async getPatientProfile(userId: number): Promise<any> {
    const { data } = await apiClient.get(`/users/${userId}/patient`);
    return data;
  },

  async updatePractitionerProfile(profileId: number, profilePayload: any): Promise<any> {
    const { data } = await apiClient.put(`/practitioners/${profileId}`, profilePayload);
    return data;
  },
};