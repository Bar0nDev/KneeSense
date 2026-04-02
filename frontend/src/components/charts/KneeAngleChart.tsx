"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface KneeAngleDataPoint {
  index: number;
  date: string;
  angle: number;
}

interface KneeAngleChartProps {
  data: KneeAngleDataPoint[];
  benchmark: number;
}

export default function KneeAngleChart({ data, benchmark }: KneeAngleChartProps) {
  const angles = data.map((d) => d.angle);
  const rawMin = Math.min(...angles, benchmark);
  const rawMax = Math.max(...angles, benchmark);
  const domainMin = Math.floor((rawMin - 10) / 10) * 10;
  const domainMax = Math.ceil((rawMax + 10) / 10) * 10;
  const ticks: number[] = [];
  for (let t = domainMin; t <= domainMax; t += 10) ticks.push(t);

  return (
    <ResponsiveContainer width="100%" height={200}>
      {/* Fixed Margins: 
        left: 0 and width: 35 on YAxis creates a dedicated lane for labels.
        bottom: 10 ensures XAxis dates don't clip.
      */}
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="kneeAngleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#12606A" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#12606A" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />

        <XAxis
          type="number"
          dataKey="index"
          domain={[0, data.length - 1]}
          ticks={data.map((_, i) => i)}
          tickFormatter={(i) => data[i]?.date ?? ""}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />

        <YAxis
          domain={[domainMin, domainMax]}
          ticks={ticks}
          tickFormatter={(v) => `${v}°`}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          // Fixed: Provides enough horizontal space for the "00°" text
          width={40}
        />

        <Tooltip
          labelFormatter={(i) => data[i as number]?.date ?? ""}
          formatter={(value) => [`${value as number}°`, "Knee Angle"]}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
        />

        <ReferenceLine
          y={benchmark}
          stroke="#EF4444"
          strokeDasharray="5 5"
          strokeWidth={1.5}
        />

        <Area
          type="monotone"
          dataKey="angle"
          stroke="#12606A"
          strokeWidth={2.5}
          fill="url(#kneeAngleGradient)"
          dot={{ r: 4, fill: "#12606A", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: "#30C3B1", strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}