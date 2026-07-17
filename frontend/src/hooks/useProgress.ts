// hooks/useProgress.ts
import { useMemo } from "react";
import { useSessionData } from "@/hooks/useSessionQueries";
import { useVideoUrl } from "@/hooks/useVideoUrl";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type InsightStatus = "improving" | "stable" | "declining";

function formatDominantZone(zone?: string): string {
  const map: Record<string, string> = {
    zone1: "Medial",
    zone2: "Central",
    zone3: "Lateral",
  };
  return zone ? (map[zone] ?? zone) : "—";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatSessionLabel(id: string, created_at: string): string {
  return `${formatDate(created_at)} (#${id.slice(-6)})`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProgress(selectedSessionId?: string | null) {
  const { latestSession, activeSession, allSessions, predictions, insight, earliestDate, isLoading, errors } =
    useSessionData(selectedSessionId);

  // Signed GCS URL for the active session's video (bypasses the ngrok tunnel).
  const { videoUrl } = useVideoUrl(activeSession?.id);

  const insightStatus = useMemo<InsightStatus>(() => "stable", []);

  const metrics = useMemo(() => [
    { type: "metric1", value: activeSession?.avg_angle != null ? `${activeSession.avg_angle.toFixed(2)}°` : "—" },
    { type: "metric2", value: formatDominantZone(activeSession?.dominant_zone) },
    { type: "metric3", value: activeSession?.rom_arc != null ? `${activeSession.rom_arc.toFixed(2)}°` : "—" },
  ], [activeSession]);

  const sessionData = useMemo(() => ({
    date: activeSession ? formatDate(activeSession.created_at) : "—",
    video: {
      videoSrc: videoUrl,
      avgAngle: activeSession?.avg_angle != null ? `${Math.round(activeSession.avg_angle)}°` : "—",
      medialPct: activeSession?.zone1_avg != null ? `${activeSession.zone1_avg.toFixed(2)}%` : "—",
      centralPct: activeSession?.zone2_avg != null ? `${activeSession.zone2_avg.toFixed(2)}%` : "—",
      lateralPct: activeSession?.zone3_avg != null ? `${activeSession.zone3_avg.toFixed(2)}%` : "—",
    },
    stats: [
      {
        label: "Max Angle",
        value: activeSession?.max_angle != null ? `${activeSession.max_angle.toFixed(2)}°` : "—",
        benchmark: "max flexion recorded",
      },
      {
        label: "Min Angle",
        value: activeSession?.min_angle != null ? `${activeSession.min_angle.toFixed(2)}°` : "—",
        benchmark: "min flexion recorded",
      },
    ],
    benchmarkData: [
      { label: "Knee Angle", you: activeSession?.avg_angle  ?? 1, benchmark: 131 },
      { label: "Central",    you: activeSession?.zone2_avg  ?? 1, benchmark: 27 },
      { label: "Medial",     you: activeSession?.zone1_avg  ?? 1, benchmark: 23 },
      { label: "Lateral",    you: activeSession?.zone3_avg  ?? 1, benchmark: 22 },
    ],
    smoothnessData: [
      { t: 0, value: 0.10 }, { t: 1, value: 0.46 }, { t: 2, value: 0.74 },
      { t: 3, value: 0.79 }, { t: 4, value: 0.85 }, { t: 5, value: 0.56 },
      { t: 6, value: 0.42 }, { t: 7, value: 0.46 }, { t: 8, value: 0.77 },
      { t: 9, value: 0.25 },
    ],
  }), [activeSession, videoUrl]);

  const insights = useMemo(() => ({
    status: insightStatus,
    summary: insight?.summary_text ?? null,
    detail: insight?.insight_text ?? null,
  }), [insight, insightStatus]);

  const pageMeta = useMemo(() => ({
    since: earliestDate ? formatDate(earliestDate) : "—",
    nextSession: "—",
  }), [earliestDate]);

  return {
    metrics,
    sessionData,
    insights,
    pageMeta,
    isLoading,
    errors,
    latestSession,
    activeSession,
    allSessions,
    predictions,
    insight,
  };
}
