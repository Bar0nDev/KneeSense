"use client";

import Card from "@/components/ui/Card";
import { SessionStatusBadge } from "@/components/admin/AdminBadge";
import { useAdminSession } from "@/hooks/useAdminSessions";
import { formatDate, formatAngle, formatPercent } from "@/lib/adminFormat";

interface Props {
  sessionId: string;
}

const ZONE_LABELS: Record<string, string> = {
  zone1: "Medial",
  zone2: "Central",
  zone3: "Lateral",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs text-[#455858] shrink-0">{label}</span>
      <span className="text-xs font-semibold text-[#1C2121] text-right">{value}</span>
    </div>
  );
}

export default function SessionDetailPanel({ sessionId }: Props) {
  const { data, isLoading, isError } = useAdminSession(sessionId);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading session…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-red-500">Could not load session.</p>;
  }

  const dominant = data.dominant_zone
    ? ZONE_LABELS[data.dominant_zone] ?? data.dominant_zone
    : "—";

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1C2121] truncate">
              {data.patient_name ?? "Unknown patient"}
            </p>
            <p className="text-xs text-[#455858]">{formatDate(data.created_at)}</p>
          </div>
          <SessionStatusBadge status={data.status} />
        </div>

        <div className="border-t border-gray-100 pt-2">
          <InfoRow label="Practitioner" value={data.practitioner_name ?? "—"} />
          <InfoRow label="Has Analysis" value={data.has_analysis ? "Yes" : "No"} />
          <InfoRow label="Has Insight" value={data.has_insight ? "Yes" : "No"} />
        </div>

        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs font-bold text-[#455858] uppercase tracking-wider mb-1">
            Angle Stats
          </p>
          <InfoRow label="Min Angle" value={formatAngle(data.min_angle)} />
          <InfoRow label="Max Angle" value={formatAngle(data.max_angle)} />
          <InfoRow label="Avg Angle" value={formatAngle(data.avg_angle)} />
          <InfoRow label="ROM Arc" value={formatAngle(data.rom_arc)} />
        </div>

        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs font-bold text-[#455858] uppercase tracking-wider mb-1">
            Zones
          </p>
          <InfoRow label="Medial (Zone 1)" value={formatPercent(data.zone1_avg)} />
          <InfoRow label="Central (Zone 2)" value={formatPercent(data.zone2_avg)} />
          <InfoRow label="Lateral (Zone 3)" value={formatPercent(data.zone3_avg)} />
          <InfoRow label="Dominant Zone" value={dominant} />
        </div>
      </Card>

      {(data.summary_text || data.insight_text || data.notes) && (
        <Card className="flex flex-col gap-3">
          {data.summary_text && (
            <div>
              <p className="text-xs font-bold text-[#455858] uppercase tracking-wider mb-1">
                Summary
              </p>
              <p className="text-xs text-[#1C2121] leading-relaxed">{data.summary_text}</p>
            </div>
          )}
          {data.insight_text && (
            <div>
              <p className="text-xs font-bold text-[#455858] uppercase tracking-wider mb-1">
                Insight
              </p>
              <p className="text-xs text-[#1C2121] leading-relaxed whitespace-pre-line">
                {data.insight_text}
              </p>
            </div>
          )}
          {data.notes && (
            <div>
              <p className="text-xs font-bold text-[#455858] uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-xs text-[#1C2121] leading-relaxed">{data.notes}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
