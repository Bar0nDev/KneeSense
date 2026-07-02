"use client";

import Link from "next/link";
import { useState } from "react";
import { GiKneeCap } from "react-icons/gi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Field } from "@/components/ui/FormFields";
import HeroButton from "@/components/ui/HeroButton";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT — Login form */}
      <div className="flex w-full flex-col justify-between bg-white px-10 py-10 md:w-[48%] lg:px-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <GiKneeCap size={26} color="#12606A" />
          <h1 className="text-[17px] font-semibold tracking-tight text-[#12606A]">
            KneeSense
          </h1>
        </Link>

        {/* Form area */}
        <div className="mx-auto w-full max-w-sm">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="mb-8 text-sm text-[#455858]">
            Enter your credentials to access your account.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 text-center animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error ? "" : undefined}
            />

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-xs font-medium text-[#455858]">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-medium transition-colors hover:text-[#12606A] text-[#30C3B1]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border ${error ? "border-red-500 bg-red-50/30" : "border-[#C7C7C7] bg-[#f0fafa]"} px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-[#455858]/50 hover:text-[#455858]/80 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-2">
              <HeroButton type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </HeroButton>
            </div>
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

      {/* RIGHT — Visual Panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 md:flex md:w-[52%]"
        style={{
          backgroundImage: "url('/assets/colorFlow2.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-end h-full">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            The Future of Visuotactile Knee Rehabilitation
          </p>
          <h2 className="mb-4 max-w-xs text-3xl font-bold leading-tight text-white">
            <span className="text-[#30C3B1]">Visuotactile Sensing</span><br />
            for High-Resolution Knee Monitoring.
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            KneeSense bridges the gap between laboratory motion capture and home recovery.
          </p>
        </div>
      </div>
    </div>
  );
}
