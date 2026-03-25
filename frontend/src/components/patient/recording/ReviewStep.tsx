"use client";

import { BsArrowCounterclockwise, BsCheckCircle } from "react-icons/bs";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface ReviewStepProps {
  videoUrl: string | null;
  onRetake: () => void;
  onSubmit: () => void;
}

export default function ReviewStep({ videoUrl, onRetake, onSubmit }: ReviewStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl animate-in fade-in">
      <div className="w-full">
        <h2 className="text-lg font-bold text-gray-900">Review Recording</h2>
      </div>

      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
        {videoUrl ? (
          <video 
            key={videoUrl} // Forces re-mount when URL is ready
            src={videoUrl} 
            controls 
            playsInline 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Generating video...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <PrimaryButton variant="outline" onClick={onRetake} fullWidth color="#455858" textColor="#455858" className="gap-2">
          <BsArrowCounterclockwise size={18} /> Retake
        </PrimaryButton>
        <PrimaryButton onClick={onSubmit} variant="filled" fullWidth color="#27AE60" className="gap-2">
          <BsCheckCircle size={18} /> Submit
        </PrimaryButton>
      </div>
    </div>
  );
}