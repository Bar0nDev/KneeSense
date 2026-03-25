"use client";

import Card from "@/components/ui/Card";
import MuscleSmoothnessChart, { 
  MuscleSmoothnessDataPoint 
} from "@/components/charts/MuscleSmoothnessChart";

interface MuscleSmoothnessCardProps {
  data: MuscleSmoothnessDataPoint[];
  benchmark?: number;
}

export default function MuscleSmoothnessCard({ 
  data, 
  benchmark = 0.6 
}: MuscleSmoothnessCardProps) {
  return (
    <Card className="flex-1 flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-gray-900">Muscle Smoothness Index</h2>
        <p className="text-xs text-[#9CA3AF]">Real-time force distribution analysis</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#12606A]" />
          <p className="text-[10px] font-bold text-[#455858] uppercase tracking-wider">
            Benchmark Force
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
          <p className="text-[10px] font-bold text-[#455858] uppercase tracking-wider">
            Underperforming
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full">
        <MuscleSmoothnessChart data={data} benchmark={benchmark} />
      </div>
    </Card>
  );
}