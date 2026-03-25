"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SelectField } from "@/components/ui/FormFields";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import HeroButton from "@/components/ui/HeroButton";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));

export default function PatientForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold text-gray-900">Patient sign up</h2>
      <p className="mb-8 text-sm text-[#455858]">Fill in your details to get started.</p>

      <form className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" type="text" placeholder="Jane" />
          <Field label="Last Name" type="text" placeholder="Doe" />
        </div>

        <Field label="Email" type="email" placeholder="jane@example.com" />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#455858]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="min 8 characters"
              className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 pr-11 text-sm outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#455858]/50 hover:text-[#455858]/80 cursor-pointer"
            >
              {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Date of Birth</label>
          <div className="grid grid-cols-3 gap-2">
            <SelectField placeholder="Month" options={MONTHS} />
            <SelectField placeholder="Day" options={DAYS} />
            <SelectField placeholder="Year" options={YEARS} />
          </div>
        </div>

        <HeroButton onClick={() => console.log('Clicked!')}>
          Create Account
        </HeroButton>
      </form>

      <p className="mt-6 text-sm text-[#455858]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#30C3B1] hover:text-[#12606A] underline">
          Sign in
        </Link>
      </p>
    </>
  );
}