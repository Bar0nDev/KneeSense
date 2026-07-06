"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SessionStatusBadge } from "@/components/admin/AdminBadge";
import FilterTabs from "@/components/admin/FilterTabs";
import SessionDetailPanel from "@/components/admin/SessionDetailPanel";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { formatDate, formatAngle } from "@/lib/adminFormat";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
];

export default function AdminSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient_id") ?? undefined;
  const selectId = searchParams.get("select");
  const [statusFilter, setStatusFilter] = useState("all");

  const { sessions: allSessions, isLoading } = useAdminSessions(patientId);

  const sessions = useMemo(
    () =>
      statusFilter === "all"
        ? allSessions
        : allSessions.filter((s) => s.status === statusFilter),
    [allSessions, statusFilter],
  );

  // When filtering by patient, surface their name from the first matching row.
  const filterPatientName = patientId ? allSessions[0]?.patient_name ?? null : null;

  function select(id: string) {
    const base = patientId ? `/admin/sessions?patient_id=${patientId}` : "/admin/sessions";
    const sep = base.includes("?") ? "&" : "?";
    router.push(`${base}${sep}select=${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2121]">Sessions</h1>
        <p className="text-sm text-[#455858]">All recorded sessions across the platform</p>
        {patientId && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#12606A]/10 px-3 py-1 text-xs font-semibold text-[#12606A]">
            Viewing sessions for: {filterPatientName ?? patientId}
          </p>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          <FilterTabs options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
          <Card padding="none" className="overflow-hidden">
            {isLoading ? (
              <div className="p-10">
                <LoadingSpinner />
              </div>
            ) : sessions.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">No sessions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-[#455858]">
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Practitioner</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Analysis</th>
                      <th className="px-4 py-3">Avg Angle</th>
                      <th className="px-4 py-3">ROM Arc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => select(s.id)}
                        className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-[#12606A]/5 ${
                          selectId === s.id ? "bg-[#12606A]/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-[#1C2121]">
                          {s.patient_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[#455858]">{s.practitioner_name ?? "—"}</td>
                        <td className="px-4 py-3 text-[#455858] whitespace-nowrap">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <SessionStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.has_analysis ? (
                            <FiCheckCircle className="inline text-emerald-600" size={16} />
                          ) : (
                            <FiXCircle className="inline text-gray-300" size={16} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#455858]">{formatAngle(s.avg_angle)}</td>
                        <td className="px-4 py-3 text-[#455858]">{formatAngle(s.rom_arc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="w-full xl:w-96 shrink-0">
          {selectId ? (
            <SessionDetailPanel sessionId={selectId} />
          ) : (
            <Card className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">Select a session to view details</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
