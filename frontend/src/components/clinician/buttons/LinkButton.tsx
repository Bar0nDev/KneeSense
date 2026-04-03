import React, { useState } from "react";

type LinkProps = {
  label: string;
  onClick?: () => void;
  href: string;
  selected?: boolean;
  variant?: "topbar" | "subheader";
};

export default function LinkButton({ label, onClick, selected, variant = "topbar" }: LinkProps) {
  const [hover, setHover] = useState(false);
  const isSubheader = variant === "subheader";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`px-2 py-3 border-b-4 transition-colors duration-150 font-medium text-sm border-transparent`}
      style={{
        color: isSubheader
          ? hover ? "white" : "#12606A"
          : "white",
        borderBottomColor: selected
          ? isSubheader ? (hover ? "white" : "#12606A") : "white"
          : "transparent",
        backgroundColor: hover
          ? isSubheader ? "rgba(18, 96, 106, 0.8)" : "rgba(18, 96, 106, 1)"
          : "transparent",
        boxShadow: hover && isSubheader
          ? "inset 0 2px 6px rgba(0,0,0,0.5)"
          : "none",
      }}
    >
      {label}
    </button>
  );
}