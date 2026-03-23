// hooks/use-progress.ts
import { useMemo } from "react";

export function useProgress() {
  // 1. High-level Summary Metrics
  const metrics = useMemo(() => [
    { type: "rehabConsistency", value: "85%" },
    { type: "angleBenchmarkGap", value: "6°" },
    { type: "zoneBalanceScore", value: "13%" },
  ], []);

  // 2. The Active Session Data (Now including Chart Data)
  const sessionData = useMemo(() => ({
    date: "Feb 28, 2026",
    video: {
      videoSrc: "/assets/kneesense_mag_corrected_web.mp4",
      medialPct: "41.7%",
      centralPct: "33.4%",
      lateralPct: "24.9%",
    },
    stats: [
      { label: "Knee Angle", value: "67°", benchmark: "+-5° above elderly avg." },
      { label: "Force Estimate", value: "--", benchmark: "-- N within normal range" },
    ],
    // ADDED: This satisfies the 'benchmarkData' error
    benchmarkData: [
      { label: "Force", you: 2, benchmark: 3 },
      { label: "Knee Angle", you: 78, benchmark: 72 },
      { label: "Central", you: 43, benchmark: 40 },
      { label: "Medial", you: 33, benchmark: 32 },
      { label: "Lateral", you: 19, benchmark: 24 },
    ],
    // ADDED: This satisfies the 'smoothnessData' error
    smoothnessData: [
      { t: 0, value: 0.1 },
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
  }), []);

  // 3. AI Insights
  const insights = useMemo(() => ({
    status: "improving" as const,
    summary: "Your knee flexion angle has improved by 6° since your last session. Focus on the Lateral Zone during squats to improve balance score.",
  }), []);

  // 4. Page Metadata
  const pageMeta = useMemo(() => ({
    since: "Feb 28, 2026",
    nextSession: "Mar 21, 2026",
  }), []);

  return {
    metrics,
    sessionData,
    insights,
    pageMeta,
  };
}