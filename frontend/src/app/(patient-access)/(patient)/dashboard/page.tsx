"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import WelcomeCard from "@/components/patient/dashboard/WelcomeCard";
import PractitionerCard from "@/components/patient/dashboard/PractitionerCard";
import CalendarCard from "@/components/patient/dashboard/CalendarCard";
import KneeAngleCard from "@/components/patient/dashboard/KneeAngleCard";
import PatientTaskCard from "@/components/patient/dashboard/PatientTaskCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { patient, practitioner, tasks, isLoading } = useDashboardData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch pb-10">
      
      {/* Main Insights */}
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        <WelcomeCard
          name={patient.name}
          lastSession={patient.lastSession}
        />
        
        <KneeAngleCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PatientTaskCard type="session" {...tasks.session} />
          <PatientTaskCard type="rehab" {...tasks.rehab} />
        </div>
      </div>

      {/* Clinical Context */}
      <aside className="flex flex-col gap-6 w-full lg:w-70 shrink-0">
        <PractitionerCard {...practitioner} />
        <CalendarCard />
      </aside>

    </div>
  );
}