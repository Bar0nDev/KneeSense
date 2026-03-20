"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SelectField } from "../../ui/FormFields";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function PractitionerForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Practitioner sign up</h1>
      <p className="mb-8 text-sm text-[#455858]">Fill in your details to get started.</p>

      <form className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" type="text" placeholder="Jane" />
          <Field label="Last Name" type="text" placeholder="Doe" />
        </div>

        <Field label="Email" type="email" placeholder="jane@clinic.com" />

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

        <Field label="Clinic / Hospital" type="text" placeholder="General Hospital" />
        <Field label="License Number" type="text" placeholder="PRC-XXXXXXXX" />
        <SelectField
          label="Specialty"
          options={["Physiotherapy", "Orthopedics", "Sports Medicine", "Rehabilitation", "Other"]}
        />

        <button
          type="submit"
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #12606A, #30C3B1)" }}
        >
          Create Account
        </button>
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