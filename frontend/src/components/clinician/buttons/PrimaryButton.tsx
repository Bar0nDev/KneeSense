import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "add" | "cancel" | "view" | "link";
  href?: string; 
};

export default function Button({
  children,
  variant = "add", 
  href,
  className = "",
  ...props
}: ButtonProps) {
  
  const variants = {
    add: "bg-[#16656F] text-white hover:bg-[#114E56] border border-transparent",
    view: "bg-[#3543A3] text-white hover:bg-[#293480] border border-transparent",
    cancel: "bg-transparent text-[#12606A] hover:bg-gray-50 border-[1.5px] border-[#12606A] dark:text-[#12606A]", 
    link: "bg-transparent text-[#12606A] border border-transparent hover:bg-[#12606A]/10 hover:underline",
  };

  const baseClasses = "w-[174px] h-[38px] inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 cursor-pointer outline-none font-['DM_Sans'] text-sm disabled:opacity-50 disabled:cursor-not-allowed text-center";
  
  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses} style={{ textDecoration: 'none' }}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}