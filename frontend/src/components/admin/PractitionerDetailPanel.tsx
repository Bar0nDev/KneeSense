"use client";

import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { PractitionerStatusBadge, ActiveBadge } from "@/components/admin/AdminBadge";
import { useAdminPractitioner, useAdminPractitioners } from "@/hooks/useAdminPractitioners";
import { formatDate } from "@/lib/adminFormat";

interface Props {
  practitionerId: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs text-[#455858] shrink-0">{label}</span>
      <span className="text-xs font-semibold text-[#1C2121] text-right truncate">{value}</span>
    </div>
  );
}

export default function PractitionerDetailPanel({ practitionerId }: Props) {
  const { data, isLoading, isError } = useAdminPractitioner(practitionerId);
  const { approve, reject } = useAdminPractitioners();

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading practitioner…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-red-500">Could not load practitioner.</p>;
  }

  const busy =
    (approve.isPending && approve.variables === data.id) ||
    (reject.isPending && reject.variables === data.id);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={data.name ?? ""} size={48} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1C2121] truncate">
              {data.name ?? "Unnamed practitioner"}
            </p>
            <p className="text-xs text-[#455858] truncate">{data.email ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#455858]">Status</span>
          <PractitionerStatusBadge status={data.status} />
        </div>

        <div className="border-t border-gray-100 pt-2">
          <InfoRow label="Clinic" value={data.clinic_name ?? "—"} />
          <InfoRow label="Specialization" value={data.specialization ?? "—"} />
          <InfoRow label="Patients" value={String(data.patient_count)} />
          <InfoRow label="Registered" value={formatDate(data.created_at)} />
        </div>

        {data.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => approve.mutate(data.id)}
              disabled={busy}
              className="flex-1 rounded-lg border border-emerald-600 bg-transparent px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => reject.mutate(data.id)}
              disabled={busy}
              className="flex-1 rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              Reject
            </button>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#1C2121]">
          Assigned Patients ({data.patients.length})
        </h3>
        {data.patients.length === 0 ? (
          <p className="text-xs text-gray-400">No patients assigned.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {data.patients.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1C2121] truncate">
                    {p.name ?? "Unnamed"}
                  </p>
                  <p className="text-xs text-gray-400">Registered {formatDate(p.created_at)}</p>
                </div>
                <ActiveBadge active={p.is_active} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
