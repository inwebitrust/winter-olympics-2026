"use client";

import { CalendarDay } from "@/types";

interface CalendarHeaderProps {
  days: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
}

export default function CalendarHeader({ days, selectedDay, onDaySelect }: CalendarHeaderProps) {
  // Sort days as integers (numeric sort)
  const uniqueDays = Array.from(new Set(days)).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    // If both are valid numbers, sort numerically
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // If one is not a number, keep string sort for that comparison
    return a.localeCompare(b);
  });

  return (
    <header className="calendar-header sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="calendar-header-top h-5 bg-[#014a5c] flex items-center px-6">
        <span className="text-white text-xs font-medium">Winter Olympics 2026 - Medal Chances by sports and countries</span>
      </div>
      <div className="calendar-header-container flex items-center gap-4 px-6 py-4">
        <div className="calendar-day-buttons flex gap-2 flex-wrap">
          <button
            onClick={() => onDaySelect(null)}
            className={`calendar-day-button calendar-day-button-all px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === null
                ? "bg-[#014a5c] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Days
          </button>
          {uniqueDays.map((day) => (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              className={`calendar-day-button px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day
                  ? "bg-[#014a5c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
