"use client";
import { useState } from "react";
import FilterPills from "../clinician/buttons/FilterPills";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const BRAND = "#12606A";
const CLINIC_COLOR = "#00AC8F";
const BENCH_COLOR = "#FF2D55";

const AGE_GROUPS = [
  { key: "teens", label: "Teens", range: "13–17" },
  { key: "young_adult", label: "Young Adult", range: "18–30" },
  { key: "adult", label: "Adult", range: "31–59" },
  { key: "elderly", label: "Elderly", range: "60+" },
];

const chartData: Record<string, { subject: string; clinic: number; benchmark: number }[]> = {
  teens: [
    { subject: "Patellofemoral", clinic: 0.88, benchmark: 0.95 },
    { subject: "Lateral", clinic: 0.75, benchmark: 0.90 },
    { subject: "Medial", clinic: 0.70, benchmark: 0.85 },
  ],
  young_adult: [
    { subject: "Patellofemoral", clinic: 0.82, benchmark: 0.92 },
    { subject: "Lateral", clinic: 0.85, benchmark: 0.90 },
    { subject: "Medial", clinic: 0.80, benchmark: 0.88 },
  ],
  adult: [
    { subject: "Patellofemoral", clinic: 0.72, benchmark: 0.88 },
    { subject: "Lateral", clinic: 0.68, benchmark: 0.85 },
    { subject: "Medial", clinic: 0.62, benchmark: 0.82 },
  ],
  elderly: [
    { subject: "Patellofemoral", clinic: 0.55, benchmark: 0.75 },
    { subject: "Lateral", clinic: 0.50, benchmark: 0.70 },
    { subject: "Medial", clinic: 0.48, benchmark: 0.68 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid #E5E7EB", borderRadius: "10px",
      padding: "10px 14px", fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 700, color: BRAND, marginBottom: "6px" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: <span style={{ color: "#374151" }}>{p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const formatTick = (value: number) => value.toFixed(1);

export default function TricopartmentalChart() {
  const [activeGroup, setActiveGroup] = useState("adult");
  const data = chartData[activeGroup];

  return (
    <div style={{
      background: "white", borderRadius: "16px", padding: "10px 12px",
      boxShadow: '0 3px 5px 0 rgb(158, 158, 158)', fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", height: "100%",
      overflow: "hidden", position: "relative"
    }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: BRAND, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Tricompartmental
        </span>

        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "8px", height: "3px", borderRadius: "1px", backgroundColor: CLINIC_COLOR }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: BRAND }}>Clinic</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "8px", borderTop: `2px dashed ${BENCH_COLOR}` }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: BRAND }}>Bench</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", alignItems: "center", flex: 1, minHeight: 0 }}>

        <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height="130%">
            <RadarChart 
              cx="50%" 
              cy="60%" 
              outerRadius="85%" 
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 9, fill: BRAND, fontWeight: 700 }} 
              />
              <PolarRadiusAxis 
                domain={[0, 1]} 
                tickCount={4} 
                tick={{ fontSize: 7, fill: "#9CA3AF" }} 
                axisLine={false} 
              />
              <Radar 
                name="Clinic" 
                dataKey="clinic" 
                stroke={CLINIC_COLOR} 
                fill={CLINIC_COLOR} 
                fillOpacity={0.25} 
                strokeWidth={1.5} 
              />
              <Radar 
                name="Benchmark" 
                dataKey="benchmark" 
                stroke={BENCH_COLOR} 
                fill={BENCH_COLOR} 
                fillOpacity={0.1} 
                strokeWidth={1.5} 
                strokeDasharray="3 2" 
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: "110px", flexShrink: 0 }}>
          <FilterPills
            options={AGE_GROUPS.map(g => ({ key: g.key, label: g.label, subLabel: g.range }))}
            activeFilter={activeGroup}
            onFilterChange={setActiveGroup}
          />
        </div>
      </div>
    </div>
  );
}