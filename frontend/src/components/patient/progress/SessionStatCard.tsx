interface SessionStatCardProps {
  label: string;
  value: string;
  benchmarkLabel: string;
  benchmarkValue: string;
}

export default function SessionStatCard({
  label,
  value,
  benchmarkLabel,
  benchmarkValue,
}: SessionStatCardProps) {
  return (
    <div className="flex flex-col min-w-0">
      <p className="text-sm font-semibold text-[#455858] truncate">{label}</p>
      <p className="text-xl font-bold whitespace-nowrap">{value}</p>
      <div className="mt-1 text-[#455858]">
        <p className="text-xs truncate">{benchmarkLabel}</p>
        <p className="text-xs truncate">{benchmarkValue}</p>
      </div>
    </div>
  );
}