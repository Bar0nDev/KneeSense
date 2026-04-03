import apiClient from '@/lib/apiClient';

export interface PatientListItem {
  id: string;
  name: string;
  practitioner_id: number | null;
  birthday: string | null;
  daysIn: number;
  status: string;
  compliance: number;
  forceAvg: number;
  nextSession: string;
}

function mapToPatientListItem(raw: any): PatientListItem {
  const createdAt = raw.created_at ? new Date(raw.created_at) : new Date();
  const daysIn = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const practitioner_id = raw.practitioner_id ?? null;
  const status = practitioner_id === null ? "unassigned" : "stable";

  return {
    id: String(raw.id),
    name: raw.name,
    practitioner_id,
    birthday: raw.birthday ?? null,
    daysIn,
    status,
    compliance: 0,
    forceAvg: 0,
    nextSession: "N/A",
  };
}

export const patientService = {
  async getAllPatients(): Promise<PatientListItem[]> {
    const { data } = await apiClient.get('/patients');
    return (data as any[]).map(mapToPatientListItem);
  },

  async assignPatient(patientId: string, practitionerId: number): Promise<void> {
    await apiClient.put(`/patients/${patientId}/assign`, { practitioner_id: practitionerId });
  },
};
