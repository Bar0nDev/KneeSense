"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SelectField } from "@/components/ui/FormFields";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import HeroButton from "@/components/ui/HeroButton";
import { usePatientRegister } from "@/hooks/usePatientRegister";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));
const SEX_OPTIONS = ["male", "female", "other"];

export default function PatientForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { formData, updateField, handleFormSubmit, isLoading, error: apiError, errors } = usePatientRegister();

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold text-gray-900">Patient sign up</h2>
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


        {/* Row 2: Username & Email */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Username"
            type="text"
            placeholder="janedoe123"
            value={formData.username}
            error={errors.username}
            onChange={(e) => updateField("username", e.target.value)}
          />
          <Field 
            label="Email" 
            type="email" 
            placeholder="jane@example.com" 
            value={formData.email}
            error={errors.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

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
            {errors.password && <p className="mt-1 text-[10px] font-medium text-red-500 animate-pulse absolute left-0 -bottom-5">{errors.password}</p>}
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

        {/* Row 4: Date of Birth */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#455858]">Date of Birth</label>
          <div className="grid grid-cols-3 gap-2">
            <SelectField 
              placeholder="Month" 
              options={MONTHS} 
              value={formData.month}
              error={errors.dob ? "" : undefined} // Shows red border if DOB incomplete
              onChange={(e) => updateField("month", e.target.value)}
            />
            <SelectField 
              placeholder="Day" 
              options={DAYS} 
              value={formData.day}
              error={errors.dob ? "" : undefined}
              onChange={(e) => updateField("day", e.target.value)}
            />
            <SelectField 
              placeholder="Year" 
              options={YEARS} 
              value={formData.year}
              error={errors.dob} // Only show the error text on the last field
              onChange={(e) => updateField("year", e.target.value)}
            />
          </div>
        </div>

        {/* Row 5: Biometrics */}
        <div className="grid grid-cols-3 gap-2">
          <SelectField
            label="Sex"
            placeholder="Sex"
            options={SEX_OPTIONS}
            value={formData.sex}
            error={errors.sex}
            onChange={(e) => updateField("sex", e.target.value)}
          />
          <Field
            label="Weight (kg)"
            type="number"
            placeholder="70"
            value={formData.weight}
            error={errors.weight}
            onChange={(e) => updateField("weight", e.target.value)}
          />
          <Field
            label="Height (cm)"
            type="number"
            placeholder="170"
            value={formData.height}
            error={errors.height}
            onChange={(e) => updateField("height", e.target.value)}
          />
        </div>

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