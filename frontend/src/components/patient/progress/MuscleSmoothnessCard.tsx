import MuscleSmoothnessChart, { MuscleSmoothnessDataPoint } from "@/components/charts/MuscleSmoothnessChart";

const mockData: MuscleSmoothnessDataPoint[] = [
  { t: 0, value: 0.1 },
  { t: 1, value: 0.46 },
  { t: 2, value: 0.74 },
  { t: 3, value: 0.79 },
  { t: 4, value: 0.85 },
  { t: 5, value: 0.56 },
  { t: 6, value: 0.42 },
  { t: 7, value: 0.46 },
  { t: 8, value: 0.77 },
  { t: 9, value: 0.25 },
];

const BENCHMARK = 0.6;

export default function MuscleSmoothnessCard() {
  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <p className="text-base font-bold">Muscle Smoothness Index</p>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#12606A] opacity-40" />
          <p className="text-xs text-[#455858]">Benchmark force</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-red-300 opacity-60" />
          <p className="text-xs text-[#455858]">Underperforming</p>
        </div>
      </div>

      {/* Chart */}
      <MuscleSmoothnessChart data={mockData} benchmark={BENCHMARK} />

    </div>
  );
}