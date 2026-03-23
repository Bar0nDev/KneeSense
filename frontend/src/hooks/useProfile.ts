"use client";

import { useState } from "react";

export type Tab = "personal" | "medical" | "logout";

export const mockProfile = {
  name: "Kevin Chen",
  role: "Patient",
  initials: "KC",
  location: "Taichung, Taiwan",
  personal: {
    firstName: "Kevin",
    lastName: "Chen",
    email: "kevin.chen@email.com",
    phone: "+886 912 345 678",
    dateOfBirth: "March 15, 1990",
    affectedKnee: "Left",
  },
  medical: {
    practitioner: "Dr. Jane Doe, MD",
    clinic: "Taichung General Hospital",
    practitionerCode: "PRC-20260101",
    joinedDate: "December 27, 2025",
  },
};

export function useProfile() {
  const [tab, setTab] = useState<Tab>("personal");

  return {
    tab,
    setTab,
    profile: mockProfile,
  };
}