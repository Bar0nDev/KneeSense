import Link from "next/link";

import { GiKneeCap } from "react-icons/gi";
import { FaArrowRightLong } from "react-icons/fa6";

export default function Home() {
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
          <span className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
            KneeSense
          </span>
        </div>
        {/* <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="rounded-full border border-[#30C3B1]/35 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div> */}
      </nav>

      {/* Full-height hero */}
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-end pb-16">
        <div className="flex flex-col items-center px-6 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Intelligent Knee Rehabilitation
          </p>
          <h1
            className="mb-4 max-w-lg text-[2.6rem] font-bold leading-[1.15] text-white"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}
          >
            Smart recovery, <br />
            <span className="text-[#30C3B1]">every step forward.</span>
          </h1>
          <p className="mb-10 max-w-[360px] text-[13px] leading-relaxed text-white/70">
            AI-driven motion sensing connects patients and practitioners for precise, personalized knee rehabilitation.
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="flex items-center gap-4 rounded-full bg-white py-0.5 pl-6 pr-0.5 text-sm font-semibold text-[#12606A] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            Get Started
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30C3B1] text-white">
              <FaArrowRightLong size={13} />
            </span>
          </Link>

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