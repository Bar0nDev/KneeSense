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
  template_id: number | null;
  program_start_date: string | null;
  program_frequency: number | null;
  program_duration_weeks: number | null;
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
    compliance: raw.compliance ?? 75,
    forceAvg: raw.force_avg ?? 0,
    nextSession: "N/A",
    template_id: raw.template_id ?? null,
    program_start_date: raw.program_start_date ?? null,
    program_frequency: raw.program_frequency ?? null,
    program_duration_weeks: raw.program_duration_weeks ?? null,
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

  async assignProgram(patientId: string, payload: {
    template_id: number;
    frequency?: number;
    duration_weeks?: number;
    start_date?: string;
  }): Promise<void> {
    await apiClient.put(`/patients/${patientId}/program`, payload);
  },
};
