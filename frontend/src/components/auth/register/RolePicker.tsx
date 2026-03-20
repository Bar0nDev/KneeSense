import Link from "next/link";

import { FaUserMd, FaUser  } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa6";

type Role = "practitioner" | "patient";

interface RolePickerProps {
  onSelect: (role: Role) => void;
}

export default function RolePicker({ onSelect }: RolePickerProps) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
      <p className="mb-8 text-sm text-[#455858]">Who are you signing up as?</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onSelect("practitioner")}
          className="group flex items-center justify-between rounded-2xl border border-[#C7C7C7] px-5 py-4 text-left transition-all hover:border-[#30C3B1] hover:bg-[#f0fafa] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0fafa]" style={{ border: "1px solid rgba(48,195,177,0.3)" }}>
              <FaUserMd size={18} color="#12606A" />
            </div>
            <div>
              <p className="text-sm font-semibold">Practitioner</p>
              <p className="text-xs text-[#455858]">Clinician, physio, or specialist</p>
            </div>
          </div>
          <FaAngleRight size={16} color="#30C3B1" className="opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        <button
          onClick={() => onSelect("patient")}
          className="group flex items-center justify-between rounded-2xl border border-[#C7C7C7] px-5 py-4 text-left transition-all hover:border-[#30C3B1] hover:bg-[#f0fafa] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0fafa]" style={{ border: "1px solid rgba(48,195,177,0.3)" }}>
              <FaUser size={18} color="#12606A" />
            </div>
            <div>
              <p className="text-sm font-semibold">Patient</p>
              <p className="text-xs text-[#455858]">Recovering from knee surgery or injury</p>
            </div>
          </div>
          <FaAngleRight size={16} color="#30C3B1" className="opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      <p className="mt-8 text-sm text-[#455858]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#30C3B1] hover:text-[#12606A] underline">
          Sign in
        </Link>
      </p>
    </>
  );
}