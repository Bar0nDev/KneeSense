"use client";

import { useRef, useState } from "react";
import { BsPlayFill } from "react-icons/bs";

interface ZoneMapProps {
  videoSrc?: string;
  medialPct?: string;
  centralPct?: string;
  lateralPct?: string;
}

export default function ZoneMap({
  videoSrc,
  medialPct = "41.7%",
  centralPct = "33.4%",
  lateralPct = "24.9%",
}: ZoneMapProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const zones = [
    { label: "MEDIAL\nZONE", value: medialPct },
    { label: "CENTRAL\nZONE", value: centralPct },
    { label: "LATERAL\nZONE", value: lateralPct },
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
        setPlaying(false);
      });
      setPlaying(true);
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl bg-gray-900 cursor-pointer"
      onClick={togglePlay}
    >
      {/* Video — drives the container height naturally */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-auto rounded-2xl block"
          loop
          playsInline
          muted
        />
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-purple-500 via-teal-400 to-green-400" />
      )}

      {/* Zone Overlay — sits on top of video */}
      <div className="absolute inset-0 flex">
        {zones.map((zone, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end pb-5 relative"
          >
            {i < zones.length - 1 && (
              <div className="absolute right-0 top-0 h-full border-r-2 border-dashed border-white/60" />
            )}
            <p className="text-white text-lg font-extrabold drop-shadow">{zone.value}</p>
            <p className="text-white text-[10px] font-semibold tracking-widest text-center whitespace-pre-line drop-shadow">
              {zone.label}
            </p>
          </div>
        ))}
      </div>

      {/* Play/Pause Button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
            <BsPlayFill size={24} className="text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}