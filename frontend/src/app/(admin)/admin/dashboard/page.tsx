"use client";

import { FaUserCheck, FaUsers } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/admin/StatCard";
import { useAdminPractitioners } from "@/hooks/useAdminPractitioners";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { formatDate } from "@/lib/adminFormat";

export default function AdminDashboardPage() {
  const { practitioners, isLoading: practLoading, approve, reject } = useAdminPractitioners();
  const { patients, isLoading: patientsLoading } = useAdminPatients();
  const { sessions, isLoading: sessionsLoading } = useAdminSessions();

  if (practLoading || patientsLoading || sessionsLoading) {
    return <LoadingSpinner />;
  }

  const pending = practitioners.filter((p) => p.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2121]">Dashboard</h1>
        <p className="text-sm text-[#455858]">Overview of the KneeSense platform</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Practitioners" value={practitioners.length} icon={FaUserCheck} />
        <StatCard label="Total Patients" value={patients.length} icon={FaUsers} />
        <StatCard label="Total Sessions" value={sessions.length} icon={FiActivity} />
      </div>

      {/* Pending approvals */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1C2121]">Pending Approvals</h2>
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
            {pending.length} pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-500">No practitioners awaiting approval.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {pending.map((p) => {
              const busy =
                (approve.isPending && approve.variables === p.id) ||
                (reject.isPending && reject.variables === p.id);
              return (
                <li
                  key={p.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C2121] truncate">
                      {p.name ?? "Unnamed practitioner"}
                    </p>
                    <p className="text-xs text-[#455858] truncate">
                      {p.email ?? "—"}
                      {p.clinic_name ? ` • ${p.clinic_name}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">Registered {formatDate(p.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve.mutate(p.id)}
                      disabled={busy}
                      className="rounded-lg border border-emerald-600 bg-transparent px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject.mutate(p.id)}
                      disabled={busy}
                      className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
