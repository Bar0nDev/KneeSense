"use client";
import Link from "next/link";
import FilterPills from "../clinician/buttons/FilterPills";
import { useState } from "react";
import { useAlerts, PatientAlert } from "@/hooks/useAlerts";
import { complianceColor } from "@/lib/patientStatus";

const BRAND = "#12606A";

const ALERT_TYPES = [
  { key: "all",        label: "All Alerts" },
  { key: "declining",  label: "Declining" },
  { key: "compliance", label: "Low Compliance" },
];

const HEADERS = ["Patient", "Days In", "Compliance", "Force Avg", "Alert", "Action"];

function alertLabel(alert: PatientAlert) {
  if (alert.type === "declining_rom") return { label: "Declining", color: "#FF2D55" };
  return { label: "Low Compliance", color: "#FF8C00" };
}

export default function AlertTable() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { alerts, isLoading } = useAlerts();

  const filtered = activeFilter === "all"
    ? alerts
    : alerts.filter((a) =>
        activeFilter === "declining"  ? a.type === "declining_rom"   :
        activeFilter === "compliance" ? a.type === "low_compliance"  :
        true
      );

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: "100%",
    }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <FilterPills options={ALERT_TYPES} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
          Showing {filtered.length} of {alerts.length} alerts
        </span>
      </div>

      <div style={{ overflowX: "auto", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "10px", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.06em", background: BRAND, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>No alerts for this filter</td>
              </tr>
            ) : filtered.map((row, i) => {
              const { label, color } = alertLabel(row);
              return (
                <tr
                  key={row.patientId}
                  style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${BRAND}08`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFAFA")}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: BRAND, whiteSpace: "nowrap" }}>{row.patientName}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{row.daysIn != null ? `${row.daysIn} days` : "—"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: complianceColor(row.compliance ?? row.value) }}>
                    {row.compliance != null ? `${row.compliance}%` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{row.forceAvg != null ? `${row.forceAvg} N` : "—"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color, whiteSpace: "nowrap" }}>{label}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link
                      href={`/patients?select=${row.patientId}`}
                      style={{ display: "inline-block", padding: "4px 12px", borderRadius: "8px", border: `1.5px solid ${BRAND}`, color: BRAND, fontSize: "11px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
