import DashboardCalendar from "@/components/patient/dashboard/DashboardCalendar";
import UpcomingSchedules from "@/components/patient/dashboard/UpcomingSchedules";

// Mock data — replace with real API data later
const highlightedDates: Record<string, string[]> = {
  "2026-03": ["21", "28"],
};

const schedules = [
  { id: 1, title: "Recording Session", date: "March 21, 2026", type: "recording" as const },
  { id: 2, title: "Online Consultation", date: "March 28, 2026", type: "consultation" as const },
];

export default function CalendarCard() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardCalendar highlightedDates={highlightedDates} />
      <UpcomingSchedules schedules={schedules} />
    </div>
  );
}