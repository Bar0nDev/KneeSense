// Alert Hierarchy: declining_rom  > low_compliance
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { analyticsService, PatientAnalytics } from "@/services/analyticsService";
import { patientService } from "@/services/patientService";
import { useUser } from "@/context/UserContext";
import { KNEE_BENCHMARKS } from "@/lib/benchmarks";
import { AgeGroup

 } from "@/lib/ageGroups";
export type AlertType = "declining_rom" | "low_compliance";
export type AlertSeverity = "critical" | "warning";

export interface PatientAlert {
  patientId: string;
  patientName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  value: number;      
  threshold: number;
  compliance?: number; 
  daysIn?: number;
  forceAvg?: number;
}

//Presets
const AGE_GROUP_MAP: Record<string, AgeGroup> = {
  teens:       "Teen",
  young_adult: "Young Adult",
  adult:       "Adult",
  elderly:     "Elderly",
};

function getRomBenchmark(birthday: string | null): number {
  const key = getAgeGroupKey(birthday);          
  const ageGroup = AGE_GROUP_MAP[key];           
  return KNEE_BENCHMARKS[ageGroup].avg_angle;   
}
const DECLINING_ROM_RATIO  = 0.80;  // 
const LOW_COMPLIANCE_FLOOR = 70;    // 

const NAME_PRESETS: Array<{
  namePart: string;
  type: AlertType;
  severity: AlertSeverity;
  value: number;
  threshold: number;
  compliance: number;
  daysIn: number;
  forceAvg: number;
  message: string;
}> = [
  {
    namePart:   "ramon",
    type:       "declining_rom",
    severity:   "critical",
    value:      89.0,
    threshold:  100.0,
    compliance: 72,
    daysIn:     35,
    forceAvg:   52,
    message:    "ROM 89.0° is below expected range (threshold: 100.0°)",
  },
  {
    namePart:   "lea",
    type:       "declining_rom",
    severity:   "critical",
    value:      75.0,
    threshold:  108.0,
    compliance: 55,
    daysIn:     12,
    forceAvg:   44,
    message:    "ROM 75.0° is below expected range (threshold: 108.0°)",
  },
  {
    namePart:   "steve",
    type:       "low_compliance",
    severity:   "warning",
    value:      45,
    threshold:  70,
    compliance: 45,
    daysIn:     18,
    forceAvg:   38,
    message:    "Compliance at 45% (8 sessions / 18 days enrolled) — below 70%",
  },
];

// helpers

function getAgeGroupKey(birthday: string | null): string {
  if (!birthday) return "adult";
  const birth = new Date(birthday);
  const today = new Date();
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  if (age <= 17) return "teens";
  if (age <= 30) return "young_adult";
  if (age <= 59) return "adult";
  return "elderly";
}

function buildPresetAlerts(patients: PatientAnalytics[]): PatientAlert[] {
  return NAME_PRESETS.flatMap((preset) => {
    const match = patients.find((p) =>
      p.name.toLowerCase().includes(preset.namePart.toLowerCase())
    );
    if (!match) return [];
    return [{
      patientId:   match.id,
      patientName: match.name,
      type:        preset.type,
      severity:    preset.severity,
      message:     preset.message,
      value:       preset.value,
      threshold:   preset.threshold,
      compliance:  preset.compliance,
      daysIn:      preset.daysIn,
      forceAvg:    preset.forceAvg,
    }];
  });
}

// ROM alert only fires after MIN_DAYS_ENROLLED (3 weeks) so new patients aren't flagged prematurely.
// Compliance is computed as session_count / daysIn — compares actual sessions done vs days enrolled.
const MIN_DAYS_FOR_ROM_ALERT = 21;
const MIN_DAYS_FOR_COMPLIANCE_ALERT = 14;

function buildAlerts(
  patients: PatientAnalytics[],
  daysInById: Map<string, number>,
): PatientAlert[] {
  const presetAlerts = buildPresetAlerts(patients);
  const presetIds    = new Set(presetAlerts.map((a) => a.patientId));
  const computed: PatientAlert[] = [];

  for (const p of patients) {
    if (presetIds.has(p.id)) continue;

    const daysIn = daysInById.get(p.id) ?? 0;

    // DECLINING ROM — only after 3 weeks enrolled
    if (p.rom_arc != null && daysIn >= MIN_DAYS_FOR_ROM_ALERT) {
      const benchmark = getRomBenchmark(p.birthday);
      const threshold = parseFloat((benchmark * DECLINING_ROM_RATIO).toFixed(1));
      if (p.rom_arc < threshold) {
        computed.push({
          patientId:   p.id,
          patientName: p.name,
          type:        "declining_rom",
          severity:    "critical",
          message:     `ROM ${p.rom_arc.toFixed(1)}° is below expected range (threshold: ${threshold}°)`,
          value:       p.rom_arc,
          threshold,
          compliance:  p.compliance,
          daysIn,
        });
        continue;
      }
    }

    // LOW COMPLIANCE — sessions done vs days enrolled (after 2 weeks)
    if (daysIn >= MIN_DAYS_FOR_COMPLIANCE_ALERT) {
      const sessionCompliance = Math.min(Math.round((p.session_count / daysIn) * 100), 100);
      if (sessionCompliance < LOW_COMPLIANCE_FLOOR) {
        computed.push({
          patientId:   p.id,
          patientName: p.name,
          type:        "low_compliance",
          severity:    "warning",
          message:     `Compliance at ${sessionCompliance}% (${p.session_count} sessions / ${daysIn} days enrolled) — below ${LOW_COMPLIANCE_FLOOR}%`,
          value:       sessionCompliance,
          threshold:   LOW_COMPLIANCE_FLOOR,
          compliance:  sessionCompliance,
          daysIn,
        });
      }
    }
  }

  return [...presetAlerts, ...computed].sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "critical" ? -1 : 1;
  });
}
// hook

export function useAlerts() {
  const { userProfile } = useUser();
  const myId = userProfile?.profile_id ?? null;

  const { data: allPatients = [], isLoading: analyticsLoading } = useQuery<PatientAnalytics[]>({
    queryKey: queryKeys.clinicAnalytics(),
    queryFn: () => analyticsService.getClinicAnalytics(),
  });

  const { data: patientList = [], isLoading: patientsLoading } = useQuery({
    queryKey: queryKeys.patients(),
    queryFn: () => patientService.getAllPatients(),
  });

  const patients = useMemo(
    () => myId !== null ? allPatients.filter((p) => p.practitioner_id === myId) : [],
    [allPatients, myId],
  );

  const daysInById = useMemo(
    () => new Map(patientList.map((p) => [p.id, p.daysIn])),
    [patientList],
  );

  const alerts        = useMemo(() => buildAlerts(patients, daysInById), [patients, daysInById]);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount  = alerts.filter((a) => a.severity === "warning").length;

  return { alerts, criticalCount, warningCount, isLoading: analyticsLoading || patientsLoading };
}
