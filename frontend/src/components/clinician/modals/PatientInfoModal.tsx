"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
};

interface FullPatient {
  id: string;
  name: string;
  birthday: string | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  user_id: number | null;
  practitioner_id: number | null;
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value ?? "—"}</span>
    </div>
  );
}

function formatDate(val: string | null | undefined) {
  if (!val) return null;
  return new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function PatientInfoModal({ isOpen, onClose, patientId }: Props) {
  const { data: patient, isLoading } = useQuery<FullPatient>({
    queryKey: ["patient-full", patientId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/patients/${patientId}`);
      return data;
    },
    enabled: isOpen && !!patientId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">

        {/* Header */}
        <h2 className="text-2xl font-extrabold text-center text-[#12606A] tracking-tight">
          Patient Info
        </h2>
        <div className="h-1 w-full bg-[#12606A] mt-4 mb-6 rounded-full" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">Loading...</div>
        ) : patient ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Row label="Full Name"        value={patient.name} />
              <Row label="Sex"              value={patient.sex} />
              <Row label="Date of Birth"    value={formatDate(patient.birthday)} />
              <Row label="Height"           value={patient.height_cm != null ? `${patient.height_cm} cm` : null} />
              <Row label="Weight"           value={patient.weight_kg != null ? `${patient.weight_kg} kg` : null} />
              <Row label="Status"           value={patient.is_active ? "Active" : "Inactive"} />
              <Row label="Patient ID"       value={patient.id} />
              <Row label="Enrolled"         value={formatDate(patient.created_at)} />
            </div>

            {patient.notes && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</span>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{patient.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 py-10">Could not load patient data.</div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[#12606A] text-[#12606A] text-sm font-bold hover:bg-[#12606A] hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
