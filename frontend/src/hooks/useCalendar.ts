// hooks/use-calendar.ts
import { useState, useMemo } from "react";

export function useCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string>(String(today.getDate()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, direction === "next" ? month + 1 : month - 1, 1));
  };

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const cells: { day: string; type: "prev" | "current" | "next" }[] = [];

    // Prev month trailing
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: String(daysInPrevMonth - i), type: "prev" });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: String(d), type: "current" });
    }
    // Next month leading (to fill 6 rows/42 cells)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: String(d), type: "next" });
    }
    
    return cells;
  }, [year, month]);

  return {
    year,
    month,
    calendarGrid,
    selectedDay,
    setSelectedDay,
    navigateMonth,
    isToday: (day: string) => 
      today.getFullYear() === year && 
      today.getMonth() === month && 
      today.getDate() === Number(day),
  };
}