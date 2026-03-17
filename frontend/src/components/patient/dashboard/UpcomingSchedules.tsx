// Color mapping stays in component — not passed as props
const SCHEDULE_COLORS: Record<string, { color: string; bgColor: string }> = {
  recording: { color: "bg-[#27AE60]", bgColor: "bg-[#27AE60]/10" },
  consultation: { color: "bg-[#2F80ED]", bgColor: "bg-[#2F80ED]/10" },
  default: { color: "bg-[#30C3B1]", bgColor: "bg-[#30C3B1]/10" },
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
    <div>
      <p className="text-sm font-bold mb-3">Upcoming Schedules</p>
      {schedules.map((schedule) => {
        const { color, bgColor } = SCHEDULE_COLORS[schedule.type] ?? SCHEDULE_COLORS.default;
        return (
          <div
            key={schedule.id}
            className={`flex items-stretch gap-3 mb-1.5 ${bgColor} rounded-lg overflow-hidden`}
          >
            {/* Color Indicator — flush to left edge */}
            <div className={`w-1.5 shrink-0 ${color}`} />

            {/* Info — padding only here */}
            <div className="py-2.5 pr-3">
              <p className="text-xs font-semibold">{schedule.title}</p>
              <p className="text-xs text-[#455858] mt-0.5">{schedule.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}