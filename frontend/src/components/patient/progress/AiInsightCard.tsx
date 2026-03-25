"use client";

import { BsStars } from "react-icons/bs";
import { FaCaretUp, FaCaretDown, FaCaretRight } from "react-icons/fa";
import Card from "@/components/ui/Card"; // Assuming this is your standard Card path

type InsightStatus = "improving" | "stable" | "declining";

interface AIInsightCardProps {
  status: InsightStatus;
  summary: string;
}

const STATUS_CONFIG: Record<InsightStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  improving: {
    label: "Improving",
    color: "text-[#27AE60]",
    bg: "bg-[#27AE60]/10",
    icon: <FaCaretUp size={12} />,
  },
  stable: {
    label: "No Change",
    color: "text-[#455858]",
    bg: "bg-[#455858]/10",
    icon: <FaCaretRight size={12} />,
  },
  declining: {
    label: "Declining",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    icon: <FaCaretDown size={12} />,
  },
};

export default function AIInsightCard({ status, summary }: AIInsightCardProps) {
  const { label, color, bg, icon } = STATUS_CONFIG[status];

  return (
    <Card className="min-h-[152px]">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#12606A]/10">
              <BsStars size={14} className="text-[#12606A]" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">AI Insight</h2>
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${bg} ${color}`}>
            {icon}
            {label}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-[#455858]">
          {summary}
        </p>
      </div>
    </Card>
  );
}