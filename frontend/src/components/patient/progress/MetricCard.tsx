"use client";

import { IconType } from "react-icons";
import { LuClipboardCheck } from "react-icons/lu";
import { TbAngle } from "react-icons/tb";
import { TbArrowsVertical } from "react-icons/tb";
import { RiFocus2Fill } from "react-icons/ri";
import Card from "@/components/ui/Card";

interface MetricConfig {
  label: string;
  icon: IconType;
  iconColor: string;
  iconBg: string;
}

const METRIC_CONFIG: Record<string, MetricConfig> = {
  metric1: {
    label: "Average Angle",
    icon: TbAngle,
    iconColor: "#30C3B1",
    iconBg: "#E6F4F4",
  },
  metric2: {
    label: "Dominant Zone",
    icon: RiFocus2Fill,
    iconColor: "#3543A3",
    iconBg: "#EAECF8",
  },
  metric3: {
    label: "Range of Motion",
    icon: TbArrowsVertical,
    iconColor: "#27AE60",
    iconBg: "#E8F8EF",
  },
};

interface MetricCardProps {
  type: keyof typeof METRIC_CONFIG;
  value: string;
}

export default function MetricCard({ type, value }: MetricCardProps) {
  const config = METRIC_CONFIG[type];
  
  if (!config) return null;

  const { label, icon: Icon, iconColor, iconBg } = config;

  return (
    <Card className="flex items-center gap-4 py-5 px-5">
      {/* Icon Wrapper */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={21} style={{ color: iconColor }} />
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-start">
        <h2 className="text-2xl font-extrabold text-gray-900 leading-none">
          {value}
        </h2>
        <p className="text-[10px] font-bold text-[#455858] uppercase tracking-widest mt-2">
          {label}
        </p>
      </div>
    </Card>
  );
}