// hooks/useProgress.ts
import { useMemo } from "react";
import { useSessionData } from "@/hooks/useSessionQueries";

// ─── Benchmarks ──────────────────────────────────────────────────────────────

/** Elderly population mean knee angle benchmark in degrees */
const BENCHMARK_ELDERLY_MEAN_DEG = 72;

const BENCHMARK_ANGLE_GAP_DEG = BENCHMARK_ELDERLY_MEAN_DEG;
const BENCHMARK_CHART_ANGLE_DEG = BENCHMARK_ELDERLY_MEAN_DEG;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type InsightStatus = "improving" | "stable" | "declining";

function deriveInsightStatus(text: string): InsightStatus {
  const lower = text.toLowerCase();
  if (lower.includes("improv") || lower.includes("better") || lower.includes("increased")) return "improving";
  if (lower.includes("declin") || lower.includes("worse") || lower.includes("decreased") || lower.includes("reduc")) return "declining";
  return "stable";
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

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

  const avgAngle = useMemo(() => {
    if (!predictions.length) return null;
    return Math.round(mean(predictions.map((p) => p.predicted_angle)));
  }, [predictions]);

  const rom = useMemo(() => {
    if (!predictions.length) return null;
    const angles = predictions.map((p) => p.predicted_angle);
    return Math.round(Math.max(...angles) - Math.min(...angles));
  }, [predictions]);

  const insightStatus = useMemo<InsightStatus>(() => {
    if (!insight) return "stable";
    return deriveInsightStatus(insight.insight_text);
  }, [insight]);

  const metrics = useMemo(() => [
    { type: "rehabConsistency",  value: "85%" },
    { type: "angleBenchmarkGap", value: avgAngle != null ? `${Math.abs(avgAngle - BENCHMARK_ANGLE_GAP_DEG)}°` : "—" },
    { type: "zoneBalanceScore",  value: rom != null ? `${rom}°` : "—" },
  ], [avgAngle, rom]);

  const sessionData = useMemo(() => ({
    date: latestSession ? formatDate(latestSession.created_at) : "—",
    video: {
      videoSrc: "/assets/kneesense_mag_corrected_web.mp4",
      medialPct: "41.7%",
      centralPct: "33.4%",
      lateralPct: "24.9%",
    },
    stats: [
      {
        label: "Knee Angle",
        value: avgAngle != null ? `${avgAngle}°` : "—",
        benchmark: `±5° of ${BENCHMARK_CHART_ANGLE_DEG}° elderly avg.`,
      },
      {
        label: "Force Estimate",
        value: "--",
        benchmark: "-- N within normal range",
      },
    ],
    benchmarkData: [
      { label: "Force",      you: 2,                                     benchmark: 3  },
      { label: "Knee Angle", you: avgAngle ?? BENCHMARK_CHART_ANGLE_DEG, benchmark: BENCHMARK_CHART_ANGLE_DEG },
      { label: "Central",    you: 43,                                    benchmark: 40 },
      { label: "Medial",     you: 33,                                    benchmark: 32 },
      { label: "Lateral",    you: 19,                                    benchmark: 24 },
    ],
    smoothnessData: [
      { t: 0, value: 0.10 }, { t: 1, value: 0.46 }, { t: 2, value: 0.74 },
      { t: 3, value: 0.79 }, { t: 4, value: 0.85 }, { t: 5, value: 0.56 },
      { t: 6, value: 0.42 }, { t: 7, value: 0.46 }, { t: 8, value: 0.77 },
      { t: 9, value: 0.25 },
    ],
  }), [latestSession, avgAngle]);

  const insights = useMemo(() => ({
    status: insightStatus,
    summary: insight?.insight_text ?? "No insight available yet. Run an analysis to generate one.",
  }), [insight, insightStatus]);

  const pageMeta = useMemo(() => ({
    since: earliestDate ? formatDate(earliestDate) : "—",
    nextSession: "Mar 21, 2026",
  }), [earliestDate]);

  return { metrics, sessionData, insights, pageMeta, isLoading, errors, latestSession, predictions, insight };
}