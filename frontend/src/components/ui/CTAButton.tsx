import { ReactNode } from "react";
import { FaArrowRightLong } from "react-icons/fa6";

interface CTAButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  pillAccent?: string; // Hex or Tailwind class for the arrow circle
}

export default function CTAButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  pillAccent = "bg-[#30C3B1]",
}: CTAButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-4 rounded-full bg-white 
        py-0.5 pl-6 pr-0.5 text-sm font-semibold text-[#12606A] 
        transition-all duration-200 shadow-sm
        hover:opacity-90 active:scale-[0.98] 
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${className}
      `.trim()}
    >
      {children}
      
      <span 
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${pillAccent}`}
      >
        <FaArrowRightLong size={13} />
      </span>
    </button>
  );
}