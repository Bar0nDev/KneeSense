import apiClient from '@/lib/apiClient';

export const sessionService = {

  uploadSession: async (formData: FormData) => {
    const { data } = await apiClient.post('/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 1 minute
    });
    return data;
  },

  getPatientSessions: async (patientId: number) => {
    const { data } = await apiClient.get(`/patients/${patientId}/sessions`);
    return data; 
  },

 
  getPredictions: async (sessionId: number) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/predictions`);
    return data; 
  },

  analyzeSession: async (sessionId: number) => {
    const { data } = await apiClient.post(`/sessions/${sessionId}/analyze`, {}, {
      timeout: 300000, // 5 minutes
    });
    return data;
  },

  generateInsight: async (sessionId: number) => {
    const { data } = await apiClient.post(`/sessions/${sessionId}/generate-insight`, {}, {
      timeout: 120000, // 2 minutes
    });
    return data;
  },

  getInsight: async (sessionId: number) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/insight`);
    return data; 
  },


};