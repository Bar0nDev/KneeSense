import { BsExclamationTriangle } from "react-icons/bs";
import Button from "@/components/ui/Button";

interface ErrorStepProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorStep({ message, onRetry }: ErrorStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 max-w-md text-center">
      <div className="w-20 h-20 rounded-full bg-[#CE2E2E]/10 flex items-center justify-center">
        <BsExclamationTriangle size={32} className="text-[#CE2E2E]" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#455858] mb-3">Something went wrong</h2>
        <p className="text-sm text-[#455858] leading-relaxed px-4">
          {message || "An unexpected error occurred while processing your session. Please try again."}
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