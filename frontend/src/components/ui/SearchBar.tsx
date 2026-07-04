"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// 1. Add the missing types here
type SearchBarProps = {
  placeholder?: string;
  value: string;           // Added this
  onChange: (val: string) => void; // Added this
};

export default function SearchBar({ 
  placeholder = "Search...", 
  value, 
  onChange 
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term); 
    } else {
      params.delete('q');    
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 1
        }}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#12606A"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="placeholder-[#12606A]"
        placeholder={placeholder}
        // 2. Control the input with the passed props
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.currentTarget.value);
          }
        }}
        style={{
          width: "100%",
          height: "38px",
          padding: "0 12px 0 34px",
          background: "#FDFDFD",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#12606A",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
        }}
      />
    </div>
  );
}