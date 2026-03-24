import apiClient from '@/lib/apiClient';

export const sessionService = {
  getPatientSessions: async (patientId: number) => {
    const { data } = await apiClient.get(`/patients/${patientId}/sessions`);
    return data;
  },

  uploadVideo: async (formData: FormData) => {
    const { data } = await apiClient.post('/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getPredictions: async (sessionId: number) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/predictions`);
    return data;
  }
};