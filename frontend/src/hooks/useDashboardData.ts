"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { userService } from "@/services/userService";
import { PatientProfile } from "@/types/patient";

export function useDashboardData() {
  const { userProfile } = useUser();

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

  const practitioner = practitionerData ?? {
    name: "—",
    specialization: "—",
    image: null,
  };

  return {
    patient: {
      name: patientProfile?.name ?? "—",
      lastSession: "-",
    },
    practitioner,
    tasks: {
      session: {
        title: "Mar 21, 2026",
        subtitle: "TODAY",
      },
      rehab: {
        title: "4-step Anti-frailty",
        subtitle: "Complete your daily exercises",
      },
    },
    isLoading: practitionerLoading && !!practitionerId,
  };
}
