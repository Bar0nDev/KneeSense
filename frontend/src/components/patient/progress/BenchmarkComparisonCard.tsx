"use client";

import Card from "@/components/ui/Card";
import BenchmarkComparisonChart, { 
  BenchmarkDataPoint 
} from "@/components/charts/BenchmarkComparisonChart";

interface BenchmarkComparisonCardProps {
  data: BenchmarkDataPoint[];
}

export default function BenchmarkComparisonCard({ data }: BenchmarkComparisonCardProps) {
  return (
    <Card className="w-full">
      <div className="flex flex-col gap-6">
        {/* Header + Legend */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Performance Comparison</h2>
            <p className="text-xs text-[#9CA3AF]">You vs. Elderly Benchmark</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#12606A]" />
              <p className="text-[10px] font-medium text-[#455858] uppercase tracking-wider">You</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#6BAF92]" />
              <p className="text-[10px] font-medium text-[#455858] uppercase tracking-wider">Benchmark</p>
            </div>
          </div>
        </div>

        {/* Chart Component */}
        <div className="w-full">
          <BenchmarkComparisonChart data={data} />
        </div>
      </div>
    </Card>
  );
}