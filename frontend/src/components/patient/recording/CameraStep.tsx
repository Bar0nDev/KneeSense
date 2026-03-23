"use client";

import { RefObject, useState, useEffect } from "react";
import { BsCameraVideo, BsStopCircle } from "react-icons/bs";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface CameraStepProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  stream: MediaStream | null; // Pass the stream down
}

export default function CameraStep({
  videoRef,
  isRecording,
  onStart,
  onStop,
  onCancel,
  stream
}: CameraStepProps) {
  const [seconds, setSeconds] = useState(0);

  // Re-attach stream if the video element loses it during state transitions
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setSeconds(0);
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s: number) => 
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-gray-200">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // Use object-cover to prevent black bars
          className="w-full h-full object-cover -scale-x-100"
        />

        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-white">{formatTime(seconds)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full">
        {!isRecording ? (
          <PrimaryButton onClick={onStart} fullWidth color="#27AE60" className="py-3 gap-2">
            <BsCameraVideo size={18} /> Start Recording
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onStop} fullWidth color="#CE2E2E" className="py-3 gap-2">
            <BsStopCircle size={18} /> Stop Recording
          </PrimaryButton>
        )}
        <PrimaryButton variant="outline" onClick={onCancel} color="#455858" textColor="#455858">
          Cancel
        </PrimaryButton>
      </div>
    </div>
  );
}