// hooks/useProgress.ts
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { sessionService } from "@/services/sessionService";

// ─── Benchmarks ──────────────────────────────────────────────────────────────
// Edit these values to update benchmark comparisons across the progress page.

/** Normal full flexion reference angle in degrees (healthy adult ~135°) */
const BENCHMARK_FULL_FLEXION_DEG = 135;

/** Elderly population mean knee angle benchmark in degrees */
const BENCHMARK_ELDERLY_MEAN_DEG = 72;

/** The benchmark used for the Angle Benchmark Gap metric card */
const BENCHMARK_ANGLE_GAP_DEG = BENCHMARK_ELDERLY_MEAN_DEG;

/** The benchmark used for the Knee Angle bar in the comparison chart */
const BENCHMARK_CHART_ANGLE_DEG = BENCHMARK_ELDERLY_MEAN_DEG;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Prediction {
  frame_index: number;
  predicted_angle: number;
}

interface Session {
  id: number;
  created_at: string;
  notes?: string;
  status?: string;
}

interface Insight {
  session_id: number;
  insight_text: string;
  model: string;
  created_at: string;
}

type InsightStatus = "improving" | "stable" | "declining";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derives an InsightStatus from the insight text since the backend
 * doesn't return a structured status field — only free-form text.
 */
function deriveInsightStatus(text: string): InsightStatus {
  const lower = text.toLowerCase();
  if (lower.includes("improv") || lower.includes("better") || lower.includes("increased")) {
    return "improving";
  }
  if (lower.includes("declin") || lower.includes("worse") || lower.includes("decreased") || lower.includes("reduc")) {
    return "declining";
  }
  return "stable";
}

