"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SelectField } from "../../ui/FormFields";
import HeroButton from "@/components/ui/HeroButton";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { usePractitionerRegister } from "@/hooks/usePractitionerRegister";

export default function PractitionerForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    formData, 
    updateField, 
    handleFormSubmit, 
    isLoading, 
    error: apiError, 
    errors 
  } = usePractitionerRegister();

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold text-gray-900">Practitioner sign up</h2>
      <p className="mb-8 text-sm text-[#455858]">Fill in your details to get started.</p>

      {/* Global API Error Alert */}
      {apiError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
          {apiError}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
        {/* Row 1: Names */}
        <div className="grid grid-cols-2 gap-3">
          <Field 
            label="First Name" 
            placeholder="Jane" 
            value={formData.firstName}
            error={errors.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <Field 
            label="Last Name" 
            placeholder="Doe" 
            value={formData.lastName}
            error={errors.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>


        {/* Row 2: Email */}
        <Field
          label="Email"
          type="email"
          placeholder="jane@clinic.com"
          value={formData.email}
          error={errors.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        {/* Row 3: Passwords */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-[#455858]">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="min 8 characters"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`w-full rounded-xl border ${errors.password ? "border-red-500 bg-red-50/30" : "border-[#C7C7C7] bg-[#f0fafa]"} px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 inset-y-0 my-auto flex items-center transition-colors text-[#455858]/50 hover:text-[#455858]/80 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[10px] font-medium text-red-500 animate-pulse">{errors.password}</p>}
          </div>
          <Field 
            label="Confirm Password" 
            type={showPassword ? "text" : "password"}
            placeholder="repeat password"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
          />
        </div>

        {/* Row 4: Professional Info */}
        <Field 
          label="Clinic / Hospital" 
          placeholder="General Hospital" 
          value={formData.clinicName}
          error={errors.clinicName}
          onChange={(e) => updateField("clinicName", e.target.value)}
        />

        <SelectField
          label="Specialty"
          placeholder="Select specialty"
          options={["Physiotherapy", "Orthopedics", "Sports Medicine", "Rehabilitation", "Other"]}
          value={formData.specialty}
          error={errors.specialty}
          onChange={(e) => updateField("specialty", e.target.value)}
        />

        <div className="mt-2">
          <HeroButton type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </HeroButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#455858]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#30C3B1] hover:text-[#12606A] underline">
          Sign in
        </Link>
      </p>
    </>
  );
}