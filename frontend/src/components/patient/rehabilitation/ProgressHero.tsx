// components/rehab/ProgressHero.tsx
import Card from "@/components/ui/Card";

interface ProgressHeroProps {
  current: number;
  total: number;
  percentage: number;
}

export function ProgressHero({ current, total, percentage }: ProgressHeroProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800">Today's Progress</p>
        <p className="text-sm font-bold text-[#12606A]">{current}/{total}</p>
      </div>
      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ 
            width: `${percentage}%`,
            background: "linear-gradient(to right, #12606A, #30C3B1)" 
          }}
        />
      </div>
    </Card>
  );
}