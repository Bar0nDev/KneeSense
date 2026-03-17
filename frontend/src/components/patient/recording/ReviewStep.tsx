import { BsArrowCounterclockwise, BsCheckCircle } from "react-icons/bs";
import Button from "@/components/ui/Button";

interface ReviewStepProps {
  videoUrl: string | null;
  onRetake: () => void;
  onSubmit: () => void;
}

export default function ReviewStep({ videoUrl, onRetake, onSubmit }: ReviewStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">

      {/* Label */}
      <div className="w-full">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#12606A]">
          Review your recording
        </p>
        {/* <p className="text-sm text-gray-500">
          Watch your recording before submitting. If it looks good, hit Submit.
        </p> */}
      </div>

      {/* Recorded Video */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#E5E5E5] border border-[#D9D9D9]">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-auto block"
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <p className="text-sm text-[#455858]">No recording available</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full">
        <Button
          variant="outline"
          onClick={onRetake}
          fullWidth
          textColor="text-[#455858]"
          borderColor="border-[#455858]"
          hoverColor="hover:bg-[#E5E5E5]"
          className="gap-2"
        >
          <BsArrowCounterclockwise size={16} />
          Retake
        </Button>

        <Button
          onClick={onSubmit}
          fullWidth
          className="gap-2"
          bgColor="bg-[#27AE60]"
          hoverColor="hover:bg-[#219150]"
        >
          <BsCheckCircle size={16} />
          Submit recording
        </Button>
      </div>

    </div>
  );
}