"use client";

// Color mapping stays encapsulated in the component
const SCHEDULE_COLORS: Record<string, { color: string; bgColor: string }> = {
  recording: { color: "bg-[#27AE60]", bgColor: "bg-[#27AE60]/8" },
  consultation: { color: "bg-[#2F80ED]", bgColor: "bg-[#2F80ED]/8" },
  default: { color: "bg-[#30C3B1]", bgColor: "bg-[#30C3B1]/8" },
};

interface Schedule {
  id: number;
  title: string;
  date: string;
  type: "recording" | "consultation" | "default";
}

interface UpcomingSchedulesProps {
  schedules: Schedule[];
}

export default function UpcomingSchedules({ schedules }: UpcomingSchedulesProps) {
  return (
    <div className="flex flex-col gap-2">
      {schedules.length > 0 ? (
        schedules.map((schedule) => {
          const { color, bgColor } = 
            SCHEDULE_COLORS[schedule.type] ?? SCHEDULE_COLORS.default;

          return (
            <div
              key={schedule.id}
              className={`flex items-stretch gap-3 transition-all hover:translate-x-1 ${bgColor} rounded-xl overflow-hidden cursor-default`}
            >
              {/* Color Indicator — flush to left edge */}
              <div className={`w-1.5 shrink-0 ${color}`} />

              {/* Info Area */}
              <div className="py-3 pr-4 flex flex-col justify-center">
                <p className="text-[13px] font-bold text-[#1C2121] leading-tight">
                  {schedule.title}
                </p>
                <p className="text-[11px] text-[#455858] font-medium mt-1 opacity-80 uppercase tracking-tight">
                  {schedule.date}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-[#455858] italic">No upcoming events</p>
        </div>
      )}
    </div>
  );
}