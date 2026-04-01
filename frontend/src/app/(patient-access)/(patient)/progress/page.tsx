"use client";

import { useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";

import MetricCard from "@/components/patient/progress/MetricCard";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import SessionStatCard from "@/components/patient/progress/SessionStatCard";
import AIInsightCard from "@/components/patient/progress/AiInsightCard";
// import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";

import { useProgress } from "@/hooks/useProgress";

export default function ProgressPage() {
  const router = useRouter();
  const { metrics, sessionData, insights, pageMeta, isLoading, errors } = useProgress();

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="My Progress"
        subtitle={`Since ${pageMeta.since} · Next Session: ${pageMeta.nextSession}`}
        action={
          <PrimaryButton color="#27AE60" onClick={() => router.push("/recording")}>
            Begin Session
          </PrimaryButton>
        }
      />

      {/* Non-fatal API errors */}
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

        {/* Left Column — overflow-hidden added */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Session Metrics</h2>
            <span className="text-sm font-medium text-[#455858] bg-white border border-gray-200 px-3 py-0.5 rounded-full shadow-sm">
              {isLoading ? "Loading…" : sessionData.date}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="w-full lg:w-90 lg:shrink-0">
              <ZoneMap {...sessionData.video} />
            </div>
            {/* min-w-0 added to stat cards container */}
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

          <BenchmarkComparisonCard data={sessionData.benchmarkData} />
        </div>

        {/* Right Column — lg:shrink-0 added */}
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