"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse, UserRole } from "@/types/user";

interface AuthContextType {
  session: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  saveSession: (data: AuthResponse) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on page refresh
  useEffect(() => {
    const saved = localStorage.getItem("session");
    if (saved) {
      setSession(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (data: AuthResponse) => {
    setSession(data);
    localStorage.setItem("session", JSON.stringify(data));
    // Ready for JWT: localStorage.setItem("access_token", data.access_token)
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem("session");
    // Ready for JWT: localStorage.removeItem("access_token")
  };

  // Check if current user has a required role
  // Usage: hasRole("admin") or hasRole(["admin", "manager"])
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!session) return false;
    if (Array.isArray(role)) return role.includes(session.role);
    return session.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        hasRole,
        saveSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};