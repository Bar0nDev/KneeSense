import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
}

const paddingMap = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

const shadowMap = {
  none: "",
  sm: "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
  md: "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
  lg: "shadow-[0_4px_16px_rgba(0,0,0,0.10)]",
};

export default function Card({
  children,
  className = "",
  style,
  padding = "md",
  shadow = "sm",
  border = false,
}: CardProps) {
  return (
    <div
      style={style}
      className={`
        bg-white rounded-3xl
        ${paddingMap[padding]}
        ${shadowMap[shadow]}
        ${border ? "border border-gray-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}