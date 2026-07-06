"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { adminService } from "@/services/adminService";
import { AdminPatient, AdminPatientDetail } from "@/types/admin";

export function useAdminPatients() {
  const query = useQuery<AdminPatient[]>({
    queryKey: queryKeys.adminPatients(),
    queryFn: () => adminService.getPatients(),
  });

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useAdminPatient(id: string | null) {
  return useQuery<AdminPatientDetail>({
    queryKey: queryKeys.adminPatient(id ?? ""),
    queryFn: () => adminService.getPatient(id!),
    enabled: !!id,
  });
}
