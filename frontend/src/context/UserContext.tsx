"use client";

import React, { createContext, useContext, useState } from "react";
import { AuthResponse } from "@/types/user";
import { PatientProfile } from "@/types/patient";
import { PractitionerProfile } from "@/types/practitioner";

// AuthResponse merged with the role-specific profile fetched after login
export type UserProfile = AuthResponse & (
  | { role: "patient"; profile: PatientProfile }
  | { role: "practitioner"; profile: PractitionerProfile }
  | { role: "manager"; profile: null }
  | { role: "admin"; profile: null }
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUserProfile = (data: UserProfile) => {
    setUserProfileState(data);
  };

  // For after a profile update — merges changes without a re-fetch
  const updateProfile = (data: Partial<PatientProfile> | Partial<PractitionerProfile>) => {
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, ...data } as any,
      };
    });
  };

  const clearUserProfile = () => {
    setUserProfileState(null);
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