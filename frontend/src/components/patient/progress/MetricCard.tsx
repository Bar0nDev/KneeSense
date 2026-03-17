interface MetricCardProps {
  value: string;        // e.g. "85%", "+6°", "↓13%"
  label: string;        // e.g. "REHAB CONSISTENCY"
  valueColor?: string;  // optional text color for value
}

export default function MetricCard({
  value,
  label,
  valueColor = "text-gray-900",
}: MetricCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border-t-4  ${valueColor} py-6 px-4`}>
      <p className={`text-2xl font-extrabold`}>{value}</p>
      <p className="text-xs font-semibold text-[#455858] uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}