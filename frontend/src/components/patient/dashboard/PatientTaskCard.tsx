"use client";

import { IconType } from "react-icons";
import { BsClipboardCheck, BsLightningCharge } from "react-icons/bs";
import { LuMoveRight } from "react-icons/lu";
import { ReactNode } from "react";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface TaskConfig {
  label: string;
  buttonContent: ReactNode;
  icon: IconType;
  textColor: string;
  borderColor: string;
  bgSoft: string;
  hoverColor: string;
  path: string; // Added to handle navigation
}

const TASK_CONFIG: Record<"session" | "rehab", TaskConfig> = {
  session: {
    label: "YOUR NEXT SESSION",
    buttonContent: "Start Session",
    icon: BsClipboardCheck,
    textColor: "text-[#27AE60]",
    borderColor: "border-[#27AE60]",
    bgSoft: "bg-[#27AE60]/10",
    hoverColor: "hover:bg-[#27AE60]/5",
    path: "/recording",
  },
  rehab: {
    label: "START DAILY REHAB",
    buttonContent: (
      <span className="flex items-center justify-center gap-1">
        Begin
        <LuMoveRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    ),
    icon: BsLightningCharge,
    textColor: "text-[#3543A3]",
    borderColor: "border-[#3543A3]",
    bgSoft: "bg-[#3543A3]/10",
    hoverColor: "hover:bg-[#3543A3]/5",
    path: "/rehabilitation",
  },
};

interface PatientTaskCardProps {
  type: "session" | "rehab";
  title: string;
  subtitle: string;
}

export default function PatientTaskCard({
  type,
  title,
  subtitle,
}: PatientTaskCardProps) {
  const router = useRouter();
  const {
    label,
    buttonContent,
    icon: Icon,
    textColor,
    borderColor,
    bgSoft,
    hoverColor,
    path,
  } = TASK_CONFIG[type];

  return (
    <Card className={`flex flex-col h-full gap-3`}>
      
      {/* Label */}
      <p className="text-[10px] font-bold text-[#455858]/60 uppercase tracking-[0.15em]">
        {label}
      </p>

      {/* Icon + Info */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bgSoft} transition-transform group-hover:scale-105`}
        >
          <Icon size={22} className={textColor} />
        </div>

        <div className="leading-tight">
          <p className="text-[15px] font-bold text-[#1C2121]">{title}</p>
          <p className="text-xs text-[#455858] mt-1 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Button */}
      <div className="mt-auto pt-2">
        <button
          onClick={() => router.push(path)}
          className={`
            group w-full rounded-xl border bg-transparent px-5 py-3 text-sm font-bold
            transition-all duration-200 active:scale-[0.97] cursor-pointer
            flex items-center justify-center gap-2
            ${textColor} ${borderColor} ${hoverColor}
          `}
        >
          {buttonContent}
        </button>
      </div>

    </Card>
  );
}