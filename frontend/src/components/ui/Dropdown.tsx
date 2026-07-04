"use client";
import { useState, useRef, useEffect } from "react";

type DropdownOption = {
  key: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  placeholder?: string;
  width?: string;
  label?: string;
};

export default function Dropdown({
  options,
  selectedKey,
  onSelect,
  placeholder = "Select option",
  width = "174px",
  label
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.key === selectedKey);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background: "#FDFDFD",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          outline: "none",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#12606A",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="#12606A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "42px",
            left: 0,
            width: "100%",
            background: "#FDFDFD",
            border: "1.5px solid #E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                onSelect(option.key);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#12606A",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "background 0.2s ease",
                background: selectedKey === option.key ? "#F3F4F6" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  selectedKey === option.key ? "#F3F4F6" : "transparent")
              }
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}