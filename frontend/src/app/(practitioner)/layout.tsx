"use client";
import React from "react";
import Topbar from "@/components/clinician/headers/Topbar";
import ProtectedRoute from "@/providers/ProtectedRoute";
import { useUser } from "@/context/UserContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile } = useUser();

  const username = userProfile?.user.name ?? "";
  const userTitle =
    userProfile?.role === "practitioner"
      ? (userProfile.profile.specialization ?? "Practitioner")
      : "Practitioner";

  return (
    <ProtectedRoute allowedRole="practitioner">
      <div className="bg-[#F1F5F8] w-full min-h-screen mx-auto">
          <Topbar username={username} userTitle={userTitle} />
          <main className="flex-1">
            {children}
          </main>
      </div>
    </ProtectedRoute>
  );
}