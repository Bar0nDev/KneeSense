"use client";

import Card from "@/components/ui/Card";
import KneeAngleChart from "@/components/charts/KneeAngleChart";

// Moving mock data out of the component body
const MOCK_KNEE_DATA = [
  { date: "Dec 5", angle: 58 },
  { date: "Dec 27", angle: 58 },
  { date: "Jan 10", angle: 61 },
  { date: "Jan 17", angle: 63 },
  { date: "Jan 28", angle: 67 },
  { date: "Feb 7", angle: 72 },
  { date: "Feb 16", angle: 75 },
  { date: "Feb 28", angle: 78 },
  { date: "Mar 10", angle: 80 },
];

const BENCHMARK = 72;

export default function KneeAngleCard (){
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
            Benchmark ({BENCHMARK}°)
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full">
        <KneeAngleChart data={MOCK_KNEE_DATA} benchmark={BENCHMARK} />
      </div>

    </Card>
  );
}