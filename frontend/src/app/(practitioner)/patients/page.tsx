"use client";
import { useState } from "react";
import PatientList from '@/components/clinician/list/PatientList';
import PatientDetail from '@/components/clinician/list/PatientDetail';
import { PatientListItem } from "@/services/patientService";

export default function Page() {
  const [selected, setSelected] = useState<PatientListItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleAssigned() {
    setSelected(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#EFF1FE' }}>
      <main className="flex flex-1 overflow-hidden">
        <PatientList onSelect={setSelected} selectedId={selected?.id} refreshKey={refreshKey} />
        <div className="flex-1 overflow-y-auto bg-white/50 p-6">
          {selected ? (
            <PatientDetail patient={selected} onAssigned={handleAssigned} />
          ) : (
            <div className="flex h-full items-center justify-center"
              style={{ color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}>
              Select a patient to view their details
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
