"use client";

import { useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAdminPractitioners } from "@/hooks/useAdminPractitioners";
import { AdminPractitionerDetail, AdminPractitionerUpdate } from "@/types/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  practitioner: AdminPractitionerDetail;
}

const inputClass =
  "w-full rounded-xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-[#455858]";

export default function EditPractitionerModal({ isOpen, onClose, practitioner }: Props) {
  const { update } = useAdminPractitioners();

  const [name, setName] = useState(practitioner.name ?? "");
  const [clinicName, setClinicName] = useState(practitioner.clinic_name ?? "");
  const [specialization, setSpecialization] = useState(practitioner.specialization ?? "");

  async function handleSave() {
    const payload: AdminPractitionerUpdate = {
      clinic_name: clinicName || null,
      specialization: specialization || null,
    };
    const trimmedName = name.trim();
    const nameChanged = trimmedName !== (practitioner.name ?? "");
    try {
      await update.mutateAsync({
        id: practitioner.id,
        payload,
        name: nameChanged ? trimmedName : undefined,
        userId: practitioner.user_id,
      });
      onClose();
    } catch (err) {
      console.error("Failed to update practitioner", err);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Practitioner"
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
            value={practitioner.email ?? "—"}
            disabled
            readOnly
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Email is the login identity and can&apos;t be edited here.
          </p>
        </div>

        <div>
          <label className={labelClass}>Clinic Name</label>
          <input
            className={inputClass}
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Specialization</label>
          <input
            className={inputClass}
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
        </div>
      </div>
    </AdminModal>
  );
}
