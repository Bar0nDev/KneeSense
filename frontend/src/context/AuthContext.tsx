"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse, UserRole } from "@/types/user";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { useUser, buildUserProfile } from "@/context/UserContext";

interface AuthContextType {
  session: AuthResponse | null;
  isRehydrating: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: any, role: "patient" | "practitioner") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUserProfile, clearUserProfile } = useUser();
  const router = useRouter();

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
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem("session");
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!session) return false;
    if (Array.isArray(role)) return role.includes(session.role);
    return session.role === role;
  };

  // Throws on failure — callers handle errors and loading state locally
  const login = async (username: string, password: string) => {
    const sessionData = await userService.login(username, password);
    const built = await buildUserProfile(sessionData);

    // Only persist session after full profile is ready — prevents half-auth state
    saveSession(sessionData);
    if (built) setUserProfile(built);

    router.push(sessionData.role === "practitioner" ? "/analytics" : "/dashboard");
  };

  // Throws on failure — callers handle errors locally
  const register = async (formData: any, role: "patient" | "practitioner") => {
    await userService.register({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role,
    });

    const sessionData = await userService.login(formData.username, formData.password);

    if (!sessionData.profile_id) throw new Error("No profile_id returned after login.");

    if (role === "patient") {
      await userService.updatePatientProfile(sessionData.profile_id, {
        name: formData.name || "",
        birthday: formData.birthday || null,
        sex: formData.sex || "",
        height_cm: formData.height_cm ?? null,
        weight_kg: formData.weight_kg ?? null,
        practitioner_id: null,
        notes: "",
        is_active: true,
      });
    } else {
      await userService.updatePractitionerProfile(sessionData.profile_id, {
        clinic_name: formData.clinic_name || "",
        specialization: formData.specialization || "",
      });
    }

    const built = await buildUserProfile(sessionData);

    // Only persist session after full profile is ready
    saveSession(sessionData);
    if (built) setUserProfile(built);

    router.push(role === "patient" ? "/dashboard" : "/analytics");
  };

  const logout = () => {
    clearSession();
    clearUserProfile();
    localStorage.removeItem("kneesense-query-cache");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isRehydrating: isLoading,
        isAuthenticated: !!session,
        hasRole,
        login,
        register,
        logout,
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
