"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
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

export interface SessionDataContextValue {
  // Raw data
  latestSession: SessionRecord | null;
  allSessions: SessionRecord[];
  predictions: Prediction[];
  insight: Insight | null;
  earliestDate: string | null;

  // State
  isLoading: boolean;
  errors: string[];

  // Trigger a full refetch (call after a new recording is submitted)
  refresh: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SessionDataContext = createContext<SessionDataContextValue | undefined>(undefined);

export function SessionDataProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useUser();

  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [latestSession, setLatestSession] = useState<SessionRecord | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [earliestDate, setEarliestDate] = useState<string | null>(null);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const [errorSessions, setErrorSessions] = useState<string | null>(null);
  const [errorPredictions, setErrorPredictions] = useState<string | null>(null);
  const [errorInsight, setErrorInsight] = useState<string | null>(null);

  // Track whether we've already fetched so we don't re-fetch on re-render
  const [fetched, setFetched] = useState(false);

  const patientId: number | null = useMemo(() => {
    if (!userProfile || userProfile.role !== "patient") return null;
    const p = userProfile.profile as any;
    return p?.id ?? p?.patient_id ?? null;
  }, [userProfile]);

  // ── Core fetch function ──
  const fetchAll = useCallback(async () => {
    if (!patientId) return;

    // Step 1: Sessions
    setLoadingSessions(true);
    setErrorSessions(null);
    let latest: SessionRecord | null = null;

    try {
      const sessions: SessionRecord[] = await sessionService.getPatientSessions(patientId);
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllSessions(sorted);
      setLatestSession(sorted[0] ?? null);
      setEarliestDate(sorted[sorted.length - 1]?.created_at ?? null);
      latest = sorted[0] ?? null;
    } catch (err: any) {
      setErrorSessions(err?.message ?? "Failed to load sessions.");
    } finally {
      setLoadingSessions(false);
    }

    if (!latest) return;

    // Step 2: Predictions
    setLoadingPredictions(true);
    setErrorPredictions(null);

    try {
      const result = await sessionService.getPredictions(latest.id);
      if (Array.isArray(result)) {
        setPredictions(result);
      } else if (result?.file_name) {
        const json: Prediction[] = await sessionService.getAnalysisFile(result.file_name);
        setPredictions(json);
      } else {
        setPredictions([]);
      }
    } catch (err: any) {
      setErrorPredictions(err?.message ?? "Failed to load predictions.");
    } finally {
      setLoadingPredictions(false);
    }

    // Step 3: Insight
    setLoadingInsight(true);
    setErrorInsight(null);

    try {
      const result = await sessionService.getInsight(latest.id);
      setInsight(result);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        setErrorInsight(err?.message ?? "Failed to load insight.");
      }
    } finally {
      setLoadingInsight(false);
    }

    setFetched(true);
  }, [patientId]);

  // ── Fetch once on mount (or when patientId becomes available) ──
  useEffect(() => {
    if (patientId && !fetched) {
      fetchAll();
    }
  }, [patientId, fetched, fetchAll]);

  // ── refresh() resets fetched flag and re-runs fetchAll ──
  const refresh = useCallback(() => {
    setFetched(false);
    setPredictions([]);
    setInsight(null);
    setLatestSession(null);
    setAllSessions([]);
    setEarliestDate(null);
  }, []);

  // Trigger fetchAll when fetched is reset to false
  useEffect(() => {
    if (patientId && !fetched) {
      fetchAll();
    }
  }, [fetched, patientId, fetchAll]);

  const isLoading = loadingSessions || loadingPredictions || loadingInsight;
  const errors = [errorSessions, errorPredictions, errorInsight].filter(Boolean) as string[];

  const value: SessionDataContextValue = {
    latestSession,
    allSessions,
    predictions,
    insight,
    earliestDate,
    isLoading,
    errors,
    refresh,
  };

  return (
    <SessionDataContext.Provider value={value}>
      {children}
    </SessionDataContext.Provider>
  );
}

export function useSessionData() {
  const ctx = useContext(SessionDataContext);
  if (!ctx) throw new Error("useSessionData must be used within a SessionDataProvider");
  return ctx;
}