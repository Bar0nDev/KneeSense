"use client";

import { useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { IoBarChart } from "react-icons/io5";
import { HiOutlineRefresh, HiOutlineDotsHorizontal, HiMenu, HiX } from "react-icons/hi";
import { FaInbox } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";
import { GiKneeCap } from "react-icons/gi";
import { IconType } from "react-icons";
import PatientSideNavItem from "@/components/patient/PatientSideNavItem";
import Avatar from "@/components/ui/Avatar";
import { useUser } from "@/context/UserContext";

interface NavLink {
  label: string;
  href: string;
  icon: IconType;
}

interface NavSection {
  section: string;
  links: NavLink[];
}

const navSections: NavSection[] = [
  {
    section: "GENERAL",
    links: [
      { label: "Dashboard", href: "/dashboard", icon: MdSpaceDashboard },
      { label: "My Progress", href: "/progress", icon: IoBarChart },
      { label: "Rehabilitation", href: "/rehabilitation", icon: HiOutlineRefresh },
      { label: "Inbox", href: "/inbox", icon: FaInbox },
    ],
  },
  {
    section: "ACCOUNT",
    links: [
      { label: "Profile", href: "/profile", icon: FaUserAlt },
    ],
  },
];

export default function PatientSideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useUser();

  // Safely extract patient-specific fields
  const name = userProfile?.role === "patient" ? userProfile.profile.name : "";
  const role = userProfile?.role ?? "";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const sideNavContent = (
    <div className="flex flex-col h-full px-4">
      {/* Logo */}
      <div className="mb-11 flex items-center gap-0.5 text-[#12606A]">
        <GiKneeCap size={29} />
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-[#30C3B1]">Knee</span>Sense
        </h1>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 space-y-6">
        {navSections.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-[#455858] uppercase tracking-widest mb-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.links.map((link) => (
                <li key={link.label}>
                  <PatientSideNavItem
                    label={link.label}
                    href={link.href}
                    icon={link.icon}
                    onClick={() => setIsOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Patient Footer */}
      <div className="flex items-center justify-between mt-6 p-3 rounded-lg hover:bg-[#C8E6E6]/40 cursor-pointer transition-colors duration-150">
        <div className="flex items-center gap-3">
          <Avatar
            name={name}
            size={36}
            className="text-sm font-semibold"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-[#455858]">{roleLabel}</p>
          </div>
        </div>
        <HiOutlineDotsHorizontal size={18} className="text-[#455858]" />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#FDFDFD] shadow-md text-[#12606A]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <HiX size={22} /> : <HiMenu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-40 flex flex-col w-64 h-full bg-white py-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sideNavContent}
      </aside>

      {/* Desktop Sidenav — always visible */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 py-6 overflow-y-auto">
        {sideNavContent}
      </aside>
    </>
  );
}