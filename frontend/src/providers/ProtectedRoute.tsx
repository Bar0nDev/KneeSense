"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "patient" | "practitioner" | "admin";
  publicOnly?: boolean; 
}

export default function ProtectedRoute({ children, allowedRole, publicOnly }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If it's a public only page (Login/Register) and user IS logged in
    if (publicOnly && user) {
      const home = user.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard";
      router.push(home);
      return;
    }

    // If it's a Protected page and user is NOT logged in
    if (!publicOnly && !user) {
      router.push("/login");
      return;
    }

    // Role mismatch logic
    if (!publicOnly && allowedRole && user?.role !== allowedRole) {
      const redirectPath = user?.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard";
      router.push(redirectPath);
    }
  }, [user, isLoading, router, allowedRole, publicOnly]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Determine if content should render
  if (publicOnly) {
    return !user ? <>{children}</> : null;
  }

  const isAuthorized = user && (!allowedRole || user.role === allowedRole);
  return isAuthorized ? <>{children}</> : null;
}