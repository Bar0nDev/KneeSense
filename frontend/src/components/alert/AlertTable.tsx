"use client";
import { useState } from "react";
import FilterPills from "../clinician/buttons/FilterPills";

const BRAND = "#12606A";

const ALERT_TYPES = [
  { key: "all",        label: "All Alerts" },
  { key: "benchmark",  label: "Below Benchmark" },
  { key: "deficit",    label: "High Deficit" },
  { key: "compliance", label: "Low Compliance" },
  { key: "days",       label: "Days in Program" },
];

const alerts = [
  { id: "p1", patient: "Sofia Reyes",     age: 13, rom: "-- °", benchmark: "-- °", deficit: "-- °", compliance: "--%", daysIn: "-- days", alertType: "benchmark" },
  { id: "p2", patient: "Emma Lewis",      age: 44, rom: "-- °", benchmark: "-- °", deficit: "-- °", compliance: "--%", daysIn: "-- days", alertType: "compliance" },
  { id: "p3", patient: "Charlotte Young", age: 58, rom: "-- °", benchmark: "-- °", deficit: "-- °", compliance: "--%", daysIn: "-- days", alertType: "deficit" },
  { id: "p4", patient: "Amelia Adams",    age: 71, rom: "-- °", benchmark: "-- °", deficit: "-- °", compliance: "--%", daysIn: "-- days", alertType: "days" },
  { id: "p5", patient: "Benjamin Wright", age: 78, rom: "-- °", benchmark: "-- °", deficit: "-- °", compliance: "--%", daysIn: "-- days", alertType: "benchmark" },
];

const HEADERS = ["Patient", "Age", "ROM", "Benchmark", "Deficit", "Compliance", "Days In", "Action"];

export default function AlertTable() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? alerts
    : alerts.filter((a) => a.alertType === activeFilter);

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 3px 5px 0 rgb(158,158,158)",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: "100%",
    }}>

      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <FilterPills
          options={ALERT_TYPES}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
          Showing {filtered.length} of {alerts.length} alerts
        </span>
      </div>

      <div style={{ overflowX: "auto", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  style={{
                    height: "100%",
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    background: BRAND,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>
                  No alerts for this filter
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${BRAND}08`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFAFA")}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: BRAND, whiteSpace: "nowrap" }}>{row.patient}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{row.age}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}><span title="backend: patient.currentRom">{row.rom}</span></td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}><span title="backend: benchmarkForAgeGroup">{row.benchmark}</span></td>
                  <td style={{ padding: "12px 16px", color: "#FF2D55", fontWeight: 600 }}><span title="backend: deficit = benchmark - rom">{row.deficit}</span></td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}><span title="backend: patient.complianceScore">{row.compliance}</span></td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}><span title="backend: daysSinceEnrollment">{row.daysIn}</span></td>
                  <td style={{ padding: "12px 16px" }}>
                    <a
                      href={`/patients/${row.id}`}
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        border: `1.5px solid ${BRAND}`,
                        color: BRAND,
                        fontSize: "11px",
                        fontWeight: 700,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}