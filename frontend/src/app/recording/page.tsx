"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BsArrowLeft } from "react-icons/bs";

import InstructionsStep from "@/components/patient/recording/InstructionsStep";
import PermissionDeniedStep from "@/components/patient/recording/PermissionDeniedStep";
import CameraStep from "@/components/patient/recording/CameraStep";
import ReviewStep from "@/components/patient/recording/ReviewStep";
import ProcessingStep from "@/components/patient/recording/ProcessingStep";
import SuccessStep from "@/components/patient/recording/SuccessStep";
import ErrorStep from "@/components/patient/recording/ErrorStep";

type PageState =
  | "instructions"
  | "permission-denied"
  | "ready"
  | "recording"
  | "review"
  | "processing"
  | "success"
  | "error";

export default function RecordingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Ref to distinguish between 'Stop to Save' and 'Stop to Discard'
  const isDiscardingRef = useRef(false);

  const [pageState, setPageState] = useState<PageState>("instructions");
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setPageState("ready");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      setPageState("permission-denied");
    }
  }, []);

  const handleStart = () => {
    if (!streamRef.current) return;
    
    isDiscardingRef.current = false;

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => { 
      if (e.data.size > 0) chunks.push(e.data); 
    };

    recorder.onstop = () => {
      // If we are cancelling, clear temporary data and stay on camera
      if (isDiscardingRef.current) {
        recordedBlobRef.current = null;
        setRecordedUrl(null);
        return;
      }

      // If we stopped normally, proceed to Review
      const blob = new Blob(chunks, { type: "video/webm" });
      recordedBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      
      // Stop the camera light only when moving to review
      stopStream();
      setPageState("review");
    };

    recorder.start();
    setPageState("recording");
  };

  const handleStop = () => {
    isDiscardingRef.current = false;
    mediaRecorderRef.current?.stop();
  };

  const handleCancel = () => {
      if (pageState === "recording") {
        isDiscardingRef.current = true;
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }

        // Stay on camera, but reset UI to "Start Recording" state
        setPageState("ready");
      } else {
        // If they haven't started recording yet, take them back to instructions
        stopStream();
        setPageState("instructions");
      }
    };

  const handleRetake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    recordedBlobRef.current = null;
    requestCamera();
  };

  const handleSubmit = async () => {
    setPageState("processing");
    try {
      await new Promise((res) => setTimeout(res, 3000));
      setPageState("success");
    } catch {
      setErrorMessage("Processing failed. Please try again.");
      setPageState("error");
    }
  };

  const handleRedirect = () => {
    router.push("/progress");
  };

  const handleRetry = () => {
    setPageState("instructions");
    setErrorMessage("");
  };

  const handleBack = () => {
    stopStream(); // Ensure camera is off when leaving
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col">
<<<<<<< HEAD
      
=======
      {/* Top Bar */}
>>>>>>> origin/feat/frontend-ui
      <div className="flex items-center justify-between px-6 py-4 bg-[#12606A]">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-white transition-all hover:text-[#FDFDFD]/80 active:scale-95 cursor-pointer"
        >
          <BsArrowLeft size={16} />
          Back
        </button>
        <p className="text-xs font-semibold tracking-widest uppercase text-white">
          KneeSense · Recording Session
        </p>
        <div className="w-16" />
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {pageState === "instructions" && (
          <InstructionsStep onContinue={requestCamera} />
        )}

        {pageState === "permission-denied" && (
          <PermissionDeniedStep onRetry={requestCamera} />
        )}

        {(pageState === "ready" || pageState === "recording") && (
          <CameraStep
            videoRef={videoRef}
            isRecording={pageState === "recording"}
            onStart={handleStart}
            onStop={handleStop}
            onCancel={handleCancel}
          />
        )}

        {pageState === "review" && (
          <ReviewStep
            videoUrl={recordedUrl}
            onRetake={handleRetake}
            onSubmit={handleSubmit}
          />
        )}

        {pageState === "processing" && <ProcessingStep />}

        {pageState === "success" && (
          <SuccessStep onRedirect={handleRedirect} />
        )}

        {pageState === "error" && (
          <ErrorStep message={errorMessage} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}