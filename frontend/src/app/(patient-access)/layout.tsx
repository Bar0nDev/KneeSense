"use client";

import ProtectedRoute from "@/providers/ProtectedRoute";
import { SessionDataProvider } from "@/context/SessionDataContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="patient">
      <SessionDataProvider>
        {children}
      </SessionDataProvider>
    </ProtectedRoute>
  );
}