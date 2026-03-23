"use client";

import PageHeader from "@/components/ui/PageHeader";
import { FaUserAlt } from "react-icons/fa";
import { HiOutlineLockClosed, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useProfile, Tab } from "@/hooks/useProfile";
import { InputField, ReadField } from "@/components/profile/ProfileFields";
import PrimaryButton from "@/components/ui/PrimaryButton";
import HeroButton from "@/components/ui/HeroButton";

export default function ProfilePage() {
  const { tab, setTab, profile } = useProfile();

  const tabs = [
    { key: "personal", label: "Personal Information", icon: FaUserAlt },
    { key: "medical", label: "Medical Information", icon: HiOutlineLockClosed },
    { key: "logout", label: "Log Out", icon: HiOutlineArrowRightOnRectangle },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" subtitle="Manage your personal information" />

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Panel */}
        <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, #12606A, #30C3B1)" }}
            >
              {profile.initials}
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{profile.name}</p>
              <p className="text-sm text-[#455858]">{profile.role}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{profile.location}</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="w-full flex flex-col gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left ${
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
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          {/* Personal Information */}
          {tab === "personal" && (
            <>
              <p className="text-base font-bold text-gray-900 mb-6">Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name" defaultValue={profile.personal.firstName} />
                <InputField label="Last Name" defaultValue={profile.personal.lastName} />
                <InputField label="Email Address" type="email" defaultValue={profile.personal.email} />
                <InputField label="Date of Birth" defaultValue={profile.personal.dateOfBirth} />
              </div>

              <div className="flex gap-3 mt-8">
                <HeroButton
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => { /* handle discard */ }}
                >
                  Discard Changes
                </HeroButton>

                <HeroButton
                  className="flex-1 py-3"
                  onClick={() => { /* handle save */ }}
                >
                  Save Changes
                </HeroButton>
              </div>
            </>
          )}

          {/* Medical Information */}
          {tab === "medical" && (
            <>
              <p className="text-base font-bold text-gray-900 mb-6">Medical Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadField label="Assigned Practitioner" value={profile.medical.practitioner} />
                <ReadField label="Clinic / Hospital" value={profile.medical.clinic} />
                <ReadField label="Practitioner Code" value={profile.medical.practitionerCode} />
                <ReadField label="Joined Date" value={profile.medical.joinedDate} />
              </div>
              <p className="mt-6 text-xs text-[#9CA3AF]">
                Medical information is managed by your practitioner and cannot be edited here.
              </p>
            </>
          )}

          {/* Log Out */}
          {tab === "logout" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
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
                  color="#EF4444" // red-500
                  textColor="#FFFFFF"
                  className="flex-1 py-3"
                  onClick={() => console.log("Logging out...")}
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