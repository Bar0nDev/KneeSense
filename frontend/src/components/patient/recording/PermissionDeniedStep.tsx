"use client";

import { BsCameraVideoOff } from "react-icons/bs";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface PermissionDeniedStepProps {
  onRetry: () => void;
}

export default function PermissionDeniedStep({ onRetry }: PermissionDeniedStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center py-12">
      
      {/* Simple Icon Circle */}
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <BsCameraVideoOff size={36} className="text-red-500" />
      </div>

      <div>
        <h2 className="text-xl font-bold">Camera access required</h2>
        <p className="text-sm text-[#455858] mt-2 max-w-[280px] leading-relaxed mx-auto">
          KneeSense needs camera access to record your session. Please enable permissions in your browser settings.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full px-8">
        {/* Help Tip */}
        <p className="text-xs text-[#455858]">
          Please update your browser settings to allow camera access and try again.
        </p>

        {/* Action PrimaryButton */}
        <PrimaryButton
          onClick={onRetry}
          fullWidth
          color="#12606A"
          className="py-3"
        >
          Try again
        </PrimaryButton>
      </div>

    </div>
  );
}