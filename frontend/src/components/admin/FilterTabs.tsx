"use client";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
}

// Small segmented pill control used for list filters in the admin portal.
export default function FilterTabs({ options, value, onChange }: FilterTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              active
                ? "bg-[#12606A] text-white"
                : "text-[#455858] hover:bg-[#12606A]/10"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
