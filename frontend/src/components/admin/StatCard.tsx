import { IconType } from "react-icons";
import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconType;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#12606A]/10">
        <Icon size={22} className="text-[#12606A]" />
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-bold text-[#455858]/60 uppercase tracking-[0.15em]">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#1C2121]">{value}</p>
      </div>
    </Card>
  );
}
