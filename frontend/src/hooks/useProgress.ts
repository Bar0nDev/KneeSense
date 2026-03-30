// hooks/useProgress.ts
import { useMemo } from "react";
import { useSessionData } from "@/hooks/useSessionQueries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type InsightStatus = "improving" | "stable" | "declining";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProgress() {
  const { latestSession, predictions, insight, earliestDate, isLoading, errors } = useSessionData();

  const insightStatus = useMemo<InsightStatus>(() => "stable", []);

  const metrics = useMemo(() => [
    { type: "metric1",  value: "—" },
    { type: "metric2", value: "—" },
    { type: "metric3",  value: latestSession?.rom_arc != null ? `${Math.round(latestSession.rom_arc)}°` : "—" },
  ], [latestSession]);

  const sessionData = useMemo(() => ({
    date: latestSession ? formatDate(latestSession.created_at) : "—",
    video: {
      videoSrc: "/assets/kneesense_mag_corrected_web.mp4",
      avgAngle: latestSession?.avg_angle != null ? `${Math.round(latestSession.avg_angle)}°` : "—",
      medialPct: "—",
      centralPct: "—",
      lateralPct: "—",
    },
    stats: [
      {
        label: "Max Angle",
        value: latestSession?.max_angle != null ? `${Math.round(latestSession.max_angle)}°` : "—",
        benchmark: "max flexion recorded",
      },
      {
        label: "Min Angle",
        value: latestSession?.min_angle != null ? `${Math.round(latestSession.min_angle)}°` : "—",
        benchmark: "min flexion recorded",
      },
    ],
    benchmarkData: [
      { label: "Force",      you: 2,      benchmark: 3  },
      { label: "Knee Angle", you: 60,     benchmark: 50 },
      { label: "Central",    you: 43,     benchmark: 40 },
      { label: "Medial",     you: 33,     benchmark: 32 },
      { label: "Lateral",    you: 19,     benchmark: 24 },
    ],
    smoothnessData: [
      { t: 0, value: 0.10 }, { t: 1, value: 0.46 }, { t: 2, value: 0.74 },
      { t: 3, value: 0.79 }, { t: 4, value: 0.85 }, { t: 5, value: 0.56 },
      { t: 6, value: 0.42 }, { t: 7, value: 0.46 }, { t: 8, value: 0.77 },
      { t: 9, value: 0.25 },
    ],
  }), [latestSession]);

  const insights = useMemo(() => ({
    status: insightStatus,
    summary: insight?.insight_text ?? "No insight available yet. Run an analysis to generate one.",
  }), [insight, insightStatus]);

  const pageMeta = useMemo(() => ({
    since: earliestDate ? formatDate(earliestDate) : "—",
    nextSession: "—",
  }), [earliestDate]);

  return { metrics, sessionData, insights, pageMeta, isLoading, errors, latestSession, predictions, insight };
}