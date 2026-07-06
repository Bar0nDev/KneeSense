"use client";

import { useState, useRef, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

interface AdminUserMenuProps {
  name: string;
}

export default function AdminUserMenu({ name }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative mt-6">
      {/* Floating menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-100 bg-white py-1 shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-50">
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
          >
            <FiLogOut size={16} />
            Log out
          </button>
        </div>
      )}

      {/* User row */}
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors duration-150">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={name} size={36} className="text-sm font-semibold" />
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-white/60">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Account options"
          className="p-1.5 rounded-md text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <HiDotsVertical size={18} />
        </button>
      </div>
    </div>
  );
}
