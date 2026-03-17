"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface MuscleSmoothnessDataPoint {
  t: number;
  value: number;
}

interface MuscleSmoothnessChartProps {
  data: MuscleSmoothnessDataPoint[];
  benchmark: number;
}

export default function MuscleSmoothnessChart({ data, benchmark }: MuscleSmoothnessChartProps) {
  // above: always between benchmark and value (clamped — zero height when below benchmark)
  // below: always between value and benchmark (clamped — zero height when above benchmark)
  // Both are continuous so no segment breaks
  const chartData = data.map((d) => ({
    t: d.t,
    value: d.value,
    above: Math.max(d.value, benchmark),   // top of teal fill
    below: Math.min(d.value, benchmark),   // bottom of red fill
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />

        <XAxis
          dataKey="t"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[0, 0.9]}
          ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          formatter={(value) => {
            const num = value as number;
            return [`${num.toFixed(2)}`, "Smoothness"];
          }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />

        {/* Teal fill: from benchmark up to value (baseValue = benchmark, dataKey = above) */}
        <Area
          type="monotone"
          dataKey="above"
          stroke="none"
          fill="#12606A"
          fillOpacity={0.25}
          baseValue={benchmark}
          isAnimationActive={false}
          legendType="none"
        />

        {/* Red fill: from value up to benchmark (baseValue = benchmark, dataKey = below) */}
        <Area
          type="monotone"
          dataKey="below"
          stroke="none"
          fill="#EF4444"
          fillOpacity={0.25}
          baseValue={benchmark}
          isAnimationActive={false}
          legendType="none"
        />

        {/* Benchmark reference line */}
        <ReferenceLine
          y={benchmark}
          stroke="#9CA3AF"
          strokeDasharray="4 4"
          strokeWidth={1}
        />

        {/* Main line — drawn on top of fills */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#12606A"
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#12606A", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#12606A" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}