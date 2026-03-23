"use client";

interface InboxFiltersProps {
  current: string;
  options: string[];
  onChange: (filter: string) => void;
}

export default function InboxFilters({ current, options, onChange }: InboxFiltersProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200 w-fit">
      {options.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            current === f 
              ? "bg-white text-[#12606A] shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}