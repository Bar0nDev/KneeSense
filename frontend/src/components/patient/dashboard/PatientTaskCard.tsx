import { IconType } from "react-icons";
import { BsClipboardCheck, BsLightningCharge } from "react-icons/bs";
import Button from "@/components/ui/Button";

interface TaskConfig {
  label: string;
  buttonText: string;
  icon: IconType;
  accentColor: string;
  hoverColor: string;
}

const TASK_CONFIG: Record<string, TaskConfig> = {
  session: {
    label: "YOUR NEXT SESSION",
    buttonText: "Start Session",
    icon: BsClipboardCheck,
    accentColor: "#27AE60",
    hoverColor: "hover:bg-[#27AE60]/5",
  },
  rehab: {
    label: "START DAILY REHAB",
    buttonText: "Begin →",
    icon: BsLightningCharge,
    accentColor: "#3543A3",
    hoverColor: "hover:bg-[#3543A3]/5",
  },
};

interface PatientTaskCardProps {
  type: "session" | "rehab";
  title: string;
  subtitle: string;
}

export default function PatientTaskCard({ type, title, subtitle }: PatientTaskCardProps) {
  const { label, buttonText, icon: Icon, accentColor, hoverColor } = TASK_CONFIG[type];

  return (
    <div className="flex flex-col h-full gap-4">

      {/* Label */}
      <p className="text-xs font-semibold text-[#455858] uppercase tracking-widest">
        {label}
      </p>

      {/* Icon + Info */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div className="leading-snug">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-[#455858] mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Button pinned to bottom */}
      <div className="mt-auto">
        <Button
          variant="outline"
          fullWidth
          accentColor={accentColor}
          hoverColor={hoverColor}
        >
          {buttonText}
        </Button>
      </div>

    </div>
  );
}