/** Computes the mean of an array of numbers. */
function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Formats an ISO date string to a readable label e.g. "Feb 28, 2026" */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProgress() {
  const { userProfile } = useUser();

  // ── State ──
  const [latestSession, setLatestSession] = useState<Session | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [earliestDate, setEarliestDate] = useState<string | null>(null);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const [errorSessions, setErrorSessions] = useState<string | null>(null);
  const [errorPredictions, setErrorPredictions] = useState<string | null>(null);
  const [errorInsight, setErrorInsight] = useState<string | null>(null);

  // ── Resolve patient ID ──
  // PatientProfile is fetched via getPatientProfile(user_id), so the profile
  // object's own id field is the patient profile id used by session routes.
  const patientId: number | null = useMemo(() => {
    if (!userProfile || userProfile.role !== "patient") return null;
    const p = userProfile.profile as any;
    return p?.id ?? p?.patient_id ?? null;
  }, [userProfile]);

  // ── Step 1: Fetch all sessions, pick latest ──
  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;
    setLoadingSessions(true);
    setErrorSessions(null);

    (async () => {
      try {
        const sessions: Session[] = await sessionService.getPatientSessions(patientId);

        if (cancelled) return;

        if (!sessions.length) {
          setLoadingSessions(false);
          return;
        }

        // Sort by created_at descending → latest first
        const sorted = [...sessions].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setLatestSession(sorted[0]);
        setEarliestDate(sorted[sorted.length - 1].created_at);
      } catch (err: any) {
        if (!cancelled) setErrorSessions(err?.message ?? "Failed to load sessions.");
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();

    return () => { cancelled = true; };
  }, [patientId]);

  // ── Step 2: Fetch predictions for the latest session ──
  useEffect(() => {
    if (!latestSession) return;

    let cancelled = false;
    setLoadingPredictions(true);
    setErrorPredictions(null);

    (async () => {
      try {
        const result = await sessionService.getPredictions(latestSession.id);

        if (cancelled) return;

        // Backend can return two shapes:
        // A) Array of { frame_index, predicted_angle }  ← SQL fallback
        // B) { session_id, source, file_name, status }  ← cloud reference → fetch JSON via endpoint
        if (Array.isArray(result)) {
          setPredictions(result);
        } else if (result?.file_name) {
          const json: Prediction[] = await sessionService.getAnalysisFile(result.file_name);
          if (!cancelled) setPredictions(json);
        } else {
          console.warn("Unexpected predictions response shape:", result);
          setPredictions([]);
        }
      } catch (err: any) {
        if (!cancelled) setErrorPredictions(err?.message ?? "Failed to load predictions.");
      } finally {
        if (!cancelled) setLoadingPredictions(false);
      }
    })();

    return () => { cancelled = true; };
  }, [latestSession]);

  // ── Step 3: Fetch insight for the latest session ──
  useEffect(() => {
    if (!latestSession) return;

    let cancelled = false;
    setLoadingInsight(true);
    setErrorInsight(null);

    (async () => {
      try {
        const result = await sessionService.getInsight(latestSession.id);
        if (!cancelled) setInsight(result);
      } catch (err: any) {
        // 404 = no insight yet, not an error worth surfacing to the user
        if (err?.response?.status !== 404 && !cancelled) {
          setErrorInsight(err?.message ?? "Failed to load insight.");
        }
      } finally {
        if (!cancelled) setLoadingInsight(false);
      }
    })();

    return () => { cancelled = true; };
  }, [latestSession]);

  // ─── Derived values ───────────────────────────────────────────────────────

  /** Average predicted knee angle across all frames, rounded */
  const avgAngle = useMemo(() => {
    if (!predictions.length) return null;
    return Math.round(mean(predictions.map((p) => p.predicted_angle)));
  }, [predictions]);

  /** Range of Motion: max angle − min angle across all frames, rounded */
  const rom = useMemo(() => {
    if (!predictions.length) return null;
    const angles = predictions.map((p) => p.predicted_angle);
    return Math.round(Math.max(...angles) - Math.min(...angles));
  }, [predictions]);

  /** Status badge derived from insight free-form text */
  const insightStatus = useMemo<InsightStatus>(() => {
    if (!insight) return "stable";
    return deriveInsightStatus(insight.insight_text);
  }, [insight]);

  // ─── Assembled return values ──────────────────────────────────────────────

  // angleBenchmarkGap: difference between patient's avg angle and the defined benchmark
  const metrics = useMemo(() => [
    { type: "rehabConsistency",  value: "85%" },
    { type: "angleBenchmarkGap", value: avgAngle != null ? `${Math.abs(avgAngle - BENCHMARK_ANGLE_GAP_DEG)}°` : "—" },
    { type: "zoneBalanceScore",  value: rom != null ? `${rom}°` : "—" },
  ], [avgAngle, rom]);

  const sessionData = useMemo(() => ({
    date: latestSession ? formatDate(latestSession.created_at) : "—",

    // Zone percentages & video stay mock until backend provides them
    video: {
      videoSrc: "/assets/kneesense_mag_corrected_web.mp4",
      medialPct: "41.7%",
      centralPct: "33.4%",
      lateralPct: "24.9%",
    },

    stats: [
      {
        label: "Knee Angle MEan",
        value: avgAngle != null ? `${avgAngle}°` : "—",
        benchmark: `±5° of ${BENCHMARK_CHART_ANGLE_DEG}° elderly avg.`,
      },
      {
        label: "Force Estimate",
        value: "--",
        benchmark: "-- N within normal range",
      },
    ],

    // Knee Angle bar uses real avgAngle and the defined benchmark; rest mock
    benchmarkData: [
      { label: "Force",      you: 2,             benchmark: 3  },
      { label: "Knee Angle", you: avgAngle ?? BENCHMARK_CHART_ANGLE_DEG, benchmark: BENCHMARK_CHART_ANGLE_DEG },
      { label: "Central",    you: 43,             benchmark: 40 },
      { label: "Medial",     you: 33,             benchmark: 32 },
      { label: "Lateral",    you: 19,             benchmark: 24 },
    ],

    // Mock until backend has force/smoothness data
    smoothnessData: [
      { t: 0, value: 0.10 },
      { t: 1, value: 0.46 },
      { t: 2, value: 0.74 },
      { t: 3, value: 0.79 },
      { t: 4, value: 0.85 },
      { t: 5, value: 0.56 },
      { t: 6, value: 0.42 },
      { t: 7, value: 0.46 },
      { t: 8, value: 0.77 },
      { t: 9, value: 0.25 },
    ],
  }), [latestSession, avgAngle]);

  const insights = useMemo(() => ({
    status: insightStatus,
    summary: insight?.insight_text
      ?? "No insight available yet. Run an analysis to generate one.",
  }), [insight, insightStatus]);

  const pageMeta = useMemo(() => ({
    since: earliestDate ? formatDate(earliestDate) : "—",
    nextSession: "Mar 21, 2026", // not provided by backend yet
  }), [earliestDate]);

  // ─── Aggregated loading / error state ────────────────────────────────────

  const isLoading = loadingSessions || loadingPredictions || loadingInsight;
  const errors = [errorSessions, errorPredictions, errorInsight].filter(Boolean) as string[];

  return {
    metrics,
    sessionData,
    insights,
    pageMeta,
    isLoading,
    errors,
    // Raw data exposed for future use (e.g. a per-frame angle chart)
    latestSession,
    predictions,
    insight,
  };
}