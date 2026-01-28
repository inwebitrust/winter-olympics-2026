"use client";

import { useState, useEffect, useMemo } from "react";
import CalendarHeader from "@/components/CalendarHeader";
import FilterSidebar from "@/components/FilterSidebar";
import MethodologyModal from "@/components/MethodologyModal";
import Flag from "@/components/Flag";
import { Athlete, Disciplin, CalendarDay, Event, FilterState } from "@/types";

// Session definitions
// Morning: 2am to 12pm, Afternoon: 12pm to 6pm, Evening: 6pm to 2am
const SESSIONS = [
  { name: "Morning", startHour: 2, endHour: 12 },
  { name: "Afternoon", startHour: 12, endHour: 18 },
  { name: "Evening", startHour: 18, endHour: 26 }, // 26 = 2am next day (24+2)
];

// Helper to parse time string to hour number
function parseTimeToHour(timeStr: string): number {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
}

// Get session for a given hour
function getSessionForHour(hour: number): string {
  // Normalize hour for sessions that span midnight
  // Morning starts at 2am, so hours 0-1 are still Evening (previous day)
  const normalizedHour = hour < 2 ? hour + 24 : hour;
  
  if (normalizedHour >= 2 && normalizedHour < 12) return "Morning";
  if (normalizedHour >= 12 && normalizedHour < 18) return "Afternoon";
  return "Evening";
}

// Helper to parse time string to minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper to format hour for display
function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "00:00";
  if (hour < 10) return `0${hour}:00`;
  return `${hour}:00`;
}

