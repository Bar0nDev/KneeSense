"use client";
import ProtectedRoute from "@/providers/ProtectedRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute publicOnly>
    <div className="min-h-screen flex justify-center ">
      <div className="flex w-full min-h-screen ">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
