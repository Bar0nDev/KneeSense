"use client";

import { useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";


const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DashboardCalendarProps {
  highlightedDates: Record<string, string[]>;
}

export default function DashboardCalendar({ highlightedDates }: DashboardCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(String(today.getDate()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: string) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === Number(day);

  const isHighlighted = (day: string) =>
    highlightedDates[monthKey]?.includes(day);

  // Build calendar grid
  const cells: { day: string; type: "prev" | "current" | "next" }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: String(daysInPrevMonth - i), type: "prev" });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: String(d), type: "current" });
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: String(d), type: "next" });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
            onClick={prevMonth}
            className="p-1 rounded-md hover:bg-[#0e4f57]/10 text-[#12606A] transition-colors cursor-pointer"
        >
            <IoChevronBackOutline size={16} />
        </button>
        <span className="text-sm font-bold ">
          {MONTHS[month]} {year}
        </span>
        <button
            onClick={nextMonth}
            className="p-1 rounded-md hover:bg-[#0e4f57]/10 text-[#12606A] transition-colors cursor-pointer"
        >
            <IoChevronForwardOutline size={16} />
        </button>

      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isCurrent = cell.type === "current";
          const todayCell = isCurrent && isToday(cell.day);
          const highlighted = isCurrent && isHighlighted(cell.day);
          const selected = isCurrent && selectedDate === cell.day;

          return (
            <div
              key={i}
              onClick={() => isCurrent && setSelectedDate(cell.day)}
              className={`
                flex items-center justify-center text-xs rounded-full w-7 h-7 mx-auto my-1 transition-colors
                ${isCurrent ? "cursor-pointer" : "cursor-default"}
                ${!isCurrent ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}
                ${todayCell ? "bg-[#12606A] text-white hover:bg-[#0e4f57] font-bold" : ""}
                ${highlighted && !todayCell ? "border border-[#30C3B1] text-[#12606A] font-semibold" : ""}
                ${selected && !todayCell ? "bg-[#E6F4F5] text-[#12606A] font-semibold" : ""}
              `}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}