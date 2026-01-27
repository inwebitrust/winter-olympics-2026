"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Flag from "@/components/Flag";
import CalendarIcon from "@/components/CalendarIcon";
import { chanceToNumber, getStars } from "@/lib/utils";
import { Athlete, Disciplin, CalendarDay, ChanceCategory } from "@/types";

const chanceOrder: Record<ChanceCategory, number> = {
  "Big Favourite": 1,
  "Favourite": 2,
  "Challenger": 3,
  "Outsider": 4,
  "Wildcard": 5,
};

export default function DisciplinPage() {
  const params = useParams();
  const disciplinId = params?.disciplin_id as string;

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();
        setAthletes(data.athletes || []);
        setDisciplins(data.disciplins || []);
        setCalendar(data.calendar || []);
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to main page
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{disciplin.name}</h1>
          <div className="flex items-center gap-4 text-gray-700">
            <span className="text-lg">Sport: {disciplin.sport}</span>
            {day && (
              <div className="flex items-center gap-2">
                <span>Date:</span>
                <CalendarIcon day={day} />
                <span>Day {day}</span>
              </div>
            )}
          </div>
        </div>

        {/* Athletes List */}
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
                    <span className="athlete-name font-semibold text-base">
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
