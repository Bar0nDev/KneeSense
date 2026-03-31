"use client";

import { useRef, useState } from "react";
import { BsPlayFill } from "react-icons/bs";

interface ZoneMapProps {
  videoSrc?: string;
  avgAngle?: string;
  medialPct?: string;
  centralPct?: string;
  lateralPct?: string;
}

export default function ZoneMap({
  videoSrc,
  avgAngle,
  medialPct,
  centralPct,
  lateralPct,
}: ZoneMapProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Derived zone data
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
      className="relative w-full rounded-3xl bg-gray-900 cursor-pointer overflow-hidden group shadow-lg"
      onClick={togglePlay}
    >
      {/* Video Layer */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-auto block transform transition-transform duration-700 group-hover:scale-[1.02]"
          loop
          playsInline
          muted
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-[#12606A] to-[#30C3B1] opacity-80" />
      )}

      {/* Avg Angle — top left */}
      {avgAngle && (
        <div className="absolute top-4 left-4 z-10">
          <p className="text-white text-[9px] font-bold tracking-[0.2em] uppercase drop-shadow-sm mt-1 opacity-90">Avg Angle</p>
          <p className="text-white text-2xl font-black drop-shadow-md leading-none">{avgAngle}</p>
        </div>
      )}

      {/* Zone Overlay */}
      <div className="absolute inset-0 flex bg-black/10 transition-opacity group-hover:bg-black/20">
        {zones.map((zone, i) => (
          <div
            key={zone.label}
            className="flex-1 flex flex-col items-center justify-end pb-6 relative"
          >
            {/* Dashed Separator */}
            {i < zones.length - 1 && (
              <div className="absolute right-0 top-1/4 h-1/2 border-r border-dashed border-white/40" />
            )}
            
            {/* Data Labels */}
            <p className="text-white text-xl font-black drop-shadow-md leading-none">
              {zone.value}
            </p>
            <p className="text-white text-[9px] font-bold tracking-[0.2em] text-center whitespace-pre-line drop-shadow-sm mt-1 opacity-90 uppercase">
              {zone.label}
            </p>
          </div>
        ))}
      </div>

      {/* Play Overlay Button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
            <BsPlayFill size={32} className="text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}