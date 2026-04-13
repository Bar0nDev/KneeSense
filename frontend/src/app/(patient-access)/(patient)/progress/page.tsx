"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";

import MetricCard from "@/components/patient/progress/MetricCard";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import SessionStatCard from "@/components/patient/progress/SessionStatCard";
import AIInsightCard from "@/components/patient/progress/AiInsightCard";
// import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";

import { useProgress, formatSessionLabel } from "@/hooks/useProgress";

export default function ProgressPage() {
  const router = useRouter();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const { metrics, sessionData, insights, pageMeta, isLoading, errors, latestSession, allSessions } =
    useProgress(selectedSessionId);

  if (!isLoading && !latestSession) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-6 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Start your first session today</h2>
        <PrimaryButton color="#27AE60" onClick={() => router.push("/recording")}>
          Begin Session
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="My Progress"
        subtitle={`Your Start Date: ${pageMeta.since}`}
        action={
          <PrimaryButton color="#27AE60" onClick={() => router.push("/recording")}>
            Begin Session
          </PrimaryButton>
        }
      />

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 space-y-1">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      {/* Top Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.type}
            type={metric.type as any}
            value={isLoading ? "…" : metric.value}
          />
        ))}
      </div>

      {/* Main Dashboard */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        <div className="flex flex-col gap-4 flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Session Metrics</h2>

            {/* Session selector — defaults to most recent (value="") */}
            {isLoading ? (
              <span className="text-sm font-medium text-[#455858] bg-white border border-gray-200 px-3 py-0.5 rounded-full shadow-sm">
                Loading…
              </span>
            ) : (
              <select
                value={selectedSessionId ?? ""}
                onChange={(e) =>
                  setSelectedSessionId(e.target.value === "" ? null : Number(e.target.value))
                }
                className="text-sm font-medium text-[#455858] bg-white border border-gray-200 px-3 py-0.5 rounded-full shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#12606A]/30 transition-shadow"
              >
                {allSessions.map((s) => (
                  <option key={s.id} value={Number(s.id)}>
                    {formatSessionLabel(s.id, s.created_at)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="w-full lg:w-90 lg:shrink-0 h-full">
              <ZoneMap {...sessionData.video} />
            </div>
            <div className="flex flex-row lg:flex-col gap-3 flex-1 min-w-0">
              {sessionData.stats.map((stat) => (
                <SessionStatCard
                  key={stat.label}
                  label={stat.label}
                  value={isLoading ? "…" : stat.value}
                  benchmarkValue={stat.benchmark}
                />
              ))}
            </div>
          </div>

          <BenchmarkComparisonCard data={sessionData.benchmarkData} className="flex-1" />
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-96 lg:shrink-0">
          <AIInsightCard
            status={isLoading ? "stable" : insights.status}
            summary={isLoading ? "Loading insight…" : insights.summary}
            className="flex-1"
          />
          {/* <MuscleSmoothnessCard
            data={sessionData.smoothnessData}
            benchmark={0.6}
          /> */}
        </div>

      </div>
    </div>
  );
}
