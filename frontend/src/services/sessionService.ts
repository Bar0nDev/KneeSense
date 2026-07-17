import apiClient from '@/lib/apiClient';

export const sessionService = {

  uploadSession: async (formData: FormData) => {
    const { data } = await apiClient.post('/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 1 minute
    });
    return data;
  },

  getPatientSessions: async (patientId: string) => {
    const { data } = await apiClient.get(`/patients/${patientId}/sessions`);
    return data;
  },

  getPredictions: async (sessionId: string) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/predictions`);
    return data;
  },

  analyzeSession: async (sessionId: string) => {
    const { data } = await apiClient.post(`/sessions/${sessionId}/analyze`, {}, {
      timeout: 300000, // 5 minutes
    });
    return data;
  },

  generateInsight: async (sessionId: string) => {
    const { data } = await apiClient.post(`/sessions/${sessionId}/generate-insight`, {}, {
      timeout: 120000, // 2 minutes
    });
    return data;
  },

  getInsight: async (sessionId: string) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/insight`);
    return data;
  },

  getVideoUrl: async (sessionId: string) => {
    const { data } = await apiClient.get(`/sessions/${sessionId}/video-url`);
    return data.url as string;
  },

  getAnalysisFile: async (filename: string) => {
    const { data } = await apiClient.get(`/data/analysis/${filename}`, {
      timeout: 30000, // 30 seconds — analysis files can be large
    });
    return data;
  },

};