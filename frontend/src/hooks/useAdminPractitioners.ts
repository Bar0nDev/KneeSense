"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { adminService } from "@/services/adminService";
import {
  AdminPractitioner,
  AdminPractitionerDetail,
  PractitionerStatus,
} from "@/types/admin";

// List of all practitioners, plus approve/reject mutations that optimistically
// update the cached status so the UI reflects the change immediately.
export function useAdminPractitioners() {
  const queryClient = useQueryClient();

  const query = useQuery<AdminPractitioner[]>({
    queryKey: queryKeys.adminPractitioners(),
    queryFn: () => adminService.getPractitioners(),
  });

  function optimisticStatus(id: string, status: PractitionerStatus) {
    // List cache
    queryClient.setQueryData<AdminPractitioner[]>(
      queryKeys.adminPractitioners(),
      (prev) => prev?.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    // Detail cache (if loaded)
    queryClient.setQueryData<AdminPractitionerDetail>(
      queryKeys.adminPractitioner(id),
      (prev) => (prev ? { ...prev, status } : prev),
    );
  }

  const approve = useMutation({
    mutationFn: (id: string) => adminService.approvePractitioner(id),
    onMutate: (id) => optimisticStatus(id, "approved"),
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPractitioners() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPractitioner(id) });
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) => adminService.rejectPractitioner(id),
    onMutate: (id) => optimisticStatus(id, "rejected"),
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPractitioners() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPractitioner(id) });
    },
  });

  return {
    practitioners: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    approve,
    reject,
  };
}

export function useAdminPractitioner(id: string | null) {
  return useQuery<AdminPractitionerDetail>({
    queryKey: queryKeys.adminPractitioner(id ?? ""),
    queryFn: () => adminService.getPractitioner(id!),
    enabled: !!id,
  });
}
