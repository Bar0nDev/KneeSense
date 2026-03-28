"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { sessionService } from "@/services/sessionService";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Prediction {
  frame_index: number;
  predicted_angle: number;
}

export interface SessionRecord {
  id: number;
  created_at: string;
  notes?: string;
  status?: string;
}

export interface Insight {
  session_id: number;
  insight_text: string;
  model: string;
  created_at: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const sessionKeys = {
  all: (patientId: number) => ["sessions", patientId] as const,
  predictions: (sessionId: number) => ["predictions", sessionId] as const,
  insight: (sessionId: number) => ["insight", sessionId] as const,
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export function useSessionData() {
  const { userProfile } = useUser();
  const queryClient = useQueryClient();

  const patientId: number | null = useMemo(() => {
    if (!userProfile || userProfile.role !== "patient") return null;
    const p = userProfile.profile as any;
    return p?.id ?? p?.patient_id ?? null;
  }, [userProfile]);

  // ── Step 1: Fetch all sessions ──
  const {
    data: allSessions,
    isLoading: loadingSessions,
    error: errorSessions,
  } = useQuery({
    queryKey: sessionKeys.all(patientId!),
    queryFn: async () => {
      const sessions: SessionRecord[] = await sessionService.getPatientSessions(patientId!);
      return [...sessions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!patientId,
  });

  const latestSession = allSessions?.[0] ?? null;
  const earliestDate = allSessions?.[allSessions.length - 1]?.created_at ?? null;

  // ── Step 2: Fetch predictions for latest session ──
  const {
    data: predictions,
    isLoading: loadingPredictions,
    error: errorPredictions,
  } = useQuery({
    queryKey: sessionKeys.predictions(latestSession?.id!),
    queryFn: async () => {
      const result = await sessionService.getPredictions(latestSession!.id);
      if (Array.isArray(result)) return result as Prediction[];
      if (result?.file_name) {
        return await sessionService.getAnalysisFile(result.file_name) as Prediction[];
      }
      return [] as Prediction[];
    },
    enabled: !!latestSession,
  });

  // ── Step 3: Fetch insight for latest session ──
  const {
    data: insight,
    isLoading: loadingInsight,
  } = useQuery({
    queryKey: sessionKeys.insight(latestSession?.id!),
    queryFn: () => sessionService.getInsight(latestSession!.id) as Promise<Insight>,
    enabled: !!latestSession,
    retry: (failureCount, error: any) => error?.response?.status !== 404 && failureCount < 1,
  });

  // ── refresh: invalidate all session-related queries ──
  const refresh = useCallback(() => {
    if (!patientId) return;
    queryClient.invalidateQueries({ queryKey: ["sessions", patientId] });
    if (latestSession) {
      queryClient.invalidateQueries({ queryKey: ["predictions", latestSession.id] });
      queryClient.invalidateQueries({ queryKey: ["insight", latestSession.id] });
    }
  }, [queryClient, patientId, latestSession]);

  const isLoading = loadingSessions || loadingPredictions || loadingInsight;
  const errors = [
    errorSessions?.message,
    errorPredictions?.message,
  ].filter(Boolean) as string[];

  return {
    latestSession,
    allSessions: allSessions ?? [],
    predictions: predictions ?? [],
    insight: insight ?? null,
    earliestDate,
    isLoading,
    errors,
    refresh,
  };
}