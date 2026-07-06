"use client";

import { useMemo, useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { PractitionerStatusBadge } from "@/components/admin/AdminBadge";
import { useAdminPractitioners } from "@/hooks/useAdminPractitioners";
import { useAdminPatients } from "@/hooks/useAdminPatients";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  currentPractitionerId: string | null;
}

const searchClass =
  "w-full rounded-xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20";

export default function AssignPractitionerModal({
  isOpen,
  onClose,
  patientId,
  currentPractitionerId,
}: Props) {
  const { practitioners, isLoading } = useAdminPractitioners();
  const { assign } = useAdminPatients();
  const [selected, setSelected] = useState<string | null>(currentPractitionerId);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return practitioners;
    return practitioners.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.clinic_name ?? "").toLowerCase().includes(q),
    );
  }, [practitioners, search]);

  async function handleSave() {
    try {
      await assign.mutateAsync({ id: patientId, practitionerId: selected });
      onClose();
    } catch (err) {
      console.error("Failed to assign practitioner", err);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Practitioner"
      footer={
        <>
          <PrimaryButton variant="ghost" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={handleSave} disabled={assign.isPending}>
            {assign.isPending ? "Saving…" : "Save"}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <input
          className={searchClass}
          placeholder="Search practitioners…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => setSelected(null)}
          className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
            selected === null
              ? "border-[#12606A] bg-[#12606A]/5"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="text-sm font-semibold text-gray-500">Unassigned</span>
          {selected === null && <span className="text-xs font-bold text-[#12606A]">Selected</span>}
        </button>

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No practitioners found.</p>
          ) : (
            filtered.map((p) => {
              const isSelected = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "border-[#12606A] bg-[#12606A]/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C2121] truncate">
                      {p.name ?? "Unnamed"}
                    </p>
                    <p className="text-xs text-[#455858] truncate">{p.clinic_name ?? "—"}</p>
                  </div>
                  <PractitionerStatusBadge status={p.status} />
                </button>
              );
            })
          )}
        </div>
      </div>
    </AdminModal>
  );
}
