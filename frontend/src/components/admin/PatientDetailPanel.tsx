"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { ActiveBadge, SessionStatusBadge } from "@/components/admin/AdminBadge";
import { useAdminPatient } from "@/hooks/useAdminPatients";
import { formatDate, formatAngle } from "@/lib/adminFormat";

interface Props {
  patientId: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs text-[#455858] shrink-0">{label}</span>
      <span className="text-xs font-semibold text-[#1C2121] text-right truncate">{value}</span>
    </div>
  );
}

export default function PatientDetailPanel({ patientId }: Props) {
  const { data, isLoading, isError } = useAdminPatient(patientId);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading patient…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-red-500">Could not load patient.</p>;
  }

  const heightWeight = [
    data.height_cm != null ? `${data.height_cm} cm` : null,
    data.weight_kg != null ? `${data.weight_kg} kg` : null,
  ]
    .filter(Boolean)
    .join(" • ") || "—";

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={data.name ?? ""} size={48} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1C2121] truncate">
              {data.name ?? "Unnamed patient"}
            </p>
            <p className="text-xs text-[#455858] truncate">{data.email ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#455858]">Status</span>
          <ActiveBadge active={data.is_active} />
        </div>

        <div className="border-t border-gray-100 pt-2">
          <InfoRow label="Birthday" value={data.birthday ?? "—"} />
          <InfoRow label="Sex" value={data.sex ?? "—"} />
          <InfoRow label="Height / Weight" value={heightWeight} />
          <InfoRow label="Practitioner" value={data.practitioner_name ?? "Unassigned"} />
          <InfoRow label="Registered" value={formatDate(data.created_at)} />
        </div>

        {data.notes && (
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs text-[#455858] mb-1">Notes</p>
            <p className="text-xs text-[#1C2121]">{data.notes}</p>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#1C2121]">Sessions ({data.sessions.length})</h3>
        {data.sessions.length === 0 ? (
          <p className="text-xs text-gray-400">No sessions recorded.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {data.sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/sessions?select=${s.id}`}
                  className="flex items-center justify-between gap-3 py-2 -mx-2 px-2 rounded-md hover:bg-[#12606A]/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1C2121]">{formatDate(s.created_at)}</p>
                    <p className="text-[11px] text-[#455858]">
                      {s.has_analysis
                        ? `Min ${formatAngle(s.min_angle)} · Max ${formatAngle(s.max_angle)} · ROM ${formatAngle(s.rom_arc)}`
                        : "No analysis"}
                    </p>
                  </div>
                  <SessionStatusBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
