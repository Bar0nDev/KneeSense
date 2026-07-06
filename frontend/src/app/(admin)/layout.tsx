"use client";

import ProtectedRoute from "@/providers/ProtectedRoute";
import AdminSideNav from "@/components/admin/AdminSideNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="min-h-screen flex bg-[#F1F5F8]">
        <AdminSideNav />
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
