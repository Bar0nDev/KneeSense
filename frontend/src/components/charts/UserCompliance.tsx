"use client";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import PrimaryButton from "../clinician/buttons/PrimaryButton";
import { useClinicAnalytics } from "@/hooks/useClinicAnalytics";

const BRAND = "#12606A";

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700} fontFamily="'DM Sans', sans-serif">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function UserCompliance() {
  const { isLoading, complianceData: { tiers, total, avgCompliance } } = useClinicAnalytics();
  const maxValue = Math.max(...tiers.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "stretch", width: "100%", height: "100%", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "160px", flexShrink: 0 }}>
        <div style={{ background: "white", alignItems: "center", borderRadius: "12px", padding: "16px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "10px", color: "#00AC8F", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "4px" }}>
            Total Enrolled
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: BRAND, lineHeight: 1 }}>
            {isLoading ? "—" : total.toLocaleString()}
          </div>
        </div>

        {tiers.map((item) => {
          const barPct = (item.value / maxValue) * 100;
          return (
            <div key={item.name} style={{ position: "relative", background: "white", borderRadius: "10px", padding: "8px 12px", boxShadow: "0 3px 5px 0 rgb(158, 158, 158)", overflow: "hidden", display: "flex", alignItems: "center" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barPct}%`, backgroundColor: item.color, opacity: 1, zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", width: "100%", alignItems: "baseline" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: BRAND }}>{item.name}</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: item.stroke }}>{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Card */}
      <div style={{ background: "white", borderRadius: "16px", padding: "14px 18px", flex: 1, boxShadow: "0 3px 5px 0 rgb(158, 158, 158)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: BRAND, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Patient Compliance
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={tiers.map((t) => ({ ...t, fill: t.color, stroke: t.stroke }))}
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  paddingAngle={3} dataKey="value" label={renderCustomLabel}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "38px", fontWeight: 800, color: BRAND, lineHeight: 1 }}>
                {isLoading ? "—" : `${avgCompliance}%`}
              </div>
              <div style={{ fontSize: "13px", color: BRAND, opacity: 0.6, fontWeight: 700 }}>AVG</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", width: "115px", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {tiers.map((item) => (
                <div key={item.name} style={{ display: "flex", flexDirection: "column", background: "#F9FAFB", borderRadius: "8px", padding: "6px 10px", border: `1px solid ${item.stroke}15` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "4px", borderRadius: "2px", backgroundColor: item.color }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#9CA3AF", paddingLeft: "16px", lineHeight: 1 }}>{item.sub}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "50px" }}>
              <PrimaryButton variant="link" href="/patients" className="w-full" style={{ height: "36px", fontSize: "20px" }}>
                View Patients →
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
