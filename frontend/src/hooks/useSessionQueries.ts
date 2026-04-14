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
  min_angle?: number;
  max_angle?: number;
  avg_angle?: number;
  rom_arc?: number;
  zone1_avg?: number;
  zone2_avg?: number;
  zone3_avg?: number;
  dominant_zone?: string;
  video_path?: string;
  video_url?: string;
}

export interface Insight {
  session_id: number;
  insight_text: string;
  summary_text?: string;
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

export function useSessionData(selectedSessionId?: number | null) {
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      return [...sessions]
        // id is the DB primary key — auto-incremented, so highest id = most recent session.
        // Sorting by id avoids any reliance on created_at being accurate or unique.
        // Number() handles the Firestore path where doc.id comes back as a string.
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((s) => {
          const filename = s.video_path?.split(/[\\/]/).pop();
          const video_url = filename ? `${apiBase}/data/videos/${filename}` : undefined;
          console.log("[useSessionQueries] video_path:", s.video_path, "→ video_url:", video_url);
          return { ...s, video_url };
        });
    },
    enabled: !!patientId,
    // Never serve the sessions list from cache — always refetch on mount so that a newly
    // recorded session is visible immediately regardless of when the list was last fetched
    // or what the global staleTime is.
    staleTime: 0,
  });

  const latestSession = allSessions?.[0] ?? null;
  const earliestDate = allSessions?.[allSessions.length - 1]?.created_at ?? null;

  // When the user picks a session from the dropdown we use that; otherwise default to latest.
  // Number() normalises Firestore string IDs so the find works regardless of API path.
  const activeSession = useMemo(() => {
    if (selectedSessionId != null && allSessions) {
      return allSessions.find((s) => Number(s.id) === selectedSessionId) ?? latestSession;
    }
    return latestSession;
  }, [selectedSessionId, allSessions, latestSession]);

  // ── Step 2: Fetch predictions for the active session ──
  const {
    data: predictions,
    isLoading: loadingPredictions,
  } = useQuery({
    queryKey: sessionKeys.predictions(activeSession?.id!),
    queryFn: async () => {
      try {
        const result = await sessionService.getPredictions(activeSession!.id);
        if (Array.isArray(result)) return result as Prediction[];
        if (result?.file_name) {
          return await sessionService.getAnalysisFile(result.file_name) as Prediction[];
        }
        return [] as Prediction[];
      } catch (e: any) {
        if (e?.response?.status === 404) return [] as Prediction[];
        throw e;
      }
    },
    enabled: !!activeSession,
    retry: (failureCount, error: any) => error?.response?.status !== 404 && failureCount < 1,
  });

  // ── Step 3: Fetch insight for the active session ──
  const {
    data: insight,
    isLoading: loadingInsight,
  } = useQuery({
    queryKey: sessionKeys.insight(activeSession?.id!),
    queryFn: () => sessionService.getInsight(activeSession!.id) as Promise<Insight>,
    enabled: !!activeSession,
    retry: (failureCount, error: any) => error?.response?.status !== 404 && failureCount < 1,
  });

  // ── refresh: invalidate all session-related queries ──
  const refresh = useCallback(() => {
    if (!patientId) return;
    queryClient.invalidateQueries({ queryKey: ["sessions", patientId], refetchType: "all" });
    if (latestSession) {
      queryClient.invalidateQueries({ queryKey: ["predictions", latestSession.id], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["insight", latestSession.id], refetchType: "all" });
    }
  }, [queryClient, patientId, latestSession]);

  const isLoading = loadingSessions || loadingPredictions || loadingInsight;
  const errors = [
    (errorSessions as any)?.response?.status !== 404 ? errorSessions?.message : null,
  ].filter(Boolean) as string[];

  return {
    latestSession,
    activeSession,
    allSessions: allSessions ?? [],
    predictions: predictions ?? [],
    insight: insight ?? null,
    earliestDate,
    isLoading,
    errors,
    refresh,
  };
}