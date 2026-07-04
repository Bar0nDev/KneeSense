"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useSessionData } from "@/hooks/useSessionQueries";
import { userService } from "@/services/userService";
import { queryKeys } from "@/lib/queryKeys";
import { PatientProfile } from "@/types/patient";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function useDashboard() {
  const { userProfile } = useUser();
  const { allSessions, latestSession, isLoading: sessionsLoading } = useSessionData();

  const patientProfile =
    userProfile?.role === "patient" ? (userProfile.profile as PatientProfile) : null;
  const practitionerId = patientProfile?.practitioner_id ?? null;

  const { data: practitionerData, isLoading: practitionerLoading } = useQuery({
    queryKey: queryKeys.practitioner(practitionerId),
    queryFn: () => userService.getPractitionerInfo(practitionerId!),
    enabled: !!practitionerId,
  });

  const practitioner = practitionerData
    ? {
        name: practitionerData.name,
        specialization: practitionerData.specialization ?? "Practitioner",
        image: null as string | null,
      }
    : { name: "—", specialization: "—", image: null };

  const patient = {
    name: patientProfile?.name ?? "—",
    lastSession: latestSession
      ? `Your last recorded session was on ${new Date(latestSession.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
      : "Your progress starts with your first recording.",
  };

  const kneeAngleData = useMemo(
    () =>
      allSessions
        .filter((s) => s.avg_angle != null)
        .reverse()
        .map((s, i) => ({
          index: i,
          date: formatDate(s.created_at),
          angle: parseFloat(s.avg_angle!.toFixed(1)),
        })),
    [allSessions]
  );

  const tasks = {
    session: {
      title: "Mar 21, 2026",
      subtitle: "TODAY",
    },
    rehab: {
      title: "4-step Anti-frailty",
      subtitle: "Complete your daily exercises",
    },
  };

  const isLoading = sessionsLoading || (practitionerLoading && !!practitionerId);

  const kneeAngleBenchmark = 0;

  return { patient, practitioner, tasks, kneeAngleData, kneeAngleBenchmark, isLoading };
}
