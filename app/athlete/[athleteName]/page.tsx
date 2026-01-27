"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Flag from "@/components/Flag";
import CalendarIcon from "@/components/CalendarIcon";
import { chanceToNumber, getStars } from "@/lib/utils";
import { parseAthleteSlug } from "@/lib/slug";
import { Athlete, Disciplin, CalendarDay, ChanceCategory } from "@/types";

const chanceOrder: Record<ChanceCategory, number> = {
  "Big Favourite": 1,
  "Favourite": 2,
  "Challenger": 3,
  "Outsider": 4,
  "Wildcard": 5,
};

export default function AthletePage() {
  const params = useParams();
  const athleteNameSlug = params?.athleteName as string;

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

  // Find the athlete by matching slug
  const athleteData = useMemo(() => {
    if (!athleteNameSlug) return null;
    
    const parsed = parseAthleteSlug(athleteNameSlug);
    if (!parsed) return null;

    return athletes.find(
      (a) => a.firstname.toLowerCase() === parsed.firstname.toLowerCase() &&
             a.lastname.toLowerCase() === parsed.lastname.toLowerCase()
    );
  }, [athletes, athleteNameSlug]);

  // Get all disciplines for this athlete, sorted by chance rank
  const athleteDisciplins = useMemo(() => {
    if (!athleteData) return [];

    const athleteDisciplinIds = new Set(
      athletes
        .filter(
          (a) => a.firstname.toLowerCase() === athleteData.firstname.toLowerCase() &&
                 a.lastname.toLowerCase() === athleteData.lastname.toLowerCase()
        )
        .map((a) => String(a.disciplin_id || "").trim().toLowerCase())
    );

    const disciplinEntries = Array.from(athleteDisciplinIds)
      .map((disciplinId) => {
        const disciplin = disciplins.find(
          (d) => String(d.disciplin_id || "").trim().toLowerCase() === disciplinId
        );
        const athleteEntry = athletes.find(
          (a) => a.firstname.toLowerCase() === athleteData.firstname.toLowerCase() &&
                 a.lastname.toLowerCase() === athleteData.lastname.toLowerCase() &&
                 String(a.disciplin_id || "").trim().toLowerCase() === disciplinId
        );
        const calendarEntry = calendar.find(
          (c) => String(c.disciplin_id || "").trim().toLowerCase() === disciplinId
        );

        if (!disciplin || !athleteEntry) return null;

        return {
          disciplin,
          chance: athleteEntry.chance,
          desc: (athleteEntry as any).desc || "",
          day: calendarEntry?.day || null,
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const orderA = chanceOrder[a.chance as ChanceCategory] || 999;
        const orderB = chanceOrder[b.chance as ChanceCategory] || 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.disciplin.name || "").localeCompare(b.disciplin.name || "");
      });

    return disciplinEntries;
  }, [athleteData, athletes, disciplins, calendar]);

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

  if (!athleteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Athlete not found</p>
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
          <div className="flex items-center gap-3 mb-4">
            <Flag country={athleteData.country} className="w-8 h-8 object-cover rounded flex-shrink-0" />
            <h1 className="text-3xl font-bold text-gray-800">
              {athleteData.firstname} {athleteData.lastname}
            </h1>
          </div>
        </div>

        {/* Medal Chances List */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Medal Chances</h2>
          {athleteDisciplins.map((entry, index) => {
            if (!entry) return null;

            const showCategoryHeader = currentCategory !== entry.chance;
            if (showCategoryHeader) {
              currentCategory = entry.chance as ChanceCategory;
            }

            const isFirst = showCategoryHeader && isFirstCategory;
            if (showCategoryHeader && isFirstCategory) {
              isFirstCategory = false;
            }

            return (
              <div key={index} className="athlete-item">
                {showCategoryHeader && (
                  <h3 className={`category-header text-lg font-bold text-gray-800 mb-2 pt-6 border-t border-gray-300 ${
                    isFirst ? 'mt-0 pt-0 border-t-0' : 'mt-8'
                  }`}>
                    {currentCategory} {getStars(chanceToNumber(currentCategory as ChanceCategory))}
                  </h3>
                )}
                <div className="athlete-card relative bg-white border border-gray-400 rounded-lg px-2 py-1">
                  <div className="pr-16">
                    {/* Discipline info */}
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/disciplin/${encodeURIComponent(entry.disciplin.disciplin_id)}`}
                        className="font-semibold text-base underline hover:text-blue-600"
                      >
                        {entry.disciplin.name}
                      </Link>
                      {entry.day && <CalendarIcon day={entry.day} />}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {entry.disciplin.sport}
                    </div>
                    {/* Description */}
                    {entry.desc && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        {entry.desc}
                      </p>
                    )}
                  </div>
                  {/* Rank badge - absolute top right */}
                  <span className="athlete-rank absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100">
                    {getStars(chanceToNumber(entry.chance as ChanceCategory))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {athleteDisciplins.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No disciplines found for this athlete.
          </div>
        )}
      </div>
    </div>
  );
}
