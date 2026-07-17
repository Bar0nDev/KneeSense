"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/sessionService";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Fetches a short-lived signed GCS URL for a session's video.
 *
 * We can't point <video src> at the backend's /data/videos route in production:
 * that request goes through the ngrok tunnel, whose free-tier browser-warning
 * interstitial replaces the video bytes with an HTML page (a <video> element
 * can't send the ngrok-skip-browser-warning header that our axios client uses).
 * The signed URL points straight at storage.googleapis.com, bypassing ngrok.
 *
 * Signed URLs expire (1h server-side); staleTime is kept comfortably under that
 * so a long-lived page re-fetches a fresh URL before the old one expires.
 */
export function useVideoUrl(sessionId?: string | null) {
  const { data: videoUrl, isLoading } = useQuery({
    queryKey: queryKeys.videoUrl(sessionId!),
    queryFn: () => sessionService.getVideoUrl(sessionId!),
    enabled: !!sessionId,
    staleTime: 45 * 60 * 1000, // 45 min — under the 1h signed-URL expiry
    retry: (failureCount, error: any) =>
      error?.response?.status !== 404 && failureCount < 1,
  });

  return { videoUrl, isLoading };
}
