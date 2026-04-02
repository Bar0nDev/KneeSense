"use client";

import Card from "@/components/ui/Card";
import KneeAngleChart, { type KneeAngleDataPoint } from "@/components/charts/KneeAngleChart";

interface KneeAngleCardProps {
  data?: KneeAngleDataPoint[];
  benchmark?: number;
}

export default function KneeAngleCard({ data, benchmark = 0 }: KneeAngleCardProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="flex flex-col gap-2">

      {/* Header & Legend Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Knee Angle Trend</h2>
          <p className="text-xs text-[#455858] mt-0.5 font-medium opacity-80">
            Your recordings vs. elderly benchmark
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-[#455858] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="h-1 w-5 rounded-full bg-[#12606A]" />
            Knee Angle
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-1 w-1.5 rounded-full bg-[#EF4444]" />
              <span className="h-1 w-1.5 rounded-full bg-[#EF4444]" />
              <span className="h-1 w-1.5 rounded-full bg-[#EF4444]" />
            </div>
            Benchmark ({benchmark}°)
          </div>
        </div>
      </div>

      {/* Chart or Empty State */}
      {hasData ? (
        <div className="w-full">
          <KneeAngleChart data={data!} benchmark={benchmark} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "200px" }}>
          <p className="text-sm font-medium text-gray-400">No sessions recorded yet.</p>
        </div>
      )}

    </Card>
  );
}