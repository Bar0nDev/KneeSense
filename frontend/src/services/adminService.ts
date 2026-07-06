import apiClient from '@/lib/apiClient';
import {
  AdminPractitioner,
  AdminPractitionerDetail,
  AdminPatient,
  AdminPatientDetail,
  AdminPatientUpdate,
  AdminPractitionerUpdate,
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

  async updatePractitioner(id: string, payload: AdminPractitionerUpdate): Promise<void> {
    await apiClient.put(`/admin/practitioners/${id}`, payload);
  },

  async deactivatePractitioner(id: string): Promise<void> {
    await apiClient.delete(`/admin/practitioners/${id}`);
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

  async updatePatient(id: string, payload: AdminPatientUpdate): Promise<void> {
    await apiClient.put(`/admin/patients/${id}`, payload);
  },

  // practitionerId = null clears the assignment
  async assignPatientPractitioner(id: string, practitionerId: string | null): Promise<void> {
    await apiClient.put(`/admin/patients/${id}/assign`, { practitioner_id: practitionerId });
  },

  async deactivatePatient(id: string): Promise<void> {
    await apiClient.delete(`/admin/patients/${id}`);
  },

  // Users (display name only; email is not editable)
  async updateUserName(userId: string, name: string): Promise<void> {
    await apiClient.put(`/admin/users/${userId}`, { name });
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
