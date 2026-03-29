import React from "react";
import Topbar from "@/components/clinician/headers/topbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F1F5F8] w-full min-h-screen mx-auto">
        <Topbar username="Dr. Smith" userTitle="Clinician" />
        <main className="flex-1">
          {children}
        </main>
    </div>
  );
}