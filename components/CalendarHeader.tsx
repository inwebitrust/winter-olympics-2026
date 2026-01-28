"use client";

import { CalendarDay } from "@/types";
import Link from "next/link";

interface CalendarHeaderProps {
  days: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
  onMethodologyClick: () => void;
}

export default function CalendarHeader({ days, selectedDay, onDaySelect, onMethodologyClick }: CalendarHeaderProps) {
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
    <header className="calendar-header fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="calendar-header-top h-5 bg-[#014a5c] flex items-center justify-between px-4 sm:px-6">
        <span className="text-white text-xs font-medium">
          <span className="hidden sm:inline">Winter Olympics 2026 - Medal Chances by sports and countries</span>
          <span className="sm:hidden">WO2026 - Medal Chances</span>
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMethodologyClick}
            className="text-white text-xs font-medium hover:underline"
          >
            <span className="hidden sm:inline">Methodology</span>
            <span className="sm:hidden">Method</span>
          </button>
          <span className="text-white text-xs">|</span>
          <Link
            href="https://github.com/inwebitrust/winter-olympics-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-xs font-medium hover:underline"
          >
            <span className="hidden sm:inline">made by @inwebitrust</span>
            <span className="sm:hidden">@inwebitrust</span>
          </Link>
        </div>
      </div>
      <div className="calendar-header-container">
        <div className="calendar-day-buttons-wrapper overflow-x-auto overflow-y-hidden px-6 pt-4 pb-2">
          <div className="calendar-day-buttons flex gap-2 flex-nowrap w-max pb-2">
            <button
              onClick={() => onDaySelect(null)}
              className={`calendar-day-button calendar-day-button-all px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                className={`calendar-day-button px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
      </div>
    </header>
  );
}
