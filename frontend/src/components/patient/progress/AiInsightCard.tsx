"use client";

import { BsStars } from "react-icons/bs";
import { FaCaretUp, FaCaretDown, FaCaretRight } from "react-icons/fa";
import Card from "@/components/ui/Card";

type InsightStatus = "improving" | "stable" | "declining";

interface AIInsightCardProps {
  status: InsightStatus;
  summary: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  InsightStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
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

function parseSections(text: string) {
  const regex = /\*\*(.*?)\*\*(.*?)(?=\*\*|$)/gs;
  return [...text.matchAll(regex)].map((match) => ({
    title: match[1].replace(":", "").trim(),
    content: match[2].trim(),
  }));
}

export default function AIInsightCard({ status, summary, className = "" }: AIInsightCardProps) {
  const { label, color, bg, icon } = STATUS_CONFIG[status];
  const sections = parseSections(summary);

  return (
    <Card padding="none" shadow="sm" className={`overflow-hidden flex flex-col ${className}`}>
      <div className="flex flex-col gap-4 flex-1 p-5">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#12606A]/10">
              <BsStars size={14} className="text-[#12606A]" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">AI Insight</h2>
          </div>
          {/* Status Badge - Commented for now*/}
          {/* <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${bg} ${color}`}>
            {icon}
            {label}
          </span> */}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
          {sections.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-gray-400 italic">
                No insight available for this session.
              </p>
            </div>
          ) : (
            sections.map((section, index) => (
              <div key={index} className="flex flex-col gap-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#12606A]">
                  {section.title}
                </h4>
                <p className="text-sm leading-relaxed text-[#455858]">
                  {section.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}