"use client";

import { useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUserCheck, FaUsers } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import { GiKneeCap } from "react-icons/gi";
import { IconType } from "react-icons";
import AdminSideNavItem from "@/components/admin/AdminSideNavItem";
import AdminUserMenu from "@/components/admin/AdminUserMenu";
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
    section: "OVERVIEW",
    links: [
      { label: "Dashboard", href: "/admin/dashboard", icon: MdSpaceDashboard },
    ],
  },
  {
    section: "MANAGEMENT",
    links: [
      { label: "Practitioners", href: "/admin/practitioners", icon: FaUserCheck },
      { label: "Patients", href: "/admin/patients", icon: FaUsers },
      { label: "Sessions", href: "/admin/sessions", icon: FiActivity },
    ],
  },
];

export default function AdminSideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useUser();

  const name = userProfile?.user.name ?? "";

  const sideNavContent = (
    <div className="flex flex-col h-full px-4">
      {/* Logo */}
      <div className="mb-11 flex items-center gap-0.5 text-white">
        <GiKneeCap size={29} />
        <div className="leading-none">
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-[#7FE9D9]">Knee</span>Sense
          </h1>
          <p className="mt-0 text-[10px] font-semibold uppercase tracking-widest text-white/60">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 space-y-6">
        {navSections.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.links.map((link) => (
                <li key={link.label}>
                  <AdminSideNavItem
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

      {/* Admin Footer */}
      <AdminUserMenu name={name} />
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
        className={`lg:hidden fixed top-0 left-0 z-40 flex flex-col w-64 h-full bg-gradient-to-b from-[#12606A] to-[#399195] py-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sideNavContent}
      </aside>

      {/* Desktop Sidenav — always visible */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 py-6 overflow-y-auto bg-gradient-to-b from-[#12606A] to-[#399195]">
        {sideNavContent}
      </aside>
    </>
  );
}
