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
      <div className="min-h-screen flex justify-center bg-[#F1F5F8]">
        <div className="flex w-full max-w-screen-2xl min-h-screen">
          <AdminSideNav />
          <main className="flex-1 p-6 border border-1 border-gray-200 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
