// Central registry of react-query keys. Every useQuery / invalidateQueries call
// should build its key from here so keys are constructed in exactly one place —
// no retyped string literals drifting out of sync across files.

export const queryKeys = {
  // Patients
  patients: () => ["patients"] as const,
  patient: (patientId: string) => ["patient", patientId] as const,

  // Practitioner (a patient's assigned practitioner — name/clinic/specialization)
  practitioner: (practitionerId: number | null | undefined) =>
    ["practitioner", practitionerId] as const,

  // Clinic analytics
  clinicAnalytics: () => ["clinic-analytics"] as const,

  // Library
  exercises: (practitionerId: number | null | undefined) =>
    ["exercises", practitionerId] as const,
  templates: (practitionerId: number | null | undefined) =>
    ["templates", practitionerId] as const,

  // Sessions
  sessions: (patientId: string) => ["sessions", patientId] as const,
  predictions: (sessionId: string) => ["predictions", sessionId] as const,
  insight: (sessionId: string) => ["insight", sessionId] as const,
  videoUrl: (sessionId: string) => ["video-url", sessionId] as const,

  // Admin portal
  adminPractitioners: () => ["admin", "practitioners"] as const,
  adminPractitioner: (id: string) => ["admin", "practitioner", id] as const,
  adminPatients: () => ["admin", "patients"] as const,
  adminPatient: (id: string) => ["admin", "patient", id] as const,
  adminSessions: (patientId?: string) =>
    ["admin", "sessions", patientId ?? null] as const,
  adminSession: (id: string) => ["admin", "session", id] as const,
};
