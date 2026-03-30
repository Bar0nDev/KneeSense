"use client";

import Avatar from "@/components/ui/Avatar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Card from "@/components/ui/Card";
import { PiChatCircleDotsBold } from "react-icons/pi";

interface PractitionerCardProps {
  name: string;
  specialization: string | null;
  image?: string | null;
}

export default function PractitionerCard({
  name,
  specialization,
  image = null,
}: PractitionerCardProps) {
  return (
    <Card className="flex flex-col items-center text-center gap-2">

      {/* Avatar */}
      <Avatar name={name} image={image} size={80} />

      {/* Name + Specialization */}
      <div className="leading-snug">
        <h2 className="text-base font-bold text-[#1C2121] tracking-tight">{name}</h2>
        <p className="text-sm text-[#455858] font-medium opacity-80">{specialization}</p>
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