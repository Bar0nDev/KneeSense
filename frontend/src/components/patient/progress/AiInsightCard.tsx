import { BsStars } from "react-icons/bs";

type InsightStatus = "improving" | "stable" | "declining";

interface AIInsightCardProps {
  status?: InsightStatus;
  summary?: string;
}

const STATUS_CONFIG: Record<InsightStatus, { label: string; classes: string }> = {
  improving: {
    label: "Improving",
    classes: "bg-[#779B7F]",
  },
  stable: {
    label: "No Change",
    classes: "bg-[#455858]",
  },
  declining: {
    label: "Declining",
    classes: "bg-[#995353]",
  },
};

export default function AIInsightCard({
  status = "improving",
  summary = "Your knee flexion angle has improved by 6° since your last session, now reaching 67°. Zone distribution shows dominant medial loading at 41.7% — consider focusing on lateral activation during your next rehabilitation session to improve balance.",
}: AIInsightCardProps) {
  const { label, classes } = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center gap-2">
        {/* <BsStars size={16} className="text-[#12606A]" /> */}
        <p className="text-sm font-bold">AI Insight</p>
        <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${classes} text-white`}>
          {label}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed">
        {summary}
      </p>

    </div>
  );
}