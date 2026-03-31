"use client";

import { useRouter } from "next/navigation";
import { BsArrowLeft } from "react-icons/bs";
import { useRecordingSession } from "@/hooks/useRecordingSession";

import InstructionsStep from "@/components/patient/recording/InstructionsStep";
import PermissionDeniedStep from "@/components/patient/recording/PermissionDeniedStep";
import CameraStep from "@/components/patient/recording/CameraStep";
import ReviewStep from "@/components/patient/recording/ReviewStep";
import ProcessingStep from "@/components/patient/recording/ProcessingStep";
import SuccessStep from "@/components/patient/recording/SuccessStep";
import ErrorStep from "@/components/patient/recording/ErrorStep";

export default function RecordingPage() {
  const router = useRouter();
  const {
    pageState,
    processingMessage,
    videoRef,
    recordedUrl,
    errorMessage,
    instructionSteps,
    stream,
    actions,
  } = useRecordingSession();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-4 bg-[#12606A]">
        <button onClick={actions.handleExit} className="flex items-center gap-2 text-sm text-white hover:opacity-80 cursor-pointer">
          <BsArrowLeft size={16} /> Back
        </button>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-white">Recording Session</h3>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {pageState === "instructions" && (
          <InstructionsStep onContinue={actions.handleRequestCamera} steps={instructionSteps} />
        )}

        {pageState === "permission-denied" && (
          <PermissionDeniedStep onRetry={actions.handleRequestCamera} />
        )}

        {(pageState === "ready" || pageState === "recording") && (
          <CameraStep
            videoRef={videoRef}
            stream={stream}
            isRecording={pageState === "recording"}
            onStart={actions.handleStart}
            onStop={actions.stopRecording}
            onCancel={actions.handleCancel}
          />
        )}

        {pageState === "review" && (
          <ReviewStep
            videoUrl={recordedUrl}
            onRetake={actions.handleRetake}
            onSubmit={actions.handleSubmit}
          />
        )}

        {pageState === "processing" && (
          <ProcessingStep message={processingMessage} />
        )}

        {pageState === "success" && (
          <SuccessStep onRedirect={() => router.push("/progress")} />
        )}

        {pageState === "error" && (
          <ErrorStep
            message={errorMessage}
            onRetry={() => actions.setPageState("instructions")}
          />
        )}
      </div>
    </div>
  );
}