"use client";

const BRAND = "#12606A";

export type FilterOption = {
  key: string;
  label: string;
  subLabel?: string;
};

type FilterPillsProps = {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

export default function FilterPills({ options, activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map((type) => {
        const isActive = activeFilter === type.key;
        return (
          <button
            key={type.key}
            onClick={() => onFilterChange(type.key)}
            style={{
              padding: "5px 12px",
              borderRadius: "999px",
              border: `1.5px solid ${isActive ? BRAND : "#E5E7EB"}`,
              background: isActive ? `${BRAND}12` : "white",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s ease",
              textAlign: 'center',
            }}
          >
            <div style={{
              color: isActive ? BRAND : "#6B7280",
              fontSize: "11px",
              fontWeight: isActive ? 700 : 500,
            }}>
              {type.label}
            </div>
            {type.subLabel && (
              <div style={{
                color: isActive ? BRAND : "#9CA3AF",
                fontSize: "9px",
                fontWeight: 500,
                opacity: 0.8,
              }}>
                {type.subLabel}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
