"use client";

import { BsExclamationCircle } from "react-icons/bs";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface ErrorStepProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorStep({ message, onRetry }: ErrorStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center py-12">
      
      {/* Simple Icon Circle */}
      <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
        <BsExclamationCircle size={36} className="text-orange-500" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#1C2121]">Analysis interrupted</h2>
        <p className="text-sm text-[#455858] mt-2 max-w-[280px] leading-relaxed mx-auto">
          {message || "Something went wrong while processing your session. Please try again or contact support if the issue persists."}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full px-8">
        <PrimaryButton
          onClick={onRetry}
          fullWidth
          color="#12606A"
          className="py-3"
        >
          Try Again
        </PrimaryButton>
        
        {/* <button 
          onClick={() => window.location.href = "mailto:support@kneesense.com"}
          className="text-xs text-[#455858] hover:underline transition-all"
        >
          Contact Support
        </button> */}
      </div>

    </div>
  );
}