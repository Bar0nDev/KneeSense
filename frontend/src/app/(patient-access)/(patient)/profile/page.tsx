"use client";

import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { FaUserAlt } from "react-icons/fa";
import { HiOutlineLockClosed, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useState } from "react";
import { InputField, ReadField } from "@/components/auth/profile/ProfileFields";
import PrimaryButton from "@/components/ui/PrimaryButton";
import HeroButton from "@/components/ui/HeroButton";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { PatientProfile } from "@/types/patient";

type Tab = "personal" | "medical" | "logout";

export default function ProfilePage() {


  const [tab, setTab] = useState<Tab>("personal");
  const { logout } = useAuth();
  const { userProfile } = useUser();

  // Real data from context
  const isPatient = userProfile?.role === "patient";
  const p = isPatient ? (userProfile.profile as PatientProfile) : null;
  const practitionerId = p?.practitioner_id ?? null;

  const { data: practitionerData } = useQuery({
    queryKey: ["practitioner-profile", practitionerId],
    queryFn: async () => {
      const practProfile = await userService.getPractitionerProfile(practitionerId!);
      const practUser = await userService.getUser(practProfile.user_id);
      return {
        name: practUser.name as string,
        clinic_name: practProfile.clinic_name as string | null,
        specialization: practProfile.specialization as string | null,
        
      };
    },
    enabled: !!practitionerId,
  });
  const nameParts = (p?.name ?? "").split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const email = userProfile?.user?.email ?? "";
  const displayName = p?.name ?? "";
  const displayRole = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : "";

  const tabs = [
    { key: "personal", label: "Personal Information", icon: FaUserAlt },
    { key: "medical", label: "Medical Information", icon: HiOutlineLockClosed },
    { key: "logout", label: "Log Out", icon: HiOutlineArrowRightOnRectangle },
  ];


  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information" />

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Panel */}
        <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar name={displayName} size={80} />
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{displayName}</p>
              <p className="text-sm text-[#455858]">{displayRole}</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="w-full flex flex-col gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left cursor-pointer ${
                  tab === key
                    ? "bg-[#E6F4F4] text-[#12606A]"
                    : "text-[#455858] hover:bg-gray-50"
                } ${key === "logout" ? "text-red-500 hover:bg-red-50 mt-4" : ""}`}
              >
                <Icon
                  size={15}
                  className={key === "logout" ? "text-red-400" : tab === key ? "text-[#12606A]" : "text-[#9CA3AF]"}
                />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 min-h-[400px]">
          {/* Personal Information */}
          {tab === "personal" && (
            <div className="animate-in fade-in duration-300">
              <p className="text-base font-bold text-gray-900 mb-6">Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name" defaultValue={firstName} />
                <InputField label="Last Name" defaultValue={lastName} />
                <InputField label="Email Address" type="email"  defaultValue={email}/>
                <InputField label="Date of Birth" defaultValue={p?.birthday ?? ""} />
              </div>
              <div className="flex gap-3 mt-8">
                <HeroButton variant="outline" className="flex-1 py-3" onClick={() => {}}>
                  Discard Changes
                </HeroButton>
                <HeroButton className="flex-1 py-3" onClick={() => {}}>
                  Save Changes
                </HeroButton>
              </div>
            </div>
          )}

          {/* Medical Information */}
          {tab === "medical" && (
            <div className="animate-in fade-in duration-300">
              <p className="text-base font-bold text-gray-900 mb-6">Medical Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadField label="Assigned Practitioner" value={practitionerData?.name ?? "—"} />
                <ReadField label="Specialization" value={practitionerData?.specialization ?? "—"} />
                <ReadField label="Clinic / Hospital" value={practitionerData?.clinic_name ?? "—"} />
                <ReadField label="Joined Date" value={
                  p?.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "—"
                } />
              </div>
              <p className="mt-6 text-xs text-[#9CA3AF]">
                Medical information is managed by your practitioner and cannot be edited here.
              </p>
            </div>
          )}

          {/* Log Out */}
          {tab === "logout" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-in zoom-in-95 duration-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <HiOutlineArrowRightOnRectangle size={28} className="text-red-400" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 mb-1">Log out of KneeSense</p>
                <p className="text-sm text-[#9CA3AF]">Are you sure you want to log out?</p>
              </div>
              <div className="flex gap-3 w-full max-w-sm mt-2">
                <PrimaryButton
                  onClick={() => setTab("personal")}
                  variant="outline"
                  color="#9CA3AF"
                  textColor="#455858"
                  className="flex-1 py-3"
                >
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  color="#EF4444"
                  textColor="#FFFFFF"
                  className="flex-1 py-3"
                  onClick={logout}
                >
                  Log Out
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}