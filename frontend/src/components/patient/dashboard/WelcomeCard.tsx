"use client";

import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface WelcomeCardProps {
  lastSession: string;
  className?: string;
}

export default function WelcomeCard({ lastSession, className = "" }: WelcomeCardProps) {
  const router = useRouter();
  const { userProfile } = useUser();

  const fullName = userProfile?.role === "patient" ? userProfile.profile.name : "";
  const firstName = fullName.split(" ")[0];

  console.log(userProfile);

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[2rem] px-10 py-10 shadow-sm ${className}`}
      style={{
        backgroundImage: "url('/assets/colorFlow3.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="z-10 flex flex-1 flex-col">
        <h2 className="mb-1 text-3xl font-bold text-white">
          Welcome back, {firstName}
        </h2>
        <p className="mb-8 font-semibold text-sm text-white/80">
          Your last recorded session was on {lastSession}.
        </p>
        <div className="mt-auto">
          <CTAButton onClick={() => router.push("/progress")}>
            View Progress
          </CTAButton>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-auto z-0 pointer-events-none">
        <Image
          src="/assets/kneesense.png"
          alt="Knee illustration"
          height={0}
          width={0}
          sizes="100vw"
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </div>
  );
}