import Card from "@/components/ui/Card";
import { RiFireFill } from "react-icons/ri";
import { BsCheckCircleFill } from "react-icons/bs";


interface StreakTrackerProps {
  currentStreak: number;
  bestStreak: number;
  weekData: { label: string; isCompleted: boolean }[];
}

export default function StreakTracker({ 
  currentStreak = 0, 
  bestStreak = 0, 
  weekData = [] // SAFETY: Prevents .map() on undefined
}: StreakTrackerProps) {
  return (
    <Card>
      <div className="flex flex-col items-center">
        <p className="text-xs text-[#9CA3AF] self-start mb-2 uppercase font-bold tracking-widest">
          Best: {bestStreak} days
        </p>
        
        <div className="flex flex-col items-center gap-1 mb-5">
          <RiFireFill size={44} className="text-orange-500 animate-pulse" />
          <h2 className="text-2xl font-black text-gray-900 leading-none">
            {currentStreak} Day Streak
          </h2>
        </div>

        <div className="flex items-center justify-between w-full gap-2">
          {weekData.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                {day.label}
              </span>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                day.isCompleted ? "bg-[#12606A] shadow-md" : "bg-gray-100"
              }`}>
                {day.isCompleted && <BsCheckCircleFill size={16} className="text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}