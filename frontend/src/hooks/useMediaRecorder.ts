import { useRef, useState, useCallback } from "react";

export function useMediaRecorder() {
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const isDiscardingRef = useRef(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const requestCamera = useCallback(async (videoElement: HTMLVideoElement | null) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoElement) {
        videoElement.srcObject = stream;
        // Ensure the video plays once metadata is loaded
        videoElement.onloadedmetadata = () => {
          videoElement.play().catch(console.error);
        };
      }
      return { success: true, stream };
    } catch (error) {
      console.error("Camera Access Error:", error);
      return { success: false, error };
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    isDiscardingRef.current = false;
    const chunks: BlobPart[] = [];
    
    // Support detection for Safari/Chrome compatibility
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/mp4";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const stopPromise = new Promise<string | null>((resolve) => {
      recorder.onstop = () => {
        if (isDiscardingRef.current) {
          setRecordedBlob(null);
          resolve(null);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        
        // We stop the visual stream only after recording is finalized
        stopStream();
        resolve(url);
      };
    });

    recorder.start(1000); // Capture in 1s chunks to ensure data safety
    return stopPromise;
  }, [stopStream]);

  const stopRecording = useCallback((discard = false) => {
    isDiscardingRef.current = discard;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
  }, [recordedUrl]);

  return {
    stream: streamRef.current,
    recordedUrl,
    recordedBlob,
    requestCamera,
    startRecording,
    stopRecording,
    stopStream,
    clearRecording,
  };
}