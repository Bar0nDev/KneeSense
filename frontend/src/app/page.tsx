"use client"; // Required for useRouter and onClick handlers

import { useRouter } from "next/navigation";
import Link from "next/link";
import { GiKneeCap } from "react-icons/gi";
import CTAButton from "@/components/ui/CTAButton"; // Adjust path as needed

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/assets/colorFlow2.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-0.5 text-white">
          <GiKneeCap size={26} />
          <h1 
            className="text-xl font-semibold tracking-tight text-white" 
          >
            KneeSense
          </h1>
        </div>
      </nav>

      {/* Full-height hero */}
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-end pb-16">
        <div className="flex flex-col items-center px-6 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Intelligent Knee Rehabilitation
          </p>
          <h2
            className="mb-4 max-w-lg text-[2.6rem] font-bold leading-[1.15] text-white"
          >
            Smart recovery, <br />
            <span className="text-[#30C3B1]">every step forward.</span>
          </h2>
          <p className="mb-10 max-w-[360px] text-[13px] leading-relaxed text-white/70">
            AI-driven motion sensing connects patients and practitioners for precise, personalized knee rehabilitation.
          </p>

          {/* CTA - Now using your Button Component */}
          <CTAButton onClick={handleGetStarted}>
            Get Started
          </CTAButton>

          <p className="mt-4 text-[11px] text-white/50">
            New to KneeSense?{" "}
            <Link href="/register" className="transition-colors hover:text-white text-[#30C3B1] font-medium underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}