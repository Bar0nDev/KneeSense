"use client";
import { useState, useEffect } from "react";
import FilterPills from "../clinician/buttons/FilterPills";
import { patientService, PatientListItem } from "@/services/patientService";
import { complianceColor } from "@/lib/patientStatus";

const BRAND = "#12606A";

const ALERT_TYPES = [
  { key: "all",        label: "All Alerts" },
  { key: "declining",  label: "Declining" },
  { key: "compliance", label: "Low Compliance" },
  { key: "days",       label: "Days in Program" },
];

function getAlertType(p: PatientListItem): string {
  if (p.compliance < 40) return "compliance";
  if (p.status === "declining") return "declining";
  if (p.daysIn > 60) return "days";
  return "compliance";
}

const HEADERS = ["Patient", "Days In", "Compliance", "Force Avg", "Status", "Action"];

export default function AlertTable() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [allPatients, setAllPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getAllPatients()
      .then((patients) => {
        // Only show patients that need attention (declining or low compliance)
        const alerts = patients.filter(
          (p) => p.practitioner_id !== null && (p.status === "declining" || p.compliance < 40 || p.daysIn > 60)
        );
        setAllPatients(alerts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "all"
    ? allPatients
    : allPatients.filter((p) => getAlertType(p) === activeFilter);

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
        <FilterPills options={ALERT_TYPES} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
          Showing {filtered.length} of {allPatients.length} alerts
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
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>No alerts for this filter</td>
              </tr>
            ) : filtered.map((row, i) => (
              <tr
                key={row.id}
                style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${BRAND}08`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFAFA")}
              >
                <td style={{ padding: "12px 16px", fontWeight: 600, color: BRAND, whiteSpace: "nowrap" }}>{row.name}</td>
                <td style={{ padding: "12px 16px", color: "#374151" }}>{row.daysIn} days</td>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: complianceColor(row.compliance) }}>{row.compliance}%</td>
                <td style={{ padding: "12px 16px", color: "#374151" }}>{row.forceAvg} N</td>
                <td style={{ padding: "12px 16px", color: row.status === "declining" ? "#FF2D55" : "#FF8C00", fontWeight: 600, textTransform: "capitalize" }}>{row.status}</td>
                <td style={{ padding: "12px 16px" }}>
                  <a
                    href="/patients"
                    style={{ display: "inline-block", padding: "4px 12px", borderRadius: "8px", border: `1.5px solid ${BRAND}`, color: BRAND, fontSize: "11px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    View →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
