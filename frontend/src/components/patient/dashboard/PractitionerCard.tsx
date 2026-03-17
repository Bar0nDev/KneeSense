import Image from "next/image";
import Button from "@/components/ui/Button";
import { PiChatCircleDotsBold } from "react-icons/pi";

interface PractitionerCardProps {
  name: string;
  role: string;
  initials: string;
  image?: string | null;
}

export default function PractitionerCard({ name, role, initials, image = null }: PractitionerCardProps) {
  return (
    <div className="flex flex-col items-center text-center h-full gap-2">

      {/* Avatar / Image */}
      {image ? (
        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#30C3B1] flex items-center justify-center text-[#FDFDFD] text-2xl font-bold shrink-0">
          {initials}
        </div>
      )}

      {/* Name + Role */}
      <div className="leading-snug">
        <p className="text-base font-bold text-[#1C2121]">{name}</p>
        <p className="text-sm text-[#455858]">{role}</p>
      </div>

      {/* Button pinned to bottom */}
      <div className="mt-auto w-full">
        <Button bgColor="bg-[#3543A3]" hoverColor="hover:bg-[#2a3582]" size="md" fullWidth>
          <PiChatCircleDotsBold size={16} className="mr-1" />
          Contact Practitioner
        </Button>
      </div>

    </div>
  );
}