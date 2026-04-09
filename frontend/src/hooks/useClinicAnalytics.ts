"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService, PatientAnalytics } from "@/services/analyticsService";
import { useUser } from "@/context/UserContext";

// types

export interface ComplianceTier {
  name: string;
  sub: string;
  color: string;
  stroke: string;
  min: number;
  value: number;
}

export interface ComplianceData {
  tiers: ComplianceTier[];
  total: number;
  avgCompliance: number;
}

export interface ScatterPoint {
  id: string;
  name: string;
  age: number;
  rom: number;
  group: string;
  x: number;
  y: number;
}

export interface TricompartmentalPoint {
  subject: string;
  clinic: number;
  benchmark: number;
}

// constants
const COMPLIANCE_TIERS = [
  { name: "High",   sub: "> 80%", color: "#00AC8F", stroke: "#007D69", min: 80 },
  { name: "Medium", sub: "> 50%", color: "#FF8C00", stroke: "#C46D00", min: 50 },
  { name: "Low",    sub: "< 50%", color: "#FF2D55", stroke: "#C4002F", min: 0  },
];

const AGE_GROUPS = [
  { key: "teens",       label: "Teens",       range: "13-17", xMin: 13, xMax: 17, color: "#00C9A7", benchmark: 160 },
  { key: "young_adult", label: "Young Adult", range: "18-30", xMin: 18, xMax: 30, color: "#FF8C00", benchmark: 150 },
  { key: "adult",       label: "Adult",       range: "31-59", xMin: 31, xMax: 59, color: "#399195", benchmark: 135 },
  { key: "elderly",     label: "Elderly",     range: "60+",   xMin: 60, xMax: 90, color: "#FF2D55", benchmark: 115 },
];

const TRICOMPARTMENTAL_BENCHMARKS: Record<string, { patellofemoral: number; lateral: number; medial: number }> = {
  teens:       { patellofemoral: 0.95, lateral: 0.90, medial: 0.85 },
  young_adult: { patellofemoral: 0.92, lateral: 0.90, medial: 0.88 },
  adult:       { patellofemoral: 0.88, lateral: 0.85, medial: 0.82 },
  elderly:     { patellofemoral: 0.75, lateral: 0.70, medial: 0.68 },
};

// helpers
function calcAge(birthday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= 0 ? age : null;
}

function getAgeGroupKey(age: number): string {
  if (age <= 17) return "teens";
  if (age <= 30) return "young_adult";
  if (age <= 59) return "adult";
  return "elderly";
}

// build
function buildComplianceData(patients: PatientAnalytics[]): ComplianceData {
  const counts = [0, 0, 0];
  let total = 0;
  for (const p of patients) {
    total += p.compliance;
    if (p.compliance >= 80) counts[0]++;
    else if (p.compliance >= 50) counts[1]++;
    else counts[2]++;
  }
  return {
    tiers: COMPLIANCE_TIERS.map((t, i) => ({ ...t, value: counts[i] })),
    total: patients.length,
    avgCompliance: patients.length > 0 ? Math.round(total / patients.length) : 0,
  };
}

function buildScatterData(patients: PatientAnalytics[]): ScatterPoint[] {
  return patients
    .filter((p) => p.rom_arc != null)
    .map((p) => {
      const age = calcAge(p.birthday)!;
      return {
        id: p.id,
        name: p.name,
        age,
        rom: p.rom_arc!,
        group: getAgeGroupKey(age),
        x: age,
        y: p.rom_arc!,
      };
    })
    .filter((p) => p.age >= 10 && p.age <= 90);
}

function buildTricompartmentalData(
  patients: PatientAnalytics[],
): Record<string, TricompartmentalPoint[]> {
  const grouped: Record<string, { z1: number[]; z2: number[]; z3: number[] }> = {
    teens:       { z1: [], z2: [], z3: [] },
    young_adult: { z1: [], z2: [], z3: [] },
    adult:       { z1: [], z2: [], z3: [] },
    elderly:     { z1: [], z2: [], z3: [] },
  };

  for (const p of patients) {
    if (p.zone1_avg == null || p.zone2_avg == null || p.zone3_avg == null) continue;
    const age = calcAge(p.birthday);
    if (age == null) continue;
    grouped[getAgeGroupKey(age)].z1.push(p.zone1_avg / 100);
    grouped[getAgeGroupKey(age)].z2.push(p.zone2_avg / 100);
    grouped[getAgeGroupKey(age)].z3.push(p.zone3_avg / 100);
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const result: Record<string, TricompartmentalPoint[]> = {};
  for (const { key } of AGE_GROUPS) {
    const bm = TRICOMPARTMENTAL_BENCHMARKS[key];
    const z1 = avg(grouped[key].z1);
    const z2 = avg(grouped[key].z2);
    const z3 = avg(grouped[key].z3);
    result[key] = [
      { subject: "Patellofemoral", clinic: z2 ?? bm.patellofemoral * 0.85, benchmark: bm.patellofemoral },
      { subject: "Lateral",        clinic: z3 ?? bm.lateral * 0.85,        benchmark: bm.lateral },
      { subject: "Medial",         clinic: z1 ?? bm.medial * 0.85,         benchmark: bm.medial },
    ];
  }
  return result;
}

// hook

export const AGE_GROUP_CONFIG = AGE_GROUPS;

export function useClinicAnalytics() {
  const { userProfile } = useUser();
  const myId = userProfile?.profile_id ?? null;

  const { data: allPatients = [], isLoading } = useQuery<PatientAnalytics[]>({
    queryKey: ["clinic-analytics"],
    queryFn: () => analyticsService.getClinicAnalytics(),
  });

  const patients = useMemo(
    () => (myId !== null ? allPatients.filter((p) => p.practitioner_id === myId) : []),
    [allPatients, myId],
  );

  const complianceData      = useMemo(() => buildComplianceData(patients), [patients]);
  const scatterData         = useMemo(() => buildScatterData(patients), [patients]);
  const tricompartmentalData = useMemo(() => buildTricompartmentalData(patients), [patients]);

  return {
    isLoading,
    patients,
    complianceData,
    scatterData,
    tricompartmentalData,
  };
}
