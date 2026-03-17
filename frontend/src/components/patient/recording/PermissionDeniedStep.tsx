import { BsExclamationTriangle } from "react-icons/bs";
import Button from "@/components/ui/Button";

interface PermissionDeniedStepProps {
  onRetry: () => void;
}

export default function PermissionDeniedStep({ onRetry }: PermissionDeniedStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 max-w-md text-center">

      <div className="w-20 h-20 rounded-full bg-[#CE2E2E]/10 flex items-center justify-center">
        <BsExclamationTriangle size={32} className="text-[#CE2E2E]" />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Camera access denied</h2>
        <p className="text-sm text-[#455858] leading-relaxed px-4">
          KneeSense needs camera access to capture your session. Please allow
          camera permissions in your browser settings and try again.
        </p>
      </div>

      <div className="w-full px-8">
        <Button
          onClick={onRetry}
          fullWidth
          variant="outline"
          textColor="text-[#455858]"
          borderColor="border-[#455858]"
          hoverColor="hover:bg-[#E5E5E5]"
          className="px-8" 
        >
          Try again
        </Button>
      </div>
    </div>
  );
}