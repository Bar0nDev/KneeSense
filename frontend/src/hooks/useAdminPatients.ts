"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { adminService } from "@/services/adminService";
import { AdminPatient, AdminPatientDetail, AdminPatientUpdate } from "@/types/admin";

// Invalidate everything a patient write can affect: the patient list/detail, plus
// practitioner list/detail (patient_count and assigned-patient lists shift on assign).
function useInvalidatePatientWrites() {
  const queryClient = useQueryClient();
  return (patientId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPatients() });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPatient(patientId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPractitioners() });
    queryClient.invalidateQueries({ queryKey: ["admin", "practitioner"] });
  };
}

export function useAdminPatients() {
  const query = useQuery<AdminPatient[]>({
    queryKey: queryKeys.adminPatients(),
    queryFn: () => adminService.getPatients(),
  });

  const invalidate = useInvalidatePatientWrites();

  const update = useMutation({
    // userId (optional) keeps the user doc's display name in sync with the patient doc.
    mutationFn: async ({
      id,
      payload,
      userId,
    }: {
      id: string;
      payload: AdminPatientUpdate;
      userId?: string | null;
    }) => {
      const calls: Promise<void>[] = [adminService.updatePatient(id, payload)];
      if (payload.name !== undefined && userId) {
        calls.push(adminService.updateUserName(userId, payload.name));
      }
      await Promise.all(calls);
    },
    onSettled: (_d, _e, vars) => invalidate(vars.id),
  });

  const assign = useMutation({
    mutationFn: ({ id, practitionerId }: { id: string; practitionerId: string | null }) =>
      adminService.assignPatientPractitioner(id, practitionerId),
    onSettled: (_d, _e, vars) => invalidate(vars.id),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => adminService.deactivatePatient(id),
    onSettled: (_d, _e, id) => invalidate(id),
  });

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    update,
    assign,
    deactivate,
  };
}

export function useAdminPatient(id: string | null) {
  return useQuery<AdminPatientDetail>({
    queryKey: queryKeys.adminPatient(id ?? ""),
    queryFn: () => adminService.getPatient(id!),
    enabled: !!id,
  });
}
