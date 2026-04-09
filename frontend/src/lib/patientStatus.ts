export type PatientStatus = "improving" | "stable" | "declining" | "unassigned";

export interface StatusConfig {
  bg: string;
  text: string;
  icon: string;
  label: string;
}

export const STATUS_CONFIG: Record<PatientStatus, StatusConfig> = {
  improving:  { bg: "#E6FAF5", text: "#00AC8F", icon: "↑", label: "Improving" },
  stable:     { bg: "#FFF7E6", text: "#FF8C00", icon: "→", label: "Stable" },
  declining:  { bg: "#FFF0F3", text: "#FF2D55", icon: "↓", label: "Declining" },
  unassigned: { bg: "#FFFBF2", text: "#FF8C00", icon: "?", label: "Unassigned" },
};

/** Derive status from compliance percentage */
export function deriveStatus(compliance: number): PatientStatus {
  if (compliance >= 70) return "improving";
  if (compliance >= 40) return "stable";
  return "declining";
}

/** Returns true if a patient is considered stalled (needs attention) */
export function isStalled(status: PatientStatus, compliance: number): boolean {
  return status === "declining" || compliance < 40;
}

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status as PatientStatus] ?? STATUS_CONFIG.stable;
}

export function complianceColor(compliance: number): string {
  if (compliance < 50) return "#FF2D55";
  if (compliance < 70) return "#FF8C00";
  return "#00AC8F";
}
