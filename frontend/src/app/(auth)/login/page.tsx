"use client";

import Link from "next/link";
import { useState } from "react";
import { GiKneeCap } from "react-icons/gi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Field } from "@/components/ui/FormFields";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen">

      {/* LEFT — Login form */}
      <div className="flex w-full flex-col justify-between bg-white px-10 py-10 md:w-[48%] lg:px-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <GiKneeCap size={26} color="#12606A" />
          <span className="text-[17px] font-semibold tracking-tight text-[#12606A]" style={{ fontFamily: "Georgia, serif" }}>
            KneeSense
          </span>
        </Link>

        {/* Form area */}
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-bold" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p className="mb-8 text-sm text-[#455858]">
            Enter your credentials to access your account.
          </p>

          <form className="flex flex-col gap-4">
            <Field label="Email address" type="email" placeholder="you@example.com" />

            {/* Password — custom since it has the show/hide toggle and forgot link */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#455858]">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium transition-colors hover:text-[#12606A] text-[#30C3B1]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="min 8 characters"
                  className="w-full rounded-xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-2.5 pr-11 text-sm outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-[#455858]/50 hover:text-[#455858]/80 cursor-pointer"
                >
                  {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #12606A, #30C3B1)" }}
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#455858]">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-[#30C3B1] hover:text-[#12606A] underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#455858]/50">
          © {new Date().getFullYear()} KneeSense. All rights reserved.
        </p>
      </div>

      {/* RIGHT — colorFlow2 background panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 md:flex md:w-[52%]"
        style={{
          backgroundImage: "url('/assets/colorFlow2.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col justify-end h-full">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Intelligent Knee Rehabilitation
          </p>
          <h2
            className="mb-4 max-w-xs text-4xl font-bold leading-tight text-white"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}
          >
            Smart recovery, <br />
            <span className="text-[#30C3B1]">every step forward.</span>
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-white/50">
            AI-driven motion sensing connects patients and practitioners for precise, personalized knee rehabilitation.
          </p>
        </div>
      </div>

    </div>
  );
}