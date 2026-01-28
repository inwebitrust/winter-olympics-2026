"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Flag from "@/components/Flag";
import CalendarIcon from "@/components/CalendarIcon";
import CalendarHeader from "@/components/CalendarHeader";
import MethodologyModal from "@/components/MethodologyModal";
import { chanceToNumber, getStars } from "@/lib/utils";
import { Athlete, Disciplin, CalendarDay, ChanceCategory, Event } from "@/types";

const chanceOrder: Record<ChanceCategory, number> = {
  "Big Favourite": 1,
  "Favourite": 2,
  "Challenger": 3,
  "Outsider": 4,
  "Wildcard": 5,
};

// Convert sport name to slug for icon filename
function sportToSlug(sport: string): string {
  return sport
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Convert disciplin_id to slug for background image
function disciplinToSlug(disciplinId: string): string {
  return disciplinId
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Helper to format day number as full date (Winter Olympics 2026: Feb 6-22)
function formatDayAsDate(dayNumber: string | null): string {
  if (!dayNumber) return "";
  
  const day = parseInt(dayNumber, 10);
  if (isNaN(day)) return `Day ${dayNumber}`;
  
  // Winter Olympics 2026 is in February, day number = date in February
  const date = new Date(2026, 1, day); // Month is 0-indexed, so 1 = February
  
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  
  // Add ordinal suffix
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${weekday}, ${month} ${getOrdinal(day)}`;
}

export default function DisciplinPage() {
  const params = useParams();
  const disciplinId = params?.disciplin_id as string;

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();
        setAthletes(data.athletes || []);
        setDisciplins(data.disciplins || []);
        setCalendar(data.calendar || []);
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Find the discipline
  const disciplin = useMemo(() => {
    if (!disciplinId) return null;
    return disciplins.find(
      (d) => String(d.disciplin_id || "").trim().toLowerCase() === 
             String(disciplinId || "").trim().toLowerCase()
    );
  }, [disciplins, disciplinId]);

  // Find the day for this discipline
  const day = useMemo(() => {
    if (!disciplinId) return null;
    const calendarEntry = calendar.find(
      (c) => String(c.disciplin_id || "").trim().toLowerCase() === 
             String(disciplinId || "").trim().toLowerCase()
    );
    return calendarEntry?.day || null;
  }, [calendar, disciplinId]);

  // Get athletes for this discipline, sorted the same way as the main list
  const disciplinAthletes = useMemo(() => {
    if (!disciplinId) return [];
    
    const filtered = athletes.filter(
      (a) => String(a.disciplin_id || "").trim().toLowerCase() === 
             String(disciplinId || "").trim().toLowerCase()
    );

    // Helper function to get day number for sorting
    const getDayNumber = (athlete: Athlete): number => {
      const calendarEntry = calendar.find(
        (c) => String(c.disciplin_id || "").trim().toLowerCase() === 
               String(athlete.disciplin_id || "").trim().toLowerCase()
      );
      const day = calendarEntry?.day;
      if (!day) return 9999;
      const dayNum = parseInt(day, 10);
      return isNaN(dayNum) ? 9999 : dayNum;
    };

    return filtered.sort((a, b) => {
      // First sort by chance category
      const orderA = chanceOrder[a.chance as ChanceCategory] || 999;
      const orderB = chanceOrder[b.chance as ChanceCategory] || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Within same category, sort by name
      return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
    }).map((athlete) => ({
      ...athlete,
      disciplin,
    }));
  }, [athletes, disciplinId, disciplin, calendar]);

  // Get events for this discipline, sorted by day and time
  const disciplinEvents = useMemo(() => {
    if (!disciplinId) return [];
    
    return events
      .filter(
        (e) => String(e.disciplin_id || "").trim().toLowerCase() === 
               String(disciplinId || "").trim().toLowerCase()
      )
      .sort((a, b) => {
        // Sort by day first
        const dayA = parseInt(a.day, 10) || 0;
        const dayB = parseInt(b.day, 10) || 0;
        if (dayA !== dayB) return dayA - dayB;
        // Then by time
        return (a.time_begin || "").localeCompare(b.time_begin || "");
      });
  }, [events, disciplinId]);

  // Get days from calendar for the header
  const days = useMemo(() => {
    return calendar.map((c) => c.day).filter((d) => d);
  }, [calendar]);

  // Dummy handler for day select (not used on this page but required by CalendarHeader)
  const handleDaySelect = () => {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!disciplin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Discipline not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to main page
          </Link>
        </div>
      </div>
    );
  }

  let currentCategory: ChanceCategory | null = null;
  let isFirstCategory = true;

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader
        days={days}
        selectedDay={null}
        onDaySelect={handleDaySelect}
        onMethodologyClick={() => setIsMethodologyModalOpen(true)}
        showAllDays={false}
        activePage="sports"
        disciplins={disciplins}
      />
      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
      {/* Spacer for fixed header */}
      <div className="h-[125px] flex-shrink-0"></div>
      
      {/* Disciplin Header with background image */}
      <div 
        className="disciplin-head w-full relative bg-cover bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/disciplins/${disciplinToSlug(disciplin.disciplin_id)}.png')`,
          backgroundPosition: '50% top',
          minHeight: '200px',
        }}
      >
        <div className="max-w-4xl mx-auto p-6 flex flex-col justify-end h-full min-h-[200px]">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{disciplin.name}</h1>
          <div className="flex items-center gap-4 text-white flex-wrap">
            <div className="flex items-center gap-2">
              <img
                src={`/icons/${sportToSlug(disciplin.sport)}.svg`}
                alt={disciplin.sport}
                className="w-6 h-6 object-contain brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-lg drop-shadow">{disciplin.sport}</span>
            </div>
            {day && (
              <div className="flex items-center gap-2">
                <CalendarIcon day={day} />
                <span className="drop-shadow">{formatDayAsDate(day)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Events/Schedule */}
        {disciplinEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule</h2>
            <div className="space-y-2">
              {disciplinEvents.map((event, index) => (
                <div 
                  key={index}
                  className={`event-card rounded-lg px-4 py-3 border ${
                    event.is_medal === "1" 
                      ? "bg-yellow-50 border-yellow-300" 
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CalendarIcon day={event.day} />
                      <span className="text-sm text-gray-600">{formatDayAsDate(event.day)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {event.time_begin}
                      {event.desc && ` | ${event.desc}`}
                    </span>
                    {event.is_medal === "1" && (
                      <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                        🏅 Medal Event
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Athletes List */}
        <h2 className="text-xl font-bold text-gray-800">Medal Favorites</h2>
        <div className="space-y-2">
          {disciplinAthletes.map((athlete, index) => {
            const showCategoryHeader = currentCategory !== athlete.chance;
            if (showCategoryHeader) {
              currentCategory = athlete.chance as ChanceCategory;
            }

            const isFirst = showCategoryHeader && isFirstCategory;
            if (showCategoryHeader && isFirstCategory) {
              isFirstCategory = false;
            }

            return (
              <div key={index} className="athlete-item">
                {showCategoryHeader && (
                  <h2 className={`category-header text-lg font-bold text-gray-800 mb-2 pt-6 border-t border-gray-300 ${
                    isFirst ? 'mt-0 pt-0 border-t-0' : 'mt-8'
                  }`}>
                    {currentCategory} {getStars(chanceToNumber(currentCategory as ChanceCategory))}
                  </h2>
                )}
                <div className="athlete-card relative bg-white border border-gray-400 rounded-lg px-2 py-1">
                  {/* Rank badge - absolute top right */}
                  <span className="athlete-rank absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100">
                    {getStars(chanceToNumber(athlete.chance as ChanceCategory))}
                  </span>
                  
                  {/* First line: flag - name */}
                  <div className="athlete-name-line flex items-center gap-2 pr-16">
                    <Flag country={athlete.country} className="athlete-flag w-4 h-4 object-cover rounded flex-shrink-0" />
                    <span className="athlete-name font-semibold text-base text-gray-900">
                      {athlete.firstname} {athlete.lastname}
                    </span>
                  </div>
                  
                  {/* Second line: sport name - discipline name */}
                  {athlete.disciplin && (
                    <div className="athlete-disciplin-line flex items-center gap-2 mt-0.5 text-sm text-gray-700">
                      <CalendarIcon day={day} />
                      <span className="athlete-sport">{athlete.disciplin.sport}</span>
                      <span className="athlete-separator">-</span>
                      <span className="athlete-disciplin">{athlete.disciplin.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {disciplinAthletes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No athletes found for this discipline.
          </div>
        )}
      </div>
    </div>
  );
}
