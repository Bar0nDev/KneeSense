import WelcomeCard from "@/components/patient/dashboard/WelcomeCard";
import PractitionerCard from "@/components/patient/dashboard/PractitionerCard";
import CalendarCard from "@/components/patient/dashboard/CalendarCard";
import KneeAngleCard from "@/components/patient/dashboard/KneeAngleCard";
import PatientTaskCard from "@/components/patient/dashboard/PatientTaskCard";
import Card from "@/components/ui/Card";

// Mock data — replace with real API/auth data later
const mockPatient = {
  name: "Kevin",
  lastSession: "Feb 28, 2026",
};

const mockPractitioner = {
  name: "Dr. Jane Doe, MD",
  role: "Physician",
  initials: "JD",
  image: null,
};

const mockSession = {
  title: "Mar 21, 2026",
  subtitle: "TODAY",
};

const mockRehab = {
  title: "4-step Anti-frailty",
  subtitle: "Complete your daily exercises",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">

      {/* Top Row — Welcome + Practitioner */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 min-w-0">
          <WelcomeCard
            name={mockPatient.name}
            lastSession={mockPatient.lastSession}
            className="h-full"
          />
        </div>
        <Card className="w-full lg:w-64 shrink-0">
          <PractitionerCard {...mockPractitioner} />
        </Card>
      </div>

      {/* Bottom Row — Charts + Calendar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        {/* Left Column — Knee Angle + Task Cards */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <Card className="w-full">
            <KneeAngleCard />
          </Card>
          <div className="flex flex-row gap-4">
            <Card className="flex-1">
              <PatientTaskCard type="session" {...mockSession} />
            </Card>
            <Card className="flex-1">
              <PatientTaskCard type="rehab" {...mockRehab} />
            </Card>
          </div>
        </div>

        {/* Right Column — Calendar */}
        <Card className="w-full lg:w-72 shrink-0">
          <CalendarCard />
        </Card>

      </div>

    </div>
  );
}