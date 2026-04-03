"use client";
import { useState, useEffect } from "react";
import SearchBar from "@/components/ui/SearchBar";
import { patientService, PatientListItem } from "@/services/patientService";
import { getStatusConfig, complianceColor, isStalled } from "@/lib/patientStatus";
import { useUser } from "@/context/UserContext";

const BRAND = "#12606A";

type FilterType = "Current" | "Stalled" | "Unassigned";

type Props = {
  onSelect: (patient: PatientListItem) => void;
  selectedId?: string;
  refreshKey?: number;
};

export default function PatientList({ onSelect, selectedId, refreshKey }: Props) {
  const [allPatients, setAllPatients] = useState<PatientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("Current");
  const [loading, setLoading] = useState(true);
  const { userProfile } = useUser();

  const fetchPatients = () => {
    setLoading(true);
    patientService.getAllPatients()
      .then(setAllPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, [refreshKey]);

  const assigned = allPatients.filter((p) => p.practitioner_id !== null);
  const unassigned = allPatients.filter((p) => p.practitioner_id === null);

  const filtered = (() => {
    const pool = filter === "Unassigned" ? unassigned : assigned;
    return pool.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      if (filter === "Current") return matchesSearch && !isStalled(p.status as any, p.compliance);
      if (filter === "Stalled") return matchesSearch && isStalled(p.status as any, p.compliance);
      return matchesSearch;
    });
  })();

  return (
    <div
      className="h-screen w-80 bg-[#FDFDFD] flex flex-col flex-shrink-0"
      style={{ boxShadow: "0 3px 5px 0 rgb(158,158,158)", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Search + total */}
      <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.06em" }}>Patients</span>
          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{filtered.length} / {assigned.length} total</span>
        </div>
        <SearchBar placeholder="Search patients..." value={search} onChange={setSearch} />
      </div>

      {/* Filters */}
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["Current", "Stalled", "Unassigned"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px", borderRadius: "999px",
                border: `1.5px solid ${filter === f ? (f === "Unassigned" ? "#FF8C00" : BRAND) : "#E5E7EB"}`,
                background: filter === f ? (f === "Unassigned" ? "#FFF7E6" : `${BRAND}12`) : "transparent",
                color: filter === f ? (f === "Unassigned" ? "#FF8C00" : BRAND) : "#6B7280",
                fontSize: "11px", fontWeight: filter === f ? 700 : 500, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {f === "Unassigned" ? (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Unassigned
                  <span style={{ background: filter === "Unassigned" ? "#FF8C00" : "#E5E7EB", color: filter === "Unassigned" ? "#FFF" : "#6B7280", padding: "0 6px", borderRadius: "999px", fontSize: "9px" }}>
                    {unassigned.length}
                  </span>
                </span>
              ) : f}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "#9CA3AF", fontSize: "12px" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "#9CA3AF", fontSize: "12px" }}>No patients found</div>
        ) : filtered.map((p) => {
          const s = getStatusConfig(p.status);
          const isSelected = p.id === selectedId;
          const isUnassignedCard = p.status === "unassigned";

          if (isUnassignedCard) {
            return (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                style={{
                  padding: "12px 14px", borderBottom: "1px solid #E5E7EB", cursor: "pointer", transition: "background 0.1s",
                  background: isSelected ? "#FFE4B050" : "transparent",
                  borderLeft: isSelected ? "3px solid #FF8C00" : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FFE4B020"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#FFF7E6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF8C00" }}>{p.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#FF8C00", fontWeight: 600 }}>Needs Assessment</div>
                    </div>
                  </div>
                  <button
                    style={{ fontSize: "10px", fontWeight: 700, color: BRAND, background: `${BRAND}12`, border: `1px solid ${BRAND}`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const practitionerId = userProfile?.profile_id;
                      if (!practitionerId) return;
                      try {
                        await patientService.assignPatient(p.id, practitionerId);
                        fetchPatients();
                      } catch (err) {
                        console.error("Failed to assign patient", err);
                      }
                    }}
                  >Assign</button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB", cursor: "pointer", transition: "background 0.1s", background: isSelected ? `${BRAND}1A` : "transparent", borderLeft: isSelected ? `3px solid ${BRAND}` : "3px solid transparent" }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = `${BRAND}0A`; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: `${BRAND}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND }}>{p.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>Week {Math.ceil(p.daysIn / 7) || 1}</div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: s.text, background: s.bg, borderRadius: "999px", padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {s.icon} {s.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "8px", padding: "5px 8px" }}>
                  <div style={{ fontSize: "10px", color: "#4B5563", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Compliance</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: complianceColor(p.compliance) }}>{p.compliance}%</div>
                </div>
                <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "8px", padding: "5px 8px" }}>
                  <div style={{ fontSize: "10px", color: "#4B5563", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Force</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{p.forceAvg} N</div>
                </div>
                <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "8px", padding: "5px 8px" }}>
                  <div style={{ fontSize: "10px", color: "#4B5563", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Next</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{p.nextSession}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
