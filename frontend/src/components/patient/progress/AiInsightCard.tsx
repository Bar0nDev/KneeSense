import { BsStars } from "react-icons/bs";
<<<<<<< HEAD
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa";
=======
>>>>>>> origin/feat/frontend-ui

type InsightStatus = "improving" | "stable" | "declining";

interface AIInsightCardProps {
  status?: InsightStatus;
  summary?: string;
}

<<<<<<< HEAD
const STATUS_CONFIG: Record<InsightStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  improving: {
    label: "Improving",
    classes: "bg-[#779B7F]",
    icon: <FaCaretUp size={12} />,
=======
const STATUS_CONFIG: Record<InsightStatus, { label: string; classes: string }> = {
  improving: {
    label: "Improving",
    classes: "bg-[#779B7F]",
>>>>>>> origin/feat/frontend-ui
  },
  stable: {
    label: "No Change",
    classes: "bg-[#455858]",
<<<<<<< HEAD
    icon: <FaCaretRight size={12} />,
=======
>>>>>>> origin/feat/frontend-ui
  },
  declining: {
    label: "Declining",
    classes: "bg-[#995353]",
<<<<<<< HEAD
    icon: <FaCaretDown size={12} />,
=======
>>>>>>> origin/feat/frontend-ui
  },
};

export default function AIInsightCard({
  status = "improving",
  summary = "Your knee flexion angle has improved by 6° since your last session, now reaching 67°. Zone distribution shows dominant medial loading at 41.7% — consider focusing on lateral activation during your next rehabilitation session to improve balance.",
}: AIInsightCardProps) {
<<<<<<< HEAD
  const { label, classes, icon } = STATUS_CONFIG[status];
=======
  const { label, classes } = STATUS_CONFIG[status];
>>>>>>> origin/feat/frontend-ui

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center gap-2">
<<<<<<< HEAD
        <p className="text-sm font-bold">AI Insight</p>
        <span className={`ml-1 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${classes} text-white`}>
          {icon}
=======
        {/* <BsStars size={16} className="text-[#12606A]" /> */}
        <p className="text-sm font-bold">AI Insight</p>
        <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${classes} text-white`}>
>>>>>>> origin/feat/frontend-ui
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