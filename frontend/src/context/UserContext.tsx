"use client";

import React, { createContext, useContext, useState } from "react";
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
  setUserProfile: (data: UserProfile) => void;
  updateProfile: (data: Partial<PatientProfile> | Partial<PractitionerProfile>) => void;
  clearUserProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Pure in-memory store for the current user's profile. The single source of truth
// for rehydration is AuthContext's onAuthStateChanged listener, which fetches the
// profile on refresh and pushes it here via setUserProfile.
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);

  const setUserProfile = (data: UserProfile) => setUserProfileState(data);

  const updateProfile = (data: Partial<PatientProfile> | Partial<PractitionerProfile>) => {
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return { ...prev, profile: { ...prev.profile, ...data } as any };
    });
  };

  const clearUserProfile = () => setUserProfileState(null);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, updateProfile, clearUserProfile }}>
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