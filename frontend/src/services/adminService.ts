import apiClient from '@/lib/apiClient';
import {
  AdminPractitioner,
  AdminPractitionerDetail,
  AdminPatient,
  AdminPatientDetail,
  AdminSession,
} from '@/types/admin';

export const adminService = {
  // Practitioners
  async getPractitioners(): Promise<AdminPractitioner[]> {
    const { data } = await apiClient.get('/admin/practitioners');
    return data;
  },

  async getPractitioner(id: string): Promise<AdminPractitionerDetail> {
    const { data } = await apiClient.get(`/admin/practitioners/${id}`);
    return data;
  },

  async approvePractitioner(id: string): Promise<void> {
    await apiClient.put(`/admin/practitioners/${id}/approve`);
  },

  async rejectPractitioner(id: string): Promise<void> {
    await apiClient.put(`/admin/practitioners/${id}/reject`);
  },

  // Patients
  async getPatients(): Promise<AdminPatient[]> {
    const { data } = await apiClient.get('/admin/patients');
    return data;
  },

  async getPatient(id: string): Promise<AdminPatientDetail> {
    const { data } = await apiClient.get(`/admin/patients/${id}`);
    return data;
  },

  // Sessions
  async getSessions(patientId?: string): Promise<AdminSession[]> {
    const { data } = await apiClient.get('/admin/sessions', {
      params: patientId ? { patient_id: patientId } : undefined,
    });
    return data;
  },

  async getSession(id: string): Promise<AdminSession> {
    const { data } = await apiClient.get(`/admin/sessions/${id}`);
    return data;
  },
};
