"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse } from "@/types/user";
import { User } from "@/types/user";
import { PatientProfile } from "@/types/patient";
import { PractitionerProfile } from "@/types/practitioner";
import { userService } from "@/services/userService";

// AuthResponse (session) + full User + role-specific profile
export type UserProfile = AuthResponse & (
  | { role: "patient"; user: User; profile: PatientProfile }
  | { role: "practitioner"; user: User; profile: PractitionerProfile }
  | { role: "manager"; user: User; profile: null }
  | { role: "admin"; user: User; profile: null }
);

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setUserProfile: (data: UserProfile) => void;
  updateProfile: (data: Partial<PatientProfile> | Partial<PractitionerProfile>) => void;
  clearUserProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On page refresh: try localStorage first, then fall back to API fetch
  useEffect(() => {
    const rehydrate = async () => {
      setError(null);

      // 1. Try localStorage — avoids API calls on every refresh
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfileState(JSON.parse(savedProfile));
        setIsLoading(false);
        return;
      }

      // 2. No cached profile — re-fetch from API using saved session
      const savedSession = localStorage.getItem("session");
      if (!savedSession) {
        setIsLoading(false);
        return;
      }

      try {
        const session: AuthResponse = JSON.parse(savedSession);
        const built = await buildUserProfile(session);
        if (built) {
          setUserProfileState(built);
          localStorage.setItem("userProfile", JSON.stringify(built));
        }
      } catch (err: any) {
        setError("Failed to load user profile.");
        setUserProfileState(null);
      } finally {
        setIsLoading(false);
      }
    };

    rehydrate();
  }, []);

  const setUserProfile = (data: UserProfile) => {
    setUserProfileState(data);
    localStorage.setItem("userProfile", JSON.stringify(data));
  };

  const updateProfile = (data: Partial<PatientProfile> | Partial<PractitionerProfile>) => {
    setUserProfileState((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        profile: { ...prev.profile, ...data } as any,
      };
      localStorage.setItem("userProfile", JSON.stringify(updated));
      return updated;
    });
  };

  const clearUserProfile = () => {
    setUserProfileState(null);
    localStorage.removeItem("userProfile");
  };

  return (
    <UserContext.Provider value={{ userProfile, isLoading, error, setUserProfile, updateProfile, clearUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

// Shared helper — used by UserContext rehydration and AuthContext after login
export async function buildUserProfile(session: AuthResponse): Promise<UserProfile | null> {
  if (session.role === "patient") {
    const [user, profile] = await Promise.all([
      userService.getUser(session.user_id),
      userService.getPatientProfile(session.user_id),
    ]);
    return { ...session, role: "patient", user, profile };
  }

  if (session.role === "practitioner") {
    if (!session.profile_id) throw new Error("Practitioner has no profile.");
    const [user, profile] = await Promise.all([
      userService.getUser(session.user_id),
      userService.getPractitionerProfile(session.profile_id),
    ]);
    return { ...session, role: "practitioner", user, profile };
  }

  if (session.role === "manager" || session.role === "admin") {
    const user = await userService.getUser(session.user_id);
    return { ...session, user, profile: null } as UserProfile;
  }

  return null;
}