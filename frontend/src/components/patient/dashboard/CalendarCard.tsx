"use client";

import Card from "@/components/ui/Card";
import DashboardCalendar from "@/components/patient/dashboard/DashboardCalendar";
import UpcomingSchedules from "@/components/patient/dashboard/UpcomingSchedules";

// Mock data — standardized to match the year 2026
const highlightedDates: Record<string, string[]> = {
  "2026-03": ["21", "28"],
};

const schedules = [
  { id: 1, title: "Recording Session", date: "March 21, 2026", type: "recording" as const },
  { id: 2, title: "Online Consultation", date: "March 28, 2026", type: "consultation" as const },
];



export default function CalendarCard() {
  return (
    <Card>
      
      {/* Visual Calendar Component */}
      <div className="w-full border-b border-gray-100 pb-1.5 mb-3.5">
        <DashboardCalendar highlightedDates={highlightedDates} />
      </div>


      {/* List of Schedules */}
      <div className="flex-1">
        <h3 className="text-[11px] font-bold text-[#455858]/60 uppercase tracking-widest mb-3.5">
          Upcoming Schedule
        </h3>
        <UpcomingSchedules schedules={schedules} />
      </div>


    </Card>
  );
}