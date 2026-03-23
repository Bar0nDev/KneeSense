import { useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

export type RecordingState =
  | "instructions"
  | "permission-denied"
  | "ready"
  | "recording"
  | "review"
  | "processing"
  | "success"
  | "error";

export function useRecordingSession() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pageState, setPageState] = useState<RecordingState>("instructions");
  const [errorMessage, setErrorMessage] = useState("");

  const { 
    requestCamera, 
    startRecording, 
    stopRecording, 
    stopStream, 
    clearRecording, 
    recordedUrl,
    recordedBlob,
    stream // <--- Get the live stream from the hardware hook
  } = useMediaRecorder();

  const handleRequestCamera = useCallback(async () => {
    const { success } = await requestCamera(videoRef.current);
    setPageState(success ? "ready" : "permission-denied");
  }, [requestCamera]);

  const handleStart = useCallback(() => {
    setPageState("recording");
    startRecording()?.then((url) => {
      if (url) setPageState("review");
    });
  }, [startRecording]);

  const handleCancel = useCallback(() => {
    if (pageState === "recording") {
      stopRecording(true);
      setPageState("ready");
    } else {
      stopStream();
      setPageState("instructions");
    }
  }, [pageState, stopRecording, stopStream]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob) return;
    setPageState("processing");
    try {
      // API call simulation
      await new Promise((res) => setTimeout(res, 3500));
      setPageState("success");
    } catch {
      setErrorMessage("Upload failed. Please try again.");
      setPageState("error");
    }
  }, [recordedBlob]);

  const handleRetake = useCallback(() => {
    clearRecording();
    handleRequestCamera();
  }, [clearRecording, handleRequestCamera]);

  const instructionSteps = useMemo(() => [
    { title: "1. Attach Device", description: "Strap the sensor firmly to your knee." },
    { title: "2. Position", description: "Sit with your knee at a 90° angle." },
    { title: "3. Baseline", description: "Stay still for 3 seconds after pressing record." },
    { title: "4. Movement", description: "Slowly straighten your leg, then return." },
  ], []);

  return {
    pageState,
    videoRef,
    recordedUrl,
    errorMessage,
    instructionSteps,
    stream, // <--- Expose it here
    actions: {
      handleRequestCamera,
      handleStart,
      handleCancel,
      handleSubmit,
      handleRetake,
      stopRecording: () => stopRecording(false),
      setPageState,
      handleExit: () => { stopStream(); router.back(); }
    },
  };
}