// Helper to format day number as full date (Winter Olympics 2026: Feb 6-22)
function formatDayAsDate(dayNumber: string | null): string {
  if (!dayNumber) return "All Days";
  
  const day = parseInt(dayNumber, 10);
  if (isNaN(day)) return `Day ${dayNumber}`;
  
  // Winter Olympics 2026 is in February, day number = date in February
  const date = new Date(2026, 1, day); // Month is 0-indexed, so 1 = February
  
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const dayOfMonth = date.getDate();
  
  // Add ordinal suffix (1st, 2nd, 3rd, etc.)
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${weekday}, ${month} ${ordinal(dayOfMonth)}`;
}

// Convert Italy time (CET, UTC+1) to local time
// In February 2026, Italy is in CET (UTC+1), not CEST
function convertItalyTimeToLocal(timeStr: string, dayNumber: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Create a date in Italy timezone (February 2026)
  const day = parseInt(dayNumber, 10) || 7;
  // Italy is UTC+1 in February (CET)
  const italyDate = new Date(Date.UTC(2026, 1, day, hours - 1, minutes, 0));
  
  // Format in local timezone
  const localHours = italyDate.getHours().toString().padStart(2, "0");
  const localMinutes = italyDate.getMinutes().toString().padStart(2, "0");
  
  return `${localHours}:${localMinutes}`;
}

// Get user's timezone abbreviation
function getUserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Get short timezone name
    const date = new Date();
    const tzName = date.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ").pop();
    return tzName || timezone;
  } catch {
    return "Local";
  }
}

// Get sport from disciplin
function getSportFromDisciplin(disciplinId: string, disciplins: Disciplin[]): string {
  const disciplin = disciplins.find(
    (d) => String(d.disciplin_id).toLowerCase().trim() === String(disciplinId).toLowerCase().trim()
  );
  return disciplin?.sport || "Unknown";
}

// Get disciplin name
function getDisciplinName(disciplinId: string, disciplins: Disciplin[]): string {
  const disciplin = disciplins.find(
    (d) => String(d.disciplin_id).toLowerCase().trim() === String(disciplinId).toLowerCase().trim()
  );
  return disciplin?.name || disciplinId;
}

export default function CalendarPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    selectedDay: null,
    selectedSports: [],
    selectedCountries: [],
  });
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();
        setAthletes(data.athletes || []);
        setDisciplins(data.disciplins || []);
        setCalendar(data.calendar || []);
        setEvents(data.events || []);
        
        // Default to first day from events if available
        if (data.events && data.events.length > 0) {
          const eventDays = [...new Set(data.events.map((e: Event) => String(e.day)))].sort(
            (a, b) => parseInt(a as string) - parseInt(b as string)
          );
          if (eventDays.length > 0 && !filters.selectedDay) {
            setFilters((prev) => ({ ...prev, selectedDay: eventDays[0] as string }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get available days from events (for calendar page)
  const days = useMemo(() => {
    const daySet = new Set<string>();
    events.forEach((e) => {
      if (e.day) daySet.add(String(e.day));
    });
    return Array.from(daySet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [events]);

  // Filter events for selected day and countries
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    
    // Filter by day only - countries don't filter events
    if (filters.selectedDay) {
      filtered = filtered.filter((e) => String(e.day) === String(filters.selectedDay));
    }
    
    return filtered;
  }, [events, filters.selectedDay]);

  // Calculate country power for sidebar
  const countryPower = useMemo(() => {
    const powerMap = new Map<string, number>();
    athletes.forEach((athlete) => {
      if (athlete.country) {
        const currentPower = powerMap.get(athlete.country) || 0;
        const chanceValue =
          athlete.chance === "Big Favourite" ? 5 :
          athlete.chance === "Favourite" ? 4 :
          athlete.chance === "Challenger" ? 3 :
          athlete.chance === "Outsider" ? 2 :
          athlete.chance === "Wildcard" ? 1 : 0;
        powerMap.set(athlete.country, currentPower + chanceValue);
      }
    });
    return powerMap;
  }, [athletes]);

  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    athletes.forEach((a) => {
      if (a.country) countrySet.add(a.country);
    });
    return Array.from(countrySet).sort((a, b) => {
      const powerA = countryPower.get(a) || 0;
      const powerB = countryPower.get(b) || 0;
      if (powerA !== powerB) return powerB - powerA;
      return a.localeCompare(b);
    });
  }, [athletes, countryPower]);

  // Helper to get display hour for an event (Italy or local time)
  const getDisplayHour = (event: Event): number => {
    if (useLocalTime) {
      const localTime = convertItalyTimeToLocal(event.time_begin, event.day);
      return parseTimeToHour(localTime);
    }
    return parseTimeToHour(event.time_begin);
  };

  // Group events by session (based on displayed time)
  const eventsBySession = useMemo(() => {
    const result: { [key: string]: Event[] } = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };

    filteredEvents.forEach((event) => {
      const hour = getDisplayHour(event);
      const session = getSessionForHour(hour);
      result[session].push(event);
    });

    return result;
  }, [filteredEvents, useLocalTime]);

  // Get unique sports per session
  const sportsPerSession = useMemo(() => {
    const result: { [key: string]: string[] } = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };

    SESSIONS.forEach((session) => {
      const sessionEvents = eventsBySession[session.name] || [];
      const sportSet = new Set<string>();

      sessionEvents.forEach((event) => {
        const sport = getSportFromDisciplin(event.disciplin_id, disciplins);
        if (sport !== "Unknown") {
          sportSet.add(sport);
        }
      });

      result[session.name] = Array.from(sportSet).sort();
    });

    return result;
  }, [eventsBySession, disciplins]);

  // Get hours that have events for each session (only hours with events, using display time)
  const sessionHours = useMemo(() => {
    const result: { [key: string]: number[] } = {};

    SESSIONS.forEach((session) => {
      const sessionEvents = eventsBySession[session.name] || [];
      if (sessionEvents.length === 0) {
        result[session.name] = [];
        return;
      }

      // Collect only hours that have at least one event starting (using display time)
      const hoursWithEvents = new Set<number>();
      sessionEvents.forEach((event) => {
        const startHour = getDisplayHour(event);
        hoursWithEvents.add(startHour);
      });

      // Sort hours (handle overnight for evening session)
      const hoursArray = Array.from(hoursWithEvents);
      if (session.name === "Evening") {
        // Sort evening hours: 18-23, then 0-1
        hoursArray.sort((a, b) => {
          const normalizedA = a < 2 ? a + 24 : a;
          const normalizedB = b < 2 ? b + 24 : b;
          return normalizedA - normalizedB;
        });
      } else {
        hoursArray.sort((a, b) => a - b);
      }
      result[session.name] = hoursArray;
    });

    return result;
  }, [eventsBySession, useLocalTime]);

  const handleDaySelect = (day: string | null) => {
    setFilters((prev) => ({ ...prev, selectedDay: day }));
  };

  const handleCountryToggle = (country: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCountries: prev.selectedCountries.includes(country)
        ? prev.selectedCountries.filter((c) => c !== country)
        : [...prev.selectedCountries, country],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-auto">
      <CalendarHeader
        days={days}
        selectedDay={filters.selectedDay}
        onDaySelect={handleDaySelect}
        onMethodologyClick={() => setIsMethodologyModalOpen(true)}
        showAllDays={false}
        activePage="calendar"
        disciplins={disciplins}
      />
      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
      {/* Spacer for fixed header */}
      <div className="h-[125px] flex-shrink-0"></div>
      <div className="flex flex-1 relative">
        {isSidebarOpen && (
          <div
            className="sidebar-overlay md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <FilterSidebar
          countries={countries}
          countryPower={countryPower}
          selectedCountries={filters.selectedCountries}
          onCountryToggle={handleCountryToggle}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        {/* Spacer for fixed sidebar */}
        <div className="sidebar-spacer w-64 flex-shrink-0"></div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {formatDayAsDate(filters.selectedDay)}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setUseLocalTime(false)}
                className={`px-3 py-1 rounded ${
                  !useLocalTime
                    ? "bg-[#014a5c] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🇮🇹 Italy time
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => setUseLocalTime(true)}
                className={`px-3 py-1 rounded ${
                  useLocalTime
                    ? "bg-[#014a5c] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🕐 Your time ({getUserTimezone()})
              </button>
            </div>
          </div>

          {/* Sessions */}
          {SESSIONS.map((session) => {
            const sessionEvts = eventsBySession[session.name] || [];
            const hours = sessionHours[session.name] || [];
            const sessionSports = sportsPerSession[session.name] || [];

            if (sessionEvts.length === 0) return null;

            // Sort events by display time for single-column layout
            const sortedSessionEvts = [...sessionEvts].sort((a, b) => {
              const timeA = useLocalTime 
                ? convertItalyTimeToLocal(a.time_begin, a.day) 
                : a.time_begin;
              const timeB = useLocalTime 
                ? convertItalyTimeToLocal(b.time_begin, b.day) 
                : b.time_begin;
              return timeA.localeCompare(timeB);
            });

            return (
              <div key={session.name} className="mb-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                  {session.name}
                </h2>

                {/* Grid layout for large screens (>1280px) */}
                <div className="calendar-grid-desktop hidden xl:block">
                  {/* Sports header row */}
                  <div className="flex border-b border-gray-300 mb-2">
                    <div className="w-16 flex-shrink-0 text-xs font-semibold text-gray-500 p-2">
                      Time
                    </div>
                    <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
                      {sessionSports.map((sport) => (
                        <div
                          key={sport}
                          className="min-w-[120px] flex-1 text-xs font-semibold text-gray-700 p-2 text-center bg-gray-100 rounded"
                        >
                          {sport}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time rows */}
                  {hours.map((hour) => (
                    <div key={hour} className="flex border-b border-gray-100 min-h-[60px]">
                      {/* Time label */}
                      <div className="w-16 flex-shrink-0 text-xs text-gray-500 p-2 border-r border-gray-200">
                        {formatHour(hour)}
                      </div>

                      {/* Sport columns */}
                      <div className="flex-1 flex gap-2">
                        {sessionSports.map((sport) => {
                          // Find events for this sport and hour (using display time)
                          const cellEvents = sessionEvts.filter((event) => {
                            const eventSport = getSportFromDisciplin(event.disciplin_id, disciplins);
                            const startHour = getDisplayHour(event);
                            return eventSport === sport && startHour === hour;
                          });

                          return (
                            <div
                              key={sport}
                              className="min-w-[120px] flex-1 p-1 relative"
                            >
                              {cellEvents.map((event, idx) => (
                                <EventCard
                                  key={idx}
                                  event={event}
                                  disciplins={disciplins}
                                  athletes={athletes}
                                  selectedCountries={filters.selectedCountries}
                                  useLocalTime={useLocalTime}
                                  showSport={false}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Single-column layout for small screens (<=1280px) */}
                <div className="calendar-grid-mobile xl:hidden space-y-1">
                  {sortedSessionEvts.map((event, idx) => (
                    <EventCard
                      key={idx}
                      event={event}
                      disciplins={disciplins}
                      athletes={athletes}
                      selectedCountries={filters.selectedCountries}
                      useLocalTime={useLocalTime}
                      showSport={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No events found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Event Card Component
// Convert sport name to slug for icon filename
function sportToSlug(sport: string): string {
  return sport
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Get stars string from chance category
function getStarsFromChance(chance: string): string {
  const starsMap: Record<string, number> = {
    "Big Favourite": 5,
    "Favourite": 4,
    "Challenger": 3,
    "Outsider": 2,
    "Wildcard": 1,
  };
  const count = starsMap[chance] || 0;
  return "⭐".repeat(count);
}

// Get numeric value from chance for sorting
function chanceToNumber(chance: string): number {
  const chanceMap: Record<string, number> = {
    "Big Favourite": 5,
    "Favourite": 4,
    "Challenger": 3,
    "Outsider": 2,
    "Wildcard": 1,
  };
  return chanceMap[chance] || 0;
}

function EventCard({ 
  event, 
  disciplins, 
  athletes, 
  selectedCountries,
  useLocalTime,
  showSport = false
}: { 
  event: Event; 
  disciplins: Disciplin[]; 
  athletes: Athlete[];
  selectedCountries: string[];
  useLocalTime: boolean;
  showSport?: boolean;
}) {
  const [showFavorites, setShowFavorites] = useState(false);
  
  const disciplinName = getDisciplinName(event.disciplin_id, disciplins);
  const sport = getSportFromDisciplin(event.disciplin_id, disciplins);
  const sportSlug = sportToSlug(sport);
  const iconPath = `/icons/${sportSlug}.svg`;
  const isMedal = event.is_medal === "1";
  const isGame = event.is_game === "1";
  
  // Convert time if using local time
  const displayTime = useLocalTime
    ? convertItalyTimeToLocal(event.time_begin, event.day)
    : event.time_begin.slice(0, 5);

  // Get athletes from selected countries for this discipline (sorted by stars desc)
  const countryAthletes = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    // For games, only show athletes if one of the teams is in selected countries
    if (isGame) {
      const team1 = event.team_1?.toLowerCase();
      const team2 = event.team_2?.toLowerCase();
      const gameInvolvesSelectedCountry = 
        selectedCountries.includes(team1) || selectedCountries.includes(team2);
      
      if (!gameInvolvesSelectedCountry) return [];
    }
    
    const disciplinAthletes = athletes.filter(
      (a) => 
        String(a.disciplin_id).toLowerCase().trim() === String(event.disciplin_id).toLowerCase().trim() &&
        selectedCountries.includes(a.country?.toLowerCase())
    );
    
    // Sort by stars (highest first)
    return disciplinAthletes.sort((a, b) => chanceToNumber(b.chance) - chanceToNumber(a.chance));
  }, [athletes, event.disciplin_id, selectedCountries, isGame, event.team_1, event.team_2]);

  // Get athletes for medal events (for "see favorites" button), grouped by stars
  const favoritesByStars = useMemo(() => {
    if (!isMedal) return {};
    
    const disciplinAthletes = athletes.filter(
      (a) => String(a.disciplin_id).toLowerCase().trim() === String(event.disciplin_id).toLowerCase().trim()
    );
    
    // Group by chance/stars
    const grouped: Record<number, Athlete[]> = {};
    disciplinAthletes.forEach((athlete) => {
      const stars = chanceToNumber(athlete.chance);
      if (!grouped[stars]) grouped[stars] = [];
      grouped[stars].push(athlete);
    });
    
    return grouped;
  }, [isMedal, athletes, event.disciplin_id]);

  // Get sorted star levels (highest first)
  const starLevels = Object.keys(favoritesByStars)
    .map(Number)
    .sort((a, b) => b - a);

  // Medal event with country athletes = Medal chance (blue card)
  const isMedalChance = isMedal && countryAthletes.length > 0;

  return (
    <div
      className={`event-card text-xs p-2 rounded mb-1 border ${
        isMedalChance
          ? "bg-blue-50 border-blue-300"
          : isMedal
          ? "bg-yellow-50 border-yellow-300"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <img
          src={iconPath}
          alt={sport}
          className="w-4 h-4 object-contain flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {showSport && <span className="text-gray-500 font-normal">{sport} -</span>}
        <span className="truncate">{disciplinName}</span>
      </div>
      <div className="text-gray-500 truncate">
        {displayTime}{event.desc && ` | ${event.desc}`}
      </div>
      {isGame && event.team_1 && event.team_2 && (
        <div className="flex items-center gap-1 mt-1">
          <Flag country={event.team_1} className="w-4 h-3" />
          <span className="text-gray-600">vs</span>
          <Flag country={event.team_2} className="w-4 h-3" />
        </div>
      )}
      {isMedalChance && (
        <div className="text-blue-600 font-medium mt-1">🏅 Medal Chance</div>
      )}
      {isMedal && !isMedalChance && (
        <div className="text-yellow-600 font-medium mt-1">🏅 Medal Event</div>
      )}
      
      {/* Country athletes for this event */}
      {countryAthletes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          {countryAthletes.map((athlete, idx) => (
            <div key={idx} className="flex items-start gap-1 py-0.5">
              <Flag country={athlete.country} className="w-4 h-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-800 break-words">
                  {athlete.firstname} {athlete.lastname}
                </span>
                <span className="text-yellow-500 ml-1 whitespace-nowrap text-[10px]">
                  {getStarsFromChance(athlete.chance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* See all favorites button for medal events */}
      {isMedal && starLevels.length > 0 && (
        <>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="text-blue-600 hover:text-blue-800 underline mt-1 text-left"
          >
            {showFavorites ? "Hide all favorites ▲" : "See all favorites ▼"}
          </button>
          {showFavorites && (
            <div className="mt-2 pt-2 border-t border-yellow-200">
              {starLevels.map((stars) => (
                <div key={stars} className="mb-2">
                  <div className="font-medium text-gray-700">
                    {"⭐".repeat(stars)}
                  </div>
                  {favoritesByStars[stars].map((athlete, idx) => (
                    <div key={idx} className="flex items-center gap-1 ml-1 py-0.5">
                      <Flag country={athlete.country} className="w-4 h-3" />
                      <span className="text-gray-800">
                        {athlete.firstname} {athlete.lastname}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
