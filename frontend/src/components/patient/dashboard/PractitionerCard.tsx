"use client";

import Image from "next/image";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Card from "@/components/ui/Card";
import { PiChatCircleDotsBold } from "react-icons/pi";

interface PractitionerCardProps {
  name: string;
  role: string;
  initials: string;
  image?: string | null;
}

export default function PractitionerCard({ 
  name, 
  role, 
  initials, 
  image = null,
}: PractitionerCardProps) {
  return (
    <Card className="flex flex-col items-center text-center gap-2">
      
      {/* Avatar / Image */}
      {image ? (
        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 shadow-sm">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-17 h-17 rounded-full bg-[#30C3B1] flex items-center justify-center text-[#FDFDFD] text-2xl font-bold shrink-0 shadow-sm">
          {initials}
        </div>
      )}

      {/* Name + Role */}
      <div className="leading-snug">
        <h2 className="text-base font-bold text-[#1C2121] tracking-tight">{name}</h2>
        <p className="text-sm text-[#455858] font-medium opacity-80">{role}</p>
      </div>

      {/* PrimaryButton pinned to bottom */}
      <div className="w-full">
        <PrimaryButton
          variant="filled"
          color="#3543A3"
          fullWidth
          className="gap-1"
        >
          <PiChatCircleDotsBold size={18} />
          Contact Practitioner
        </PrimaryButton>
      </div>

    </Card>
  );
}