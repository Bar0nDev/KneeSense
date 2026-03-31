"use client";

import ProtectedRoute from "@/providers/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="patient">
      {children}
    </ProtectedRoute>
  );
}