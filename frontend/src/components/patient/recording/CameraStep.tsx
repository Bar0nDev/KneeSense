import { RefObject, useState, useEffect } from "react";
import { BsCameraVideo, BsStopCircle } from "react-icons/bs";
import Button from "@/components/ui/Button";

interface CameraStepProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

export default function CameraStep({
  videoRef,
  isRecording,
  onStart,
  onStop,
  onCancel,
}: CameraStepProps) {
  const [seconds, setSeconds] = useState(0);

  // Timer Logic: Resets and starts when isRecording is true
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      setSeconds(0); // Reset timer at start
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      
      {/* Live Feed */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#E5E5E5] border border-[#D9D9D9]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto block transform"
        />
        
        {/* REC Indicator and Timer */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CE2E2E] animate-pulse" />
              <span className="text-xs font-bold text-white tracking-widest">REC</span>
            </div>
            <div className="w-[1px] h-3 bg-white/30" /> {/* Divider */}
            <span className="text-sm font-mono text-white tabular-nums">
              {formatTime(seconds)}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full">
        {!isRecording ? (
          <Button 
            onClick={onStart} 
            fullWidth 
            className="gap-2"
            bgColor="bg-[#27AE60]"
            hoverColor="hover:bg-[#219150]"
          >
            <BsCameraVideo size={16} />
            Start recording
          </Button>
        ) : (
          <Button
            onClick={onStop}
            fullWidth
            bgColor="bg-[#CE2E2E]"
            hoverColor="hover:bg-[#A82222]"
            className="gap-2"
          >
            <BsStopCircle size={16} />
            Stop recording ({formatTime(seconds)})
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onCancel}
          textColor="text-[#455858]"
          borderColor="border-[#455858]"
          hoverColor="hover:bg-[#E5E5E5]"
          className="px-8" 
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}