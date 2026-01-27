"use client";

interface CalendarIconProps {
  day: string | null;
}

export default function CalendarIcon({ day }: CalendarIconProps) {
  if (!day) return null;

  return (
    <span className="calendar-icon inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold text-gray-700 border border-gray-400 rounded bg-white relative overflow-hidden">
      {/* Calendar ring decoration at top */}
      <span className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 border-b border-gray-400"></span>
      {/* Day number */}
      <span className="calendar-icon-day relative z-10 pt-1">{day}</span>
    </span>
  );
}
