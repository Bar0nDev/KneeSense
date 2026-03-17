import BenchmarkComparisonChart, { BenchmarkDataPoint } from "@/components/charts/BenchmarkComparisonChart";

const mockData: BenchmarkDataPoint[] = [
  { label: "Force",      you: 2,  benchmark: 3  },
  { label: "Knee Angle", you: 78, benchmark: 72 },
  { label: "Central",    you: 43, benchmark: 40 },
  { label: "Medial",     you: 33, benchmark: 32 },
  { label: "Lateral",    you: 19, benchmark: 24 },
];

export default function BenchmarkComparisonCard() {
  return (
    <div className="flex flex-col gap-4">

      {/* Header + Legend */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-base font-bold">You vs. Elderly Benchmark</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#12606A]" />
            <p className="text-xs text-[#455858]">You</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#6BAF92]" />
            <p className="text-xs text-[#455858]">Benchmark</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <BenchmarkComparisonChart data={mockData} />

    </div>
  );
}