"use client";

import Card from "@/components/ui/Card";

interface SessionStatCardProps {
  label: string;
  value: string;
  benchmarkLabel?: string;
  benchmarkValue: string;
}

export default function SessionStatCard({
  label,
  value,
  benchmarkLabel = "vs Benchmark",
  benchmarkValue,
}: SessionStatCardProps) {
  return (
    <Card className="flex-1 flex flex-col justify-center min-w-0 py-4 px-5">
      <div className="flex flex-col gap-0.5">
        {/* Main Metric Label */}
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest truncate">
          {label}
        </p>
        
        {/* The Big Value */}
        <h2 className="text-2xl font-black text-[#12606A] leading-tight truncate">
          {value}
        </h2>
      </div>

      {/* Benchmark Footer */}
      <div className="mt-1 pt-1 border-t border-gray-100">
        <p className="text-[10px] font-medium text-[#455858] opacity-70 uppercase tracking-tighter">
          {benchmarkLabel}
        </p>
        <p className="text-xs font-semibold text-[#455858] truncate">
          {benchmarkValue}
        </p>
      </div>
    </Card>
  );
}