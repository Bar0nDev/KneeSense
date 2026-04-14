"use client";

import { BsStars } from "react-icons/bs";
import Card from "@/components/ui/Card";

interface AIInsightCardProps {
  summary: string | null;
  detail: string | null;
  className?: string;
}

export default function AIInsightCard({ summary, detail, className = "" }: AIInsightCardProps) {
  const hasContent = summary || detail;

  return (
    <Card padding="none" shadow="sm" className={`overflow-hidden flex flex-col ${className}`}>
      <div className="flex flex-col gap-4 flex-1 p-5">
        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#12606A]/10">
            <BsStars size={14} className="text-[#12606A]" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">AI Insight</h2>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
          {!hasContent ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-gray-400 italic">
                No insight available for this session.
              </p>
            </div>
          ) : (
            <>
              {/* Summary — highlighted */}
              {summary && (
                <div className="rounded-xl bg-[#12606A]/8 border border-gray-400 px-4 py-3">
                  <p className="text-sm font-semibold leading-relaxed text-[#12606A]">
                    {summary}
                  </p>
                </div>
              )}

              {/* Full insight text */}
              {detail && (
                <div className="flex flex-col gap-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Full Analysis
                  </h4>
                  <p className="text-sm leading-relaxed text-[#455858]">
                    {detail}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
