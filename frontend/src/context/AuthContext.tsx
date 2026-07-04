"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  type User as FirebaseUser,
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
  // True while login()/register() run their own fetch + navigation — tells the
  // onAuthStateChanged listener to stand down so it doesn't fetch the profile twice.
  const isAuthenticating = useRef(false);
  const { setUserProfile, clearUserProfile } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Rehydrate session on page refresh via Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Skip while login()/register() are running — they set the session themselves
        if (isAuthenticating.current) {
          setIsLoading(false);
          return;
        }
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
    isAuthenticating.current = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const sessionData = await userService.getProfile();
      const built = await buildUserProfile(sessionData);
      setSession(sessionData);
      if (built) setUserProfile(built);
      router.push(sessionData.role === "practitioner" ? "/analytics" : "/dashboard");
    } finally {
      isAuthenticating.current = false;
    }
  };

  // Throws on failure — callers handle errors locally
  const register = async (formData: any, role: "patient" | "practitioner") => {
    isAuthenticating.current = true;
    let createdUser: FirebaseUser | null = null;
    try {
    // Create Firebase Auth user first
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    createdUser = userCredential.user;
    // Get token directly from the credential — auth.currentUser may not be set yet in the SDK
    const freshToken = await createdUser.getIdToken();

    // Register profile in backend — pass the fresh token explicitly to avoid the auth.currentUser race
    await userService.register({
      name: formData.name,
      email: formData.email,
      role,
    }, freshToken);

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
    } catch (err) {
      // Backend registration failed after the Firebase user was created — delete it
      // so the email isn't permanently locked (auth/email-already-in-use) on retry.
      if (createdUser) {
        try {
          await createdUser.delete();
        } catch {
          // Cleanup is best-effort; surface the original error regardless.
        }
      }
      throw err;
    } finally {
      isAuthenticating.current = false;
    }
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
