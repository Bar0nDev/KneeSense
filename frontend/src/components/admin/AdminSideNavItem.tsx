"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

interface AdminSideNavItemProps {
  label: string;
  href: string;
  icon: IconType;
  onClick?: () => void;
}

export default function AdminSideNavItem({
  label,
  href,
  icon: Icon,
  onClick,
}: AdminSideNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "bg-white/30 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        size={18}
        className={`transition-colors duration-150 ${
          isActive ? "text-[#7FE9D9]" : "text-white/60"
        }`}
      />
      <span>{label}</span>
    </Link>
  );
}
