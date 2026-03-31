import React from "react";
import Topbar from "@/components/clinician/headers/topbar";
import ProtectedRoute from "@/providers/ProtectedRoute";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRole="practitioner">
      <div className="bg-[#F1F5F8] w-full min-h-screen mx-auto">
          <Topbar username="Dr. Smith" userTitle="Clinician" />
          <main className="flex-1">
            {children}
          </main>
      </div>
    </ProtectedRoute>
  );
}