import React, { ReactNode, MouseEventHandler } from 'react';

interface HeroButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "solid" | "outline"; // Added variant prop
}

const HeroButton = ({ 
  children, 
  onClick, 
  type = "button", 
  className = "",
  variant = "solid" // Default to solid
}: HeroButtonProps) => {
  
  // Define styles based on variant
  const isOutline = variant === "outline";
  
  const variantStyles = isOutline 
    ? "border border-gray-200 bg-transparent text-[#455858] hover:bg-gray-50" 
    : "text-white hover:opacity-90";

  const gradientStyle = !isOutline 
    ? { background: "linear-gradient(135deg, #12606A, #30C3B1)" } 
    : {};

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        mt-2 w-full rounded-xl py-3 text-sm font-semibold 
        transition-all duration-200 active:scale-[0.98] cursor-pointer
        ${variantStyles}
        ${className}
      `}
      style={gradientStyle}
    >
      {children}
    </button>
  );
};

export default HeroButton;