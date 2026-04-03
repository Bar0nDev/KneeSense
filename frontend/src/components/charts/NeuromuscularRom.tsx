"use client";
import { useState, useCallback, useRef } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";

const BRAND = "#12606A";

const AGE_GROUPS = [
  { key: "teens",       label: "Teens",       xMin: 13, xMax: 17, color: "#00C9A7", benchmark: 160 },
  { key: "young_adult", label: "Young Adult", xMin: 18, xMax: 30, color: "#FF8C00", benchmark: 150 },
  { key: "adult",       label: "Adult",       xMin: 31, xMax: 59, color: "#399195", benchmark: 135 },
  { key: "elderly",     label: "Elderly",     xMin: 60, xMax: 90, color: "#FF2D55", benchmark: 115 },
];

const patients = [
  { id: "p1",  name: "James Ortega",    age: 14, rom: 170, group: "teens"       },
  { id: "p2",  name: "Mia Chen",        age: 16, rom: 155, group: "teens"       },
  { id: "p3",  name: "Ethan Brooks",    age: 15, rom: 162, group: "teens"       },
  { id: "p4",  name: "Sofia Reyes",     age: 13, rom: 148, group: "teens"       },
  { id: "p5",  name: "Liam Patel",      age: 22, rom: 158, group: "young_adult" },
  { id: "p6",  name: "Ava Nguyen",      age: 26, rom: 143, group: "young_adult" },
  { id: "p7",  name: "Noah Kim",        age: 19, rom: 152, group: "young_adult" },
  { id: "p8",  name: "Isabella Torres", age: 29, rom: 138, group: "young_adult" },
  { id: "p9",  name: "Mason Clark",     age: 35, rom: 140, group: "adult"       },
  { id: "p10", name: "Emma Lewis",      age: 44, rom: 128, group: "adult"       },
  { id: "p11", name: "Oliver Hall",     age: 51, rom: 132, group: "adult"       },
  { id: "p12", name: "Charlotte Young", age: 58, rom: 118, group: "adult"       },
  { id: "p13", name: "Elijah Scott",    age: 63, rom: 122, group: "elderly"     },
  { id: "p14", name: "Amelia Adams",    age: 71, rom: 108, group: "elderly"     },
  { id: "p15", name: "Benjamin Wright", age: 78, rom: 98,  group: "elderly"     },
  { id: "p16", name: "Harper Mitchell", age: 85, rom: 112, group: "elderly"     },
];

const getGroup = (group: string) => AGE_GROUPS.find((g) => g.key === group)!;

const CustomDot = (props: any) => {
  const { cx, cy, payload, onDotClick } = props;
  const group   = getGroup(payload.group);
  const isAbove = payload.rom >= group.benchmark;
  return (
    <circle
      cx={cx} cy={cy} r={6}
      fill={group.color}
      stroke={isAbove ? "transparent" : group.color}
      strokeWidth={2}
      opacity={isAbove ? 0.22 : 1}
      style={{ cursor: isAbove ? "default" : "pointer", filter: isAbove ? "blur(1.5px)" : "none" }}
      onClick={() => !isAbove && onDotClick(payload, cx, cy)}
    />
  );
};

export default function NeuromuscularRom() {
  const [popup, setPopup] = useState<{ patient: any; x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDotClick = useCallback((patient: any, cx: number, cy: number) => {
    setPopup((prev) => prev?.patient.id === patient.id ? null : { patient, x: cx, y: cy });
  }, []);

  const scatterData = patients.map((p) => ({ ...p, x: p.age, y: p.rom }));

  return (
    <div style={{
      background: "white", borderRadius: "16px", padding: "10px 14px",
      boxShadow: "0 3px 5px 0 rgb(158,158,158)", fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", height: "100%", position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: BRAND, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Neuromuscular ROM
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <svg width="16" height="4">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#6B7280" strokeWidth="2" strokeDasharray="3 2" />
          </svg>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#6B7280" }}>Benchmark</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
        {AGE_GROUPS.map((g) => (
          <div key={g.key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "16px", height: "6px", borderRadius: "3px", backgroundColor: g.color }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: BRAND }}>{g.label}</span>
          </div>
        ))}
      </div>

      <div ref={chartRef} style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -25 }}>
            <CartesianGrid stroke="#F3F4F6" strokeDasharray="4 4" />
            <XAxis dataKey="x" type="number" domain={[10, 90]} ticks={[10,30,50,70,90]}
              tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
            <YAxis dataKey="y" type="number" domain={[0, 180]} ticks={[0,45,90,135,180]}
              tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
            
            {AGE_GROUPS.map((g) => (
              <ReferenceArea key={`bg-${g.key}`} x1={g.xMin} x2={g.xMax} fill={g.color} fillOpacity={0.06} strokeOpacity={0} />
            ))}

            {/* BENCHMARK LINES: Using the 'segment' prop from documentation */}
            {AGE_GROUPS.map((g) => (
              <ReferenceLine
                key={`line-${g.key}`}
                stroke={g.color}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                segment={[
                    { x: g.xMin, y: g.benchmark }, 
                    { x: g.xMax, y: g.benchmark }
                ]}
              />
            ))}

            <Scatter
              data={scatterData}
              shape={(props: any) => <CustomDot {...props} onDotClick={handleDotClick} />}
            >
              {scatterData.map((_, i) => <Cell key={`cell-${i}`} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {popup && (
          <div style={{
            position: "absolute",
            left: Math.min(popup.x + 8, (chartRef.current?.clientWidth ?? 300) - 150),
            top: popup.y - 20,
            background: "white", border: `1.5px solid ${BRAND}`, borderRadius: "10px",
            padding: "8px 10px", boxShadow: "0 4px 12px rgba(18,96,106,0.15)", zIndex: 50, minWidth: "140px",
          }}>
            <button onClick={() => setPopup(null)} style={{ position: "absolute", top: "4px", right: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#9CA3AF" }}>×</button>
            <div style={{ fontSize: "11px", fontWeight: 700, color: BRAND }}>{popup.patient.name}</div>
            <div style={{ fontSize: "9px", color: "#6B7280", marginBottom: "4px" }}>Age {popup.patient.age} · {popup.patient.rom}°</div>
            <div style={{ fontSize: "9px", color: "#FF2D55", fontWeight: 600, marginBottom: "6px" }}>
              ↓ {getGroup(popup.patient.group).benchmark - popup.patient.rom}° below
            </div>
            <button
              onClick={() => console.log(`/patients/${popup.patient.id}`)}
              style={{ width: "100%", padding: "4px 0", borderRadius: "6px", border: `1.5px solid ${BRAND}`, background: "transparent", color: BRAND, fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              View Patient →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}