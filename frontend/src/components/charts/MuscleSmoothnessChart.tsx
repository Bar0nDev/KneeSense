"use client";

import {
  BarChart,
  Bar,
  Cell,
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
  return (
    <ResponsiveContainer width="100%" height={214}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />

        <XAxis
          dataKey="t"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[0, 1]}
          ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
          tickFormatter={(v) => v.toFixed(1)}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          formatter={(value) => [`${(value as number).toFixed(2)}`, "Smoothness"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />

        <ReferenceLine
          y={benchmark}
          stroke="#9CA3AF"
          strokeDasharray="5 4"
          strokeWidth={1.5}
        />

        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= benchmark ? "#12606A" : "#EF4444"}
              fillOpacity={entry.value >= benchmark ? 0.85 : 0.75}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}