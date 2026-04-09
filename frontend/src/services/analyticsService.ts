import apiClient from '@/lib/apiClient';

export interface PatientAnalytics {
  id: string;
  name: string;
  birthday: string | null;
  practitioner_id: number | null;
  compliance: number;
  session_count: number;
  rom_arc: number | null;
  avg_angle: number | null;
  zone1_avg: number | null;
  zone2_avg: number | null;
  zone3_avg: number | null;
}

export const analyticsService = {
  async getClinicAnalytics(): Promise<PatientAnalytics[]> {
    const { data } = await apiClient.get('/analytics/clinic');
    return data as PatientAnalytics[];
  },
};
