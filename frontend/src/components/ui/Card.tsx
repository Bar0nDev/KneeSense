import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
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
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  border = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl
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