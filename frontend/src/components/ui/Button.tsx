import { ReactNode, CSSProperties } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "filled" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverColor?: string;
  accentColor?: string; // raw hex e.g. "#12606A" — overrides border + text for outline
}

const sizeMap = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export default function Button({
  children,
  onClick,
  variant = "filled",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
  bgColor = "bg-[#12606A]",
  textColor = "text-white",
  borderColor = "border-[#12606A]",
  hoverColor = "hover:bg-[#0e4f57]",
  accentColor,
}: ButtonProps) {

  const variantStyles = {
    filled: `${bgColor} ${textColor} ${hoverColor}`,
    outline: `bg-transparent border ${!accentColor ? borderColor : ""} ${!accentColor ? textColor : ""} ${hoverColor}`,
    ghost: `bg-transparent ${!accentColor ? textColor : ""} ${hoverColor}`,
  };

  // Use inline style for dynamic accent colors to avoid Tailwind purging issues
  const inlineStyle: CSSProperties | undefined = accentColor
    ? {
        ...(variant === "outline" && { borderColor: accentColor, color: accentColor }),
        ...(variant === "ghost" && { color: accentColor }),
      }
    : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={inlineStyle}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-lg
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${variantStyles[variant]}
        ${sizeMap[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}