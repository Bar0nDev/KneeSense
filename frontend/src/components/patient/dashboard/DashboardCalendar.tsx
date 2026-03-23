"use client";

import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useCalendar } from "@/hooks/useCalendar";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DashboardCalendarProps {
  highlightedDates: Record<string, string[]>;
}

export default function DashboardCalendar({ highlightedDates }: DashboardCalendarProps) {
  const { 
    year, 
    month, 
    calendarGrid, 
    selectedDay, 
    setSelectedDay, 
    navigateMonth, 
    isToday 
  } = useCalendar();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  return (
    <div className="w-full">
      {/* Header: Month & Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[15px] font-bold text-[#1C2121]">
          {MONTHS[month]} <span className="text-[#455858]/60 font-medium">{year}</span>
        </h2>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigateMonth("prev")} 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#455858]"
          >
            <IoChevronBackOutline size={16} />
          </button>
          <button 
            onClick={() => navigateMonth("next")} 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#455858]"
          >
            <IoChevronForwardOutline size={16} />
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[#455858]/40 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarGrid.map((cell, i) => {
          const isCurrent = cell.type === "current";
          const highlighted = isCurrent && highlightedDates[monthKey]?.includes(cell.day);
          const active = isCurrent && selectedDay === cell.day;
          const currentDay = isCurrent && isToday(cell.day);

          return (
            <button
              key={i}
              disabled={!isCurrent}
              onClick={() => isCurrent && setSelectedDay(cell.day)}
              className={`
                relative flex items-center justify-center text-[11px] font-semibold rounded-full w-8 h-8 mx-auto
                transition-all duration-200
                ${!isCurrent ? "text-gray-200" : "text-[#455858] hover:bg-[#F4F7F7]"}
                ${currentDay ? "bg-[#12606A] !text-white shadow-md shadow-[#12606A]/20" : ""}
                ${active && !currentDay ? "bg-[#30C3B1]/10 text-[#12606A] ring-1 ring-[#30C3B1]/30" : ""}
                ${highlighted && !currentDay && !active ? "text-[#12606A]" : ""}
              `}
            >
              {cell.day}
              
              {/* Highlight Indicator (Little dot below number) */}
              {highlighted && !currentDay && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#30C3B1]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}