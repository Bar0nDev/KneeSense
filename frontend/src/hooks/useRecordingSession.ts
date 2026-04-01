import { useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useUser } from "@/context/UserContext";
import { useSessionData } from "@/hooks/useSessionQueries";
import { sessionService } from "@/services/sessionService";

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
  const { userProfile } = useUser();
  const { refresh } = useSessionData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pageState, setPageState] = useState<RecordingState>("instructions");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");

  const {
    requestCamera,
    startRecording,
    stopRecording,
    stopStream,
    clearRecording,
    recordedUrl,
    recordedBlob,
    stream,
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

    if (userProfile?.role !== "patient") {
      setErrorMessage("Only patients can submit recordings.");
      setPageState("error");
      return;
    }

    const patientProfileId = userProfile.profile?.id;
    const practitionerId = userProfile.profile?.practitioner_id;

    if (!patientProfileId) {
      setErrorMessage("Patient profile not found. Please log in again.");
      setPageState("error");
      return;
    }

    if (!practitionerId) {
      setErrorMessage("No practitioner assigned to your account. Please contact your clinic.");
      setPageState("error");
      return;
    }

    setPageState("processing");

    try {
      // Step 1 — Upload video and create session
      setProcessingMessage("Uploading your recording...");

      // const devVideoResponse = await fetch("/video/knee-vid.mp4");
      // const devBlob = await devVideoResponse.blob();

      const formData = new FormData();
      formData.append("video", recordedBlob, "recording.webm");
      // formData.append("video", devBlob, "recording.mp4");
      formData.append("patient_id", String(patientProfileId));
      formData.append("practitioner_id", String(practitionerId));
      const { session_id } = await sessionService.uploadSession(formData);

      // Step 2 — Run AI inference on the video frames
      setProcessingMessage("Analyzing knee movement...");
      await sessionService.analyzeSession(session_id);

      // Step 3 — Fetch and confirm predictions stored correctly
      setProcessingMessage("Retrieving predictions...");
      await sessionService.getPredictions(session_id);

      // Step 4 — Generate Claude clinical insight from predictions
      setProcessingMessage("Generating AI insights...");
      await sessionService.generateInsight(session_id);

      refresh();
      setPageState("success");
    } catch (err: any) {
      console.error("Pipeline error:", err.response?.data || err.message || err);
      setErrorMessage(err.response?.data?.error || "Something went wrong. Please try again.");
      setPageState("error");
    }
  }, [recordedBlob, userProfile]);


  const handleRetake = useCallback(() => {
    clearRecording();
    handleRequestCamera();
  }, [clearRecording, handleRequestCamera]);

  const instructionSteps = useMemo(() => [
    { title: "Step 1: Sit & Position", description: "Step 1 description placeholder." },
    { title: "Step 2: Secure the Fit", description: "Step 2 description placeholder." },
    { title: "Step 3: Gentle Movement", description: "Step 3 description placeholder." },
    { title: "Step 4 Title", description: "Step 4 description placeholder." },
  ], []);

  return {
    pageState,
    processingMessage,
    videoRef,
    recordedUrl,
    errorMessage,
    instructionSteps,
    stream,
    actions: {
      handleRequestCamera,
      handleStart,
      handleCancel,
      handleSubmit,
      handleRetake,
      stopRecording: () => stopRecording(false),
      setPageState,
      handleExit: () => { stopStream(); router.back(); },
    },
  };
}