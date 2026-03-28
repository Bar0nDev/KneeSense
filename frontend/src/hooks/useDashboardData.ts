"use client";

import { useState, useEffect } from "react";

export function useDashboardData() {
  const [data, setData] = useState({
    patient: {
      name: "Kevin",
      lastSession: "-",
    },
    practitioner: {
      name: "Dr. Jane Doe, MD",
      role: "Physician",
      initials: "JD",
      image: null,
    },
    tasks: {
      session: {
        title: "Mar 21, 2026",
        subtitle: "TODAY",
      },
      rehab: {
        title: "4-step Anti-frailty",
        subtitle: "Complete your daily exercises",
      }
    },
    isLoading: false // turned loading off
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(prev => ({ ...prev, isLoading: false }));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return data;
}