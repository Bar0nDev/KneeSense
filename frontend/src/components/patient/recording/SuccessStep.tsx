"use client";

import { useEffect, useState } from "react";
import { BsCheck2Circle, BsArrowRight } from "react-icons/bs";
import { FaRegCircleCheck } from "react-icons/fa6";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { LuMoveRight } from "react-icons/lu";

interface SuccessStepProps {
  onRedirect: () => void;
}

export default function SuccessStep({ onRedirect }: SuccessStepProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      onRedirect();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onRedirect]);

  return (
    <div className="flex flex-col items-center gap-10 max-w-sm text-center animate-in fade-in zoom-in-95 duration-500">
      
      {/* Success Icon */}
      <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shadow-sm">
        <FaRegCircleCheck size={44} className="text-[#27AE60]" />
      </div>

      {/* Message */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Session Processed Successfully
        </h2>
        <p className="text-xs text-[#455858] leading-relaxed px-6 font-medium">
          Your recording has been analyzed and the data has been securely uploaded. 
          Your updated metrics are now available on your progress dashboard.
        </p>
      </div>

      {/* Redirect Logic */}
      <div className="w-full px-6 space-y-4">
        <PrimaryButton
          onClick={onRedirect}
          fullWidth
          color="#12606A"
          className="py-3 gap-2"
        >
          Go to My Progress
          <LuMoveRight size={18}/>
        </PrimaryButton>

        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Redirecting in {countdown}s...
        </p>
      </div>
    </div>
  );
}