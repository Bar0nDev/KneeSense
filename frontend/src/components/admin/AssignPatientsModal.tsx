"use client";

import { useMemo, useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAdminPatients } from "@/hooks/useAdminPatients";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  practitionerId: string;
}

const searchClass =
  "w-full rounded-xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20";

export default function AssignPatientsModal({ isOpen, onClose, practitionerId }: Props) {
  const { patients, isLoading, assign } = useAdminPatients();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Only offer active patients not already assigned to this practitioner.
  const assignable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
      .filter((p) => p.is_active && p.practitioner_id !== practitionerId)
      .filter((p) => (q ? (p.name ?? "").toLowerCase().includes(q) : true));
  }, [patients, practitionerId, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (selected.size === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        [...selected].map((id) => assign.mutateAsync({ id, practitionerId })),
      );
      onClose();
    } catch (err) {
      console.error("Failed to assign patients", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Patients"
      footer={
        <>
          <PrimaryButton variant="ghost" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? "Assigning…" : `Assign${selected.size ? ` (${selected.size})` : ""}`}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <input
          className={searchClass}
          placeholder="Search patients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
          ) : assignable.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No patients available to assign.</p>
          ) : (
            assignable.map((p) => {
              const isSelected = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "border-[#12606A] bg-[#12606A]/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C2121] truncate">
                      {p.name ?? "Unnamed"}
                    </p>
                    <p className="text-xs text-[#455858] truncate">
                      {p.practitioner_name ? `Currently: ${p.practitioner_name}` : "Unassigned"}
                    </p>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                      isSelected
                        ? "border-[#12606A] bg-[#12606A] text-white"
                        : "border-gray-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </AdminModal>
  );
}
