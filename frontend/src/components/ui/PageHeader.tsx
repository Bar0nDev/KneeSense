import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode; // optional button or element on the right
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-3xl">{title}</h2>
        <p className="text-sm text-[#455858] mt-0.5">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}