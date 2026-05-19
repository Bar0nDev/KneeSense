"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse, UserRole } from "@/types/user";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { useUser, buildUserProfile } from "@/context/UserContext";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

interface AuthContextType {
  session: AuthResponse | null;
  isRehydrating: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any, role: "patient" | "practitioner") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUserProfile, clearUserProfile } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Rehydrate session on page refresh via Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const sessionData = await userService.getProfile();
          const built = await buildUserProfile(sessionData);
          setSession(sessionData);
          if (built) setUserProfile(built);
        } catch (err: any) {
          // 404 means registration is still in progress — don't sign out
          if (err?.response?.status !== 404) {
            await signOut(auth);
          }
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!session) return false;
    if (Array.isArray(role)) return role.includes(session.role);
    return session.role === role;
  };

  // Throws on failure — callers handle errors and loading state locally
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    const sessionData = await userService.getProfile();
    const built = await buildUserProfile(sessionData);
    setSession(sessionData);
    if (built) setUserProfile(built);
    router.push(sessionData.role === "practitioner" ? "/analytics" : "/dashboard");
  };

  // Throws on failure — callers handle errors locally
  const register = async (formData: any, role: "patient" | "practitioner") => {
    // Create Firebase Auth user first
    await createUserWithEmailAndPassword(auth, formData.email, formData.password);

    // Register profile in backend (token is attached automatically by apiClient)
    await userService.register({
      name: formData.name,
      email: formData.email,
      role,
    });

    const sessionData = await userService.getProfile();
    if (!sessionData.profile_id) throw new Error("No profile_id returned after registration.");

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
    setSession(sessionData);
    if (built) setUserProfile(built);
    router.push(role === "patient" ? "/dashboard" : "/analytics");
  };

  const logout = async () => {
    await signOut(auth);
    setSession(null);
    clearUserProfile();
    queryClient.clear();
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
