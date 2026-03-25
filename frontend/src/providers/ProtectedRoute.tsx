"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
  publicOnly?: boolean;
}

export default function ProtectedRoute({ children, allowedRole, publicOnly }: ProtectedRouteProps) {
  const { session, isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Public only page (login/register) — redirect logged in users to their dashboard
    if (publicOnly && isAuthenticated) {
      router.push(session!.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard");
      return;
    }

    // Protected page — redirect unauthenticated users to login
    if (!publicOnly && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Role mismatch — redirect to their correct dashboard
    if (!publicOnly && allowedRole && !hasRole(allowedRole)) {
      router.push(session!.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard");
    }
  }, [isAuthenticated, isLoading, router, allowedRole, publicOnly]);

  if (isLoading) return <LoadingSpinner />;

  if (publicOnly) return !isAuthenticated ? <>{children}</> : null;

  const isAuthorized = isAuthenticated && (!allowedRole || hasRole(allowedRole));
  return isAuthorized ? <>{children}</> : null;
}