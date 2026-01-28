"use client";

import { useState, useMemo } from "react";
import { Disciplin } from "@/types";
import Link from "next/link";

interface CalendarHeaderProps {
  days: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
  onMethodologyClick: () => void;
  showAllDays?: boolean;
  activePage?: "home" | "calendar" | "sports";
  disciplins?: Disciplin[];
}

export default function CalendarHeader({ days, selectedDay, onDaySelect, onMethodologyClick, showAllDays = true, activePage = "home", disciplins = [] }: CalendarHeaderProps) {
  const [sportsMenuOpen, setSportsMenuOpen] = useState(false);
  const [hoveredSport, setHoveredSport] = useState<string | null>(null);
  const [expandedSport, setExpandedSport] = useState<string | null>(null); // For mobile accordion

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

  // Group disciplines by sport
  const sportsDisciplins = useMemo(() => {
    const grouped: Record<string, Disciplin[]> = {};
    disciplins.forEach((d) => {
      const sport = d.sport || "Other";
      if (!grouped[sport]) {
        grouped[sport] = [];
      }
      grouped[sport].push(d);
    });
    // Sort sports alphabetically and disciplines within each sport
    const sortedSports = Object.keys(grouped).sort();
    const result: Record<string, Disciplin[]> = {};
    sortedSports.forEach((sport) => {
      result[sport] = grouped[sport].sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
  }, [disciplins]);

  const sports = Object.keys(sportsDisciplins);

  return (
    <header className="calendar-header fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="calendar-header-top h-5 bg-[#014a5c] flex items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-white text-xs font-medium hover:underline">
          <span className="hidden sm:inline">Winter Olympics 2026 - Medal Chances by sports and countries</span>
          <span className="sm:hidden">WO2026 - Medal Chances</span>
        </Link>
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
      <nav className="calendar-header-nav bg-[#1b6e85] flex items-center gap-6 px-6 py-2 border-b border-gray-100">
        <Link 
          href="/" 
          className={`text-sm font-medium transition-colors ${
            activePage === "home" 
              ? "text-white" 
              : "text-white/70 hover:text-white"
          }`}
        >
          Home
        </Link>
        <Link 
          href="/calendar" 
          className={`text-sm font-medium transition-colors ${
            activePage === "calendar" 
              ? "text-white" 
              : "text-white/70 hover:text-white"
          }`}
        >
          Interactive Calendar
        </Link>
        {/* Sports Dropdown - Desktop (hover, submenu right) */}
        <div 
          className="relative hidden md-sports:block"
          onMouseEnter={() => setSportsMenuOpen(true)}
          onMouseLeave={() => {
            setSportsMenuOpen(false);
            setHoveredSport(null);
          }}
        >
          <button 
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              activePage === "sports" 
                ? "text-white" 
                : "text-white/70 hover:text-white"
            }`}
          >
            Sports <span className="text-xs">▼</span>
          </button>
          {sportsMenuOpen && sports.length > 0 && (
            <div className="absolute top-full left-0 mt-0 bg-white rounded-b-lg shadow-lg border border-gray-200 min-w-[200px] py-1 z-50">
              {sports.map((sport) => (
                <div 
                  key={sport}
                  className="relative"
                  onMouseEnter={() => setHoveredSport(sport)}
                >
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
                    <span>{sport}</span>
                    <span className="text-xs text-gray-400">▶</span>
                  </div>
                  {/* Disciplines submenu */}
                  {hoveredSport === sport && (
                    <div className="absolute top-0 left-full bg-white rounded-lg shadow-lg border border-gray-200 min-w-[220px] py-1 z-50">
                      {sportsDisciplins[sport].map((disciplin) => (
                        <Link
                          key={disciplin.disciplin_id}
                          href={`/disciplin/${disciplin.disciplin_id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setSportsMenuOpen(false);
                            setHoveredSport(null);
                          }}
                        >
                          {disciplin.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sports Dropdown - Mobile (accordion style, full width) */}
        <div className="relative md-sports:hidden">
          <button 
            onClick={() => {
              setSportsMenuOpen(!sportsMenuOpen);
              if (sportsMenuOpen) setExpandedSport(null);
            }}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              activePage === "sports" 
                ? "text-white" 
                : "text-white/70 hover:text-white"
            }`}
          >
            Sports <span className="text-xs">{sportsMenuOpen ? "▲" : "▼"}</span>
          </button>
          {sportsMenuOpen && sports.length > 0 && (
            <div className="sports-menu-mobile fixed left-0 right-0 top-[57px] bg-white shadow-lg border-b border-gray-200 max-h-[60vh] overflow-y-auto z-50">
              {sports.map((sport) => (
                <div key={sport}>
                  <button
                    onClick={() => setExpandedSport(expandedSport === sport ? null : sport)}
                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="font-medium">{sport}</span>
                    <span className="text-xs text-gray-400">{expandedSport === sport ? "▲" : "▼"}</span>
                  </button>
                  {/* Disciplines accordion content */}
                  {expandedSport === sport && (
                    <div className="bg-gray-50">
                      {sportsDisciplins[sport].map((disciplin) => (
                        <Link
                          key={disciplin.disciplin_id}
                          href={`/disciplin/${disciplin.disciplin_id}`}
                          className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 border-b border-gray-100"
                          onClick={() => {
                            setSportsMenuOpen(false);
                            setExpandedSport(null);
                          }}
                        >
                          {disciplin.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="calendar-header-container">
        <div className="calendar-day-buttons-wrapper overflow-x-auto overflow-y-hidden px-6 pt-4 pb-2">
          <div className="calendar-day-buttons flex gap-2 flex-nowrap w-max pb-2">
            {showAllDays && (
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
            )}
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
