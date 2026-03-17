"use client";

import { useEffect, useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import Button from "@/components/ui/Button";

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
    <div className="flex flex-col items-center gap-8 max-w-md text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-[#27AE60]/10 flex items-center justify-center">
        <BsCheckCircleFill size={36} className="text-[#27AE60]" />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">
          Session processed successfully
        </h2>
        <p className="text-sm text-[#455858] leading-relaxed px-4">
          Your recording has been analysed. Your results are ready on the My Progress page.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full px-8">
        <p className="text-xs text-[#455858]">
          Redirecting you in <span className="text-[#1C2121] font-bold">{countdown}</span> second{countdown !== 1 ? "s" : ""}…
        </p>
        
        <Button
          onClick={onRedirect}
          fullWidth
          className="py-3"
          bgColor="bg-[#27AE60]"
          hoverColor="hover:bg-[#219150]"
        >
          Go to My Progress
        </Button>
      </div>
    </div>
  );
}