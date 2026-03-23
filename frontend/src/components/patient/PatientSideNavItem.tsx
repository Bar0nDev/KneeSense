"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

interface PatientSideNavItemProps {
  label: string;
  href: string;
  icon: IconType;
  onClick?: () => void;
}

export default function PatientSideNavItem({
  label,
  href,
  icon: Icon,
  onClick,
}: PatientSideNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "bg-[#C8E6E6] text-[#12606A] border-l-4 border-[#12606A]"
          : "text-[#4A5565] hover:bg-[#C8E6E6]/40 hover:text-[#455858]"
      }`}
    >
      <Icon
        size={18}
        className={`transition-colors duration-150 ${
          isActive ? "text-[#12606A]" : "text-[#99A1AF]"
        }`}
      />
      <span>{label}</span>
    </Link>
  );
}