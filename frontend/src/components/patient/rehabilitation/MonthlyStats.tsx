// components/rehab/MonthlyStats.tsx
import Card from "@/components/ui/Card";

export function MonthlyStats({ stats }: { stats: any[] }) {
  return (
    <Card className="flex-1">
      <p className="text-sm font-bold text-gray-900 mb-1">Exercises This Month</p>
      <p className="text-xs text-[#9CA3AF] mb-5">Steps completed across all sessions</p>
      <div className="flex flex-col gap-3">
        {stats.map(({ name, count, max }) => (
          <div key={name} className="flex items-center gap-3">
            <p className="text-sm text-gray-700 w-32 shrink-0 truncate">{name}</p>
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ 
                  width: `${(count / max) * 100}%`,
                  background: "linear-gradient(to right, #12606A, #30C3B1)" 
                }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}