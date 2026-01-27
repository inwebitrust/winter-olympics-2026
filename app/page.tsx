"use client";

import { useState, useEffect, useMemo } from "react";
import CalendarHeader from "@/components/CalendarHeader";
import FilterSidebar from "@/components/FilterSidebar";
import AthleteList from "@/components/AthleteList";
import SportIcon from "@/components/SportIcon";
import MethodologyModal from "@/components/MethodologyModal";
import { Athlete, Disciplin, CalendarDay, FilterState } from "@/types";

export default function Home() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    selectedDay: null,
    selectedSports: [],
    selectedCountries: [],
  });
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();
        setAthletes(data.athletes || []);
        setDisciplins(data.disciplins || []);
        setCalendar(data.calendar || []);
        
        // Debug logging
        console.log("Fetched athletes:", data.athletes?.length || 0);
        console.log("Fetched disciplins:", data.disciplins?.length || 0);
        if (data.disciplins && data.disciplins.length > 0) {
          console.log("Sample disciplin:", data.disciplins[0]);
        }
        if (data.athletes && data.athletes.length > 0) {
          console.log("Sample athlete:", data.athletes[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get unique sports
  const sports = useMemo(() => {
    const sportSet = new Set<string>();
    disciplins.forEach((d) => {
      if (d.sport) sportSet.add(d.sport);
    });
    return Array.from(sportSet).sort();
  }, [disciplins]);

  // Check if a sport has disciplines on the selected day
  const sportHasDisciplinsOnDay = useMemo(() => {
    if (!filters.selectedDay) {
      // If no day selected, all sports are active
      return new Set<string>(sports);
    }
    
    const disciplinIdsForDay = new Set(
      calendar
        .filter((c) => c.day === filters.selectedDay)
        .map((c) => String(c.disciplin_id || "").trim().toLowerCase())
    );
    
    const activeSports = new Set<string>();
    disciplins.forEach((d) => {
      const disciplinId = String(d.disciplin_id || "").trim().toLowerCase();
      if (disciplinIdsForDay.has(disciplinId) && d.sport) {
        activeSports.add(d.sport);
      }
    });
    
    return activeSports;
  }, [sports, disciplins, calendar, filters.selectedDay]);

  // Get available days from calendar
  const days = useMemo(() => {
    return calendar.map((c) => c.day).filter(Boolean);
  }, [calendar]);

  // Filter athletes based on selected filters
  const filteredAthletes = useMemo(() => {
    let filtered = [...athletes];

    // Filter by day
    if (filters.selectedDay) {
      const disciplinIdsForDay = new Set(
        calendar
          .filter((c) => c.day === filters.selectedDay)
          .map((c) => String(c.disciplin_id || "").trim().toLowerCase())
      );
      filtered = filtered.filter((a) =>
        disciplinIdsForDay.has(String(a.disciplin_id || "").trim().toLowerCase())
      );
    }

    // Filter by sports
    if (filters.selectedSports.length > 0) {
      const disciplinIdsForSports = new Set(
        disciplins
          .filter((d) => filters.selectedSports.includes(d.sport))
          .map((d) => String(d.disciplin_id || "").trim().toLowerCase())
      );
      filtered = filtered.filter((a) =>
        disciplinIdsForSports.has(String(a.disciplin_id || "").trim().toLowerCase())
      );
    }

    // Filter by countries
    if (filters.selectedCountries.length > 0) {
      filtered = filtered.filter((a) =>
        filters.selectedCountries.includes(a.country)
      );
    }

    // Add disciplin info to athletes
    return filtered.map((athlete) => {
      // Normalize disciplin_id for matching (trim and lowercase)
      const athleteDisciplinId = String(athlete.disciplin_id || "").trim().toLowerCase();
      const disciplin = disciplins.find((d) => {
        const dDisciplinId = String(d.disciplin_id || "").trim().toLowerCase();
        return dDisciplinId === athleteDisciplinId;
      });
      
      // Debug logging if discipline not found
      if (!disciplin && athlete.disciplin_id) {
        console.warn(`Discipline not found for disciplin_id: "${athlete.disciplin_id}"`);
      }
      
      return { ...athlete, disciplin };
    });
  }, [athletes, disciplins, calendar, filters]);

  // Calculate country power (sum of chance values) for filtered athletes
  const countryPower = useMemo(() => {
    const powerMap = new Map<string, number>();
    filteredAthletes.forEach((athlete) => {
      if (athlete.country) {
        const currentPower = powerMap.get(athlete.country) || 0;
        // Convert chance category to number (5,4,3,2,1)
        const chanceValue = athlete.chance === "Big Favourite" ? 5 :
                           athlete.chance === "Favourite" ? 4 :
                           athlete.chance === "Challenger" ? 3 :
                           athlete.chance === "Outsider" ? 2 :
                           athlete.chance === "Wildcard" ? 1 : 0;
        powerMap.set(athlete.country, currentPower + chanceValue);
      }
    });
    return powerMap;
  }, [filteredAthletes]);

  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    athletes.forEach((a) => {
      if (a.country) countrySet.add(a.country);
    });
    // Sort countries by power (descending), then alphabetically
    return Array.from(countrySet).sort((a, b) => {
      const powerA = countryPower.get(a) || 0;
      const powerB = countryPower.get(b) || 0;
      if (powerA !== powerB) {
        return powerB - powerA; // Descending order
      }
      return a.localeCompare(b);
    });
  }, [athletes, countryPower]);

  const handleDaySelect = (day: string | null) => {
    setFilters((prev) => ({ ...prev, selectedDay: day }));
  };

  const handleSportToggle = (sport: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter((s) => s !== sport)
        : [...prev.selectedSports, sport],
    }));
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
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col min-w-[800px]">
      <CalendarHeader
        days={days}
        selectedDay={filters.selectedDay}
        onDaySelect={handleDaySelect}
        onMethodologyClick={() => setIsMethodologyModalOpen(true)}
      />
      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
      <div className="flex flex-1">
        <FilterSidebar
          countries={countries}
          countryPower={countryPower}
          selectedCountries={filters.selectedCountries}
          onCountryToggle={handleCountryToggle}
        />
        <div className="flex-1 flex flex-col">
          {/* Sports Icons */}
          <div className="sports-container px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sports</h3>
            <div className="sports-icons flex flex-wrap gap-3 items-start justify-center pb-3 border-b border-gray-300">
              {sports.map((sport) => (
                <SportIcon
                  key={sport}
                  sport={sport}
                  isSelected={filters.selectedSports.includes(sport)}
                  isDimmed={!sportHasDisciplinsOnDay.has(sport)}
                  onClick={() => handleSportToggle(sport)}
                />
              ))}
            </div>
          </div>
          {/* Athlete List */}
          <AthleteList athletes={filteredAthletes} calendar={calendar} />
        </div>
      </div>
    </div>
  );
}