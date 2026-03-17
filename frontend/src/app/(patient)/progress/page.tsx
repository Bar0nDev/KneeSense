"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import MetricCard from "@/components/patient/progress/MetricCard";
import Card from "@/components/ui/Card";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import SessionStatCard from "@/components/patient/progress/SessionStatCard";
import AIInsightCard from "@/components/patient/progress/AiInsightCard";
import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";

const mockInsight = {
  status: "improving" as const,
  summary: "Your knee flexion angle has improved by 6° since your last session...",
};

const mockSessionStats = {
  kneeAngle: { value: "67°", benchmarkValue: "+-5° above elderly avg." },
  forceEstimate: { value: "--", benchmarkValue: "-- N within normal range" },
};

const mockSession = {
  videoSrc: "/assets/kneesense_mag_corrected_web.mp4",
  medialPct: "41.7%",
  centralPct: "33.4%",
  lateralPct: "24.9%",
};

const mockProgress = {
  since: "Feb 28, 2026",
  nextSession: "Mar 21, 2026",
};

const mockMetrics = {
  rehabConsistency: "85%",
  angleBenchmarkGap: "+6°",
  zoneBalanceScore: "↓13%",
};

export default function ProgressPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">

      {/* Header */}
      <PageHeader
        title="My Progress"
        subtitle={`Since ${mockProgress.since} · Next Session: ${mockProgress.nextSession}`}
        action={
          <Button
            bgColor="bg-[#27AE60]"
            hoverColor="hover:bg-[#219150]"
            onClick={() => router.push("/recording")}
          >
            Begin Session
          </Button>
        }
      />

      {/* Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard value={mockMetrics.rehabConsistency} label="Rehab Consistency" valueColor="border-t-[#12606A]"/>
        <MetricCard value={mockMetrics.angleBenchmarkGap} label="Angle Benchmark Gap"  valueColor="border-t-[#12606A]" />
        <MetricCard value={mockMetrics.zoneBalanceScore} label="Zone Balance Score"  valueColor="border-t-[#12606A]" />
      </div>

      {/* Main Content Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        {/* Left Column */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Session Metrics Label */}
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-gray-900">Session Metrics</p>
            <span className="text-sm text-[#455858] bg-[#FDFDFD] border border-1-[#455858] px-3 py-0.5 rounded-full">
              Feb 28, 2026
            </span>
          </div>

          {/* ZoneMap + Stat Cards */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">

            <div className="w-full lg:w-90 lg:shrink-0">
              <ZoneMap {...mockSession} />
            </div>

            <div className="flex flex-row lg:flex-col gap-3 flex-1 lg:h-auto">
              <Card className="flex-1 flex flex-col justify-center">
                <SessionStatCard
                  label="Knee Angle"
                  value={mockSessionStats.kneeAngle.value}
                  benchmarkLabel="vs Benchmark"
                  benchmarkValue={mockSessionStats.kneeAngle.benchmarkValue}
                />
              </Card>
              <Card className="flex-1 flex flex-col justify-center">
                <SessionStatCard
                  label="Force Estimate"
                  value={mockSessionStats.forceEstimate.value}
                  benchmarkLabel="vs Benchmark"
                  benchmarkValue={mockSessionStats.forceEstimate.benchmarkValue}
                />
              </Card>
            </div>

          </div>

          <Card className="w-full">
            <BenchmarkComparisonCard />
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 w-full lg:w-96 shrink-0">
          <Card className="min-h-38">
            <AIInsightCard status={mockInsight.status} summary={mockInsight.summary} />
          </Card>
          <Card className="flex-1">
            <MuscleSmoothnessCard />
          </Card>
        </div>

      </div>

    </div>
  );
}