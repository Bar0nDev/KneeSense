"use client";

import { useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { AdminPatientDetail, AdminPatientUpdate } from "@/types/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: AdminPatientDetail;
}

const inputClass =
  "w-full rounded-xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-[#455858]";

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

export default function EditPatientModal({ isOpen, onClose, patient }: Props) {
  const { update } = useAdminPatients();

  const [name, setName] = useState(patient.name ?? "");
  const [birthday, setBirthday] = useState(patient.birthday ?? "");
  const [sex, setSex] = useState(patient.sex ?? "");
  const [heightCm, setHeightCm] = useState(patient.height_cm != null ? String(patient.height_cm) : "");
  const [weightKg, setWeightKg] = useState(patient.weight_kg != null ? String(patient.weight_kg) : "");
  const [notes, setNotes] = useState(patient.notes ?? "");

  async function handleSave() {
    const payload: AdminPatientUpdate = {
      name: name.trim(),
      birthday: birthday || null,
      sex: sex || null,
      height_cm: toNumberOrNull(heightCm),
      weight_kg: toNumberOrNull(weightKg),
      notes: notes || null,
    };
    try {
      await update.mutateAsync({ id: patient.id, payload, userId: patient.user_id });
      onClose();
    } catch (err) {
      console.error("Failed to update patient", err);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Patient"
      footer={
        <>
          <PrimaryButton variant="ghost" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={handleSave} disabled={update.isPending || name.trim() === ""}>
            {update.isPending ? "Saving…" : "Save Changes"}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            className={`${inputClass} cursor-not-allowed opacity-60`}
            value={patient.email ?? "—"}
            disabled
            readOnly
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Email is the login identity and can&apos;t be edited here.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Birthday</label>
            <input
              type="date"
              className={inputClass}
              value={birthday ?? ""}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Sex</label>
            <select className={inputClass} value={sex ?? ""} onChange={(e) => setSex(e.target.value)}>
              <option value="">—</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input
              type="number"
              className={inputClass}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </AdminModal>
  );
}
