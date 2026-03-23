"use client";

import { useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";

import MetricCard from "@/components/patient/progress/MetricCard";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import SessionStatCard from "@/components/patient/progress/SessionStatCard";
import AIInsightCard from "@/components/patient/progress/AiInsightCard";
import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";

import { useProgress } from "@/hooks/useProgress";

export default function ProgressPage() {
  const router = useRouter();
  const { metrics, sessionData, insights, pageMeta } = useProgress();

  return (
    <div className="space-y-4">
      {/* 1. Header Section */}
      <PageHeader
        title="My Progress"
        subtitle={`Since ${pageMeta.since} · Next Session: ${pageMeta.nextSession}`}
        action={
          <PrimaryButton
            color="#27AE60"
            onClick={() => router.push("/recording")}
          >
            Begin Session
          </PrimaryButton>
        }
      />

      {/* 2. Top Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard 
            key={metric.type} 
            type={metric.type as any} 
            value={metric.value} 
          />
        ))}
      </div>

      {/* 3. Main Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Left Column: Media & Primary Stats */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          
          {/* Section Heading */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Session Metrics</h2>
            <span className="text-sm font-medium text-[#455858] bg-white border border-gray-200 px-3 py-0.5 rounded-full shadow-sm">
              {sessionData.date}
            </span>
          </div>

          {/* Video Player & Vertical Stats */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="w-full lg:w-90 lg:shrink-0">
              <ZoneMap {...sessionData.video} />
            </div>

            <div className="flex flex-row lg:flex-col gap-3 flex-1">
              {sessionData.stats.map((stat) => (
                <SessionStatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  benchmarkValue={stat.benchmark}
                />
              ))}
            </div>
          </div>

          {/* Comparative Analysis Chart */}
          <BenchmarkComparisonCard data={sessionData.benchmarkData} />
        </div>

        {/* Right Column: AI & Smoothness Analysis */}
        <div className="flex flex-col gap-4 w-full lg:w-96 shrink-0">
          <AIInsightCard 
            status={insights.status} 
            summary={insights.summary} 
          />
          
          <MuscleSmoothnessCard 
            data={sessionData.smoothnessData} 
            benchmark={0.6} 
          />
        </div>

      </div>
    </div>
  );
}