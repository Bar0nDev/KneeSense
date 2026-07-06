"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { adminService } from "@/services/adminService";
import { AdminSession } from "@/types/admin";

export function useAdminSessions(patientId?: string) {
  const query = useQuery<AdminSession[]>({
    queryKey: queryKeys.adminSessions(patientId),
    queryFn: () => adminService.getSessions(patientId),
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useAdminSession(id: string | null) {
  return useQuery<AdminSession>({
    queryKey: queryKeys.adminSession(id ?? ""),
    queryFn: () => adminService.getSession(id!),
    enabled: !!id,
  });
}
