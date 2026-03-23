"use client";

import { useState } from "react";
import RolePicker from "@/components/auth/register/RolePicker";
import PractitionerForm from "@/components/auth/register/PractitionerForm";
import PatientForm from "@/components/auth/register/PatientForm";

import { FaChevronLeft } from "react-icons/fa6";
import { GiKneeCap } from "react-icons/gi";

type Role = "practitioner" | "patient" | null;

export default function RegisterPage() {
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-6 py-10">

        {/* Back + Logo */}
        <div className="mb-8">
          {role ? (
            <button
              onClick={() => setRole(null)}
              className="mb-4 flex items-center gap-1 text-[#12606A] transition-colors hover:text-gray-600"
            >
              <FaChevronLeft size={18} />
            </button>
          ) : (
            <a href="/" className="mb-4 flex items-center gap-1 text-gray-400 transition-colors hover:text-gray-600">
              <FaChevronLeft size={18} />
            </a>
          )}

          <div className="flex items-center gap-0.5">
            <GiKneeCap size={22} color="#12606A" />
            <h1 className="text-[15px] font-semibold text-[#12606A]">
              KneeSense
            </h1>
          </div>
        </div>

        {role === null && <RolePicker onSelect={setRole} />}
        {role === "practitioner" && <PractitionerForm />}
        {role === "patient" && <PatientForm />}

      </div>
    </div>
  );
}