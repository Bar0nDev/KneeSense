import { PractitionerStatus, SessionStatus } from "@/types/admin";

const baseClass =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

const PRACTITIONER_COLORS: Record<PractitionerStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const SESSION_COLORS: Record<SessionStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export function PractitionerStatusBadge({ status }: { status: PractitionerStatus }) {
  return (
    <span className={`${baseClass} ${PRACTITIONER_COLORS[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function SessionStatusBadge({ status }: { status: SessionStatus | null }) {
  const s = status ?? "pending";
  return (
    <span className={`${baseClass} ${SESSION_COLORS[s] ?? SESSION_COLORS.pending}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`${baseClass} ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
