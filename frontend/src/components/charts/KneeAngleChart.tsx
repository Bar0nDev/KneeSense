"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface KneeAngleDataPoint {
  date: string;
  angle: number;
}

interface KneeAngleChartProps {
  data: KneeAngleDataPoint[];
  benchmark: number;
}

export default function KneeAngleChart({ data, benchmark }: KneeAngleChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={true} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[55, 90]}
          ticks={[55, 63, 71, 85]}
          tickFormatter={(v) => `${v}°`}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          formatter={(value) => [`${value as number}°`, "Knee Angle"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />

        <ReferenceLine
          y={benchmark}
          stroke="#EF4444"
          strokeDasharray="5 5"
          strokeWidth={1.5}
        />

        <Line
          type="monotone"
          dataKey="angle"
          stroke="#1E3A8A"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#1E3A8A", strokeWidth: 0 }}
          activeDot={{ r: 7, fill: "#12606A" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}