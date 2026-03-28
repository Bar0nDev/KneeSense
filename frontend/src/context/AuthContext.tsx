"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse, UserRole } from "@/types/user";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { useUser } from "@/context/UserContext";
import { buildUserProfile } from "@/context/UserContext";

interface AuthContextType {
  session: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: any, role: "patient" | "practitioner") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    // Ready for JWT: localStorage.setItem("access_token", data.access_token)
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem("session");
    // Ready for JWT: localStorage.removeItem("access_token")
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!session) return false;
    if (Array.isArray(role)) return role.includes(session.role);
    return session.role === role;
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. LOGIN — get session data (user_id, role, profile_id)
      const sessionData = await userService.login(username, password);
      saveSession(sessionData);

      // 2. FETCH full user + role-specific profile → UserContext
      const built = await buildUserProfile(sessionData);
      if (built) setUserProfile(built);

      router.push(sessionData.role === "practitioner" ? "/practitioner-dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any, role: "patient" | "practitioner") => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. CREATE ACCOUNT
      await userService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role,
      });

      // 2. LOGIN TO GET SESSION
      const sessionData = await userService.login(formData.username, formData.password);
      saveSession(sessionData);

      // 3. UPDATE ROLE-SPECIFIC PROFILE
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

      // 4. FETCH full user + role-specific profile → UserContext
      const built = await buildUserProfile(sessionData);
      if (built) setUserProfile(built);

      router.push(role === "patient" ? "/dashboard" : "/practitioner-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    clearUserProfile();
    // Clear React Query localStorage cache so next user gets fresh data
    localStorage.removeItem("kneesense-query-cache");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        error,
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