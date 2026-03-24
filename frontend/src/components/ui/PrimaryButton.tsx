"use client";

import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color?: string; 
  textColor?: string; 
  variant?: "filled" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

const sizeMap = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export default function PrimaryButton({
  children,
  onClick,
  color = "#12606A",
  textColor = "#FFFFFF",
  variant = "filled",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: PrimaryButtonProps) {
  
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-full 
    transition-all duration-200 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
    disabled:opacity-50 disabled:pointer-events-none 
    active:scale-[0.97] cursor-pointer 
    hover:brightness-95 active:brightness-90
  `;

  const getVariantStyles = () => {
    switch (variant) {
      case "filled":
        return {
          backgroundColor: color,
          color: textColor,
          border: "1px solid transparent",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: textColor,
          border: `2px solid ${color}`,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: color,
          border: "1px solid transparent",
        };
      default:
        return {};
    }
  };

  const combinedClasses = `
    ${baseStyles}
    ${variant !== "link" ? sizeMap[size] : ""}
    ${fullWidth ? "w-full" : "w-fit"}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      style={variant !== "link" ? getVariantStyles() : {}}
    >
      {children}
    </button>
  );
}