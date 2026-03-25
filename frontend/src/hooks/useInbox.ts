"use client";

import { useState, useMemo } from "react";

export interface Message {
  id: number;
  from: string;
  role: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Great progress on your last session!",
    preview: "I reviewed your Feb 28 recording. Your knee flexion has improved significantly. Keep up the consistency with your daily rehab exercises.",
    time: "Mar 10, 2026",
    read: false,
  },
  {
    id: 2,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Adjustment to your rehab plan",
    preview: "Based on your zone balance score, I've updated your rehab routine to include more lateral strengthening exercises. Please check your Rehabilitation page.",
    time: "Mar 5, 2026",
    read: false,
  },
  {
    id: 3,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Next session reminder",
    preview: "Just a reminder that your next scheduled session is on Mar 21, 2026. Please ensure your device is charged and ready before recording.",
    time: "Feb 28, 2026",
    read: true,
  },
  {
    id: 4,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Welcome to KneeSense!",
    preview: "Welcome to your rehabilitation journey. I'll be monitoring your progress through this platform. Don't hesitate to reach out if you have any concerns.",
    time: "Dec 27, 2025",
    read: true,
  },
  {
    id: 5,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Device calibration check",
    preview: "Please make sure your KneeSense device is properly calibrated before your next session. Follow the steps in the app.",
    time: "Dec 10, 2025",
    read: true,
  },
  {
    id: 6,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Holiday break schedule",
    preview: "Just a note that I will be unavailable from Dec 24 to Jan 2. Please continue your rehab exercises during the break.",
    time: "Dec 5, 2025",
    read: true,
  },
  {
    id: 7,
    from: "Dr. Jane Doe, MD",
    role: "Physician",
    initials: "JD",
    subject: "Regarding your pain report",
    preview: "I saw your note about mild discomfort during extension. This is normal at your stage. Reduce reps if pain exceeds 4/10.",
    time: "Nov 28, 2025",
    read: true,
  },
];

export function useInbox(pageSize = 5) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_MESSAGES.filter((msg) => {
      const matchesSearch =
        msg.subject.toLowerCase().includes(search.toLowerCase()) ||
        msg.from.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && !msg.read) ||
        (filter === "Read" && msg.read);
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const unreadCount = MOCK_MESSAGES.filter((m) => !m.read).length;

  return {
    messages: paginated,
    unreadCount,
    search,
    setSearch: (val: string) => { setSearch(val); setPage(1); },
    filter,
    setFilter: (f: string) => { setFilter(f); setPage(1); },
    page,
    setPage,
    totalPages,
    totalFiltered: filtered.length,
  };
}