"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface BenchmarkDataPoint {
  label: string;
  you: number;
  benchmark: number;
}

interface BenchmarkComparisonChartProps {
  data: BenchmarkDataPoint[];
}

export default function BenchmarkComparisonChart({ data }: BenchmarkComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barCategoryGap="30%" barGap={3}>
        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />

        <Bar dataKey="you" name="You" fill="#12606A" radius={[3, 3, 0, 0]} />
        <Bar dataKey="benchmark" name="Benchmark" fill="#6BAF92" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}