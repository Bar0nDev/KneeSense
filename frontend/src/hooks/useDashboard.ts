"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useSessionData } from "@/hooks/useSessionQueries";
import { userService } from "@/services/userService";
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
    queryKey: ["practitioner", practitionerId],
    queryFn: async () => {
      const profile = await userService.getPractitionerProfile(practitionerId!);
      const user = await userService.getUser(profile.user_id);
      return {
        name: user.name as string,
        specialization: (profile.specialization ?? "Practitioner") as string,
        image: null as string | null,
      };
    },
    enabled: !!practitionerId,
  });

  const practitioner = practitionerData ?? { name: "—", specialization: "—", image: null };

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
