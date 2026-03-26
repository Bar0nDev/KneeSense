"use client";
import { useState } from "react";
import Topbar from '@/components/clinician/headers/topbar';
import PList, { patients } from '@/components/clinician/list/patientList';
import PatientDetail from '@/components/clinician/list/patientDetail';

type Patient = typeof patients[0];

export default function Page() {
  const [selected, setSelected] = useState<Patient | null>(patients[0] || null);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#EFF1FE' }}>
      <Topbar
        profileImgUrl="/images/profile.jpg"
        username="Dr. Smith"
        userTitle="Clinician"
      />
      
      <main className="flex flex-1 overflow-hidden">
        <PList onSelect={setSelected} selectedId={selected?.id} />
        <div className="flex-1 overflow-y-auto bg-white/50 p-6"> 
          {selected ? (
            <PatientDetail patient={selected} />
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