import KneeAngleChart from "@/components/charts/KneeAngleChart";

// Mock data — replace with real session data later
const kneeAngleData = [
  { date: "Dec 27", angle: 58 },
  { date: "Jan 17", angle: 63 },
  { date: "Feb 7", angle: 72 },
  { date: "Feb 28", angle: 78 },
];

const BENCHMARK = 72;

export default function KneeAngleCard() {
  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div>
        <p className="text-base font-bold text-gray-900">Knee Angle Trend</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Your recordings vs. elderly benchmark ({BENCHMARK}°)
        </p>
      </div>

      {/* Chart */}
      <KneeAngleChart data={kneeAngleData} benchmark={BENCHMARK} />

    </div>
  );
}