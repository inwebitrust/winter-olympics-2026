"use client";

import React from "react";
import Link from "next/link";
import { Athlete, Disciplin, ChanceCategory, CalendarDay } from "@/types";
import Flag from "./Flag";
import CalendarIcon from "./CalendarIcon";
import { chanceToNumber, getStars } from "@/lib/utils";
import { createAthleteSlug } from "@/lib/slug";

interface AthleteListProps {
  athletes: (Athlete & { disciplin?: Disciplin })[];
  calendar: CalendarDay[];
}

const chanceOrder: Record<ChanceCategory, number> = {
  "Big Favourite": 1,
  "Favourite": 2,
  "Challenger": 3,
  "Outsider": 4,
  "Wildcard": 5,
};

const chanceColors: Record<ChanceCategory, string> = {
  "Big Favourite": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Favourite": "bg-blue-100 text-blue-800 border-blue-300",
  "Challenger": "bg-green-100 text-green-800 border-green-300",
  "Outsider": "bg-purple-100 text-purple-800 border-purple-300",
  "Wildcard": "bg-gray-100 text-gray-800 border-gray-300",
};

export default function AthleteList({ athletes, calendar }: AthleteListProps) {
  // Helper function to get day number for an athlete
  const getDayNumber = (athlete: Athlete): number => {
    const calendarEntry = calendar.find(
      (c) => String(c.disciplin_id || "").trim().toLowerCase() === 
             String(athlete.disciplin_id || "").trim().toLowerCase()
    );
    const day = calendarEntry?.day;
    if (!day) return 9999; // Put athletes without days at the end
    const dayNum = parseInt(day, 10);
    return isNaN(dayNum) ? 9999 : dayNum;
  };

  const sortedAthletes = [...athletes].sort((a, b) => {
    // First sort by chance category
    const orderA = chanceOrder[a.chance as ChanceCategory] || 999;
    const orderB = chanceOrder[b.chance as ChanceCategory] || 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Within same category, sort by calendar day
    const dayA = getDayNumber(a);
    const dayB = getDayNumber(b);
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    
    // Finally sort by name
    return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
  });

  let currentCategory: ChanceCategory | null = null;
  let isFirstCategory = true;

  return (
    <main className="athlete-list-main flex-1 pt-0 px-6 pb-6 overflow-y-auto">
      <div className="athlete-list-container w-full space-y-2 flex flex-col items-center">
        {sortedAthletes.map((athlete, index) => {
          const showCategoryHeader = currentCategory !== athlete.chance;
          if (showCategoryHeader) {
            currentCategory = athlete.chance as ChanceCategory;
          }

          const isFirst = showCategoryHeader && isFirstCategory;
          if (showCategoryHeader && isFirstCategory) {
            isFirstCategory = false;
          }

          return (
            <React.Fragment key={index}>
              {showCategoryHeader && (
                <div className="w-full flex-shrink-0">
                  <h2 className={`category-header text-lg font-bold text-gray-800 mb-2 pt-6 border-t border-gray-300 ${
                    isFirst ? 'mt-0 pt-0 border-t-0' : 'mt-8'
                  }`}>
                    {currentCategory} {getStars(chanceToNumber(currentCategory as ChanceCategory))}
                  </h2>
                </div>
              )}
              <div className="athlete-item max-w-[400px] w-full">
                <div
                  className="athlete-card relative bg-white border border-gray-400 rounded-lg px-2 py-1"
                >
                {/* Rank badge - absolute top right */}
                <span
                  className="athlete-rank absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100"
                >
                  {getStars(chanceToNumber(athlete.chance as ChanceCategory))}
                </span>
                
                  {/* First line: flag - name */}
                  <div className="athlete-name-line flex items-center gap-2 pr-16">
                    <Flag country={athlete.country} className="athlete-flag w-4 h-4 object-cover rounded flex-shrink-0" />
                    <Link 
                      href={`/athlete/${createAthleteSlug(athlete.firstname, athlete.lastname)}`}
                      className="athlete-name font-semibold text-[0.9rem] hover:text-blue-600 cursor-pointer"
                    >
                      {athlete.firstname} {athlete.lastname}
                    </Link>
                  </div>
                
                {/* Second line: sport name - discipline name */}
                {athlete.disciplin && (() => {
                  // Find the day for this athlete's discipline
                  const calendarEntry = calendar.find(
                    (c) => String(c.disciplin_id || "").trim().toLowerCase() === 
                           String(athlete.disciplin_id || "").trim().toLowerCase()
                  );
                  const day = calendarEntry?.day || null;

                  return (
                    <div className="athlete-disciplin-line flex items-center gap-2 mt-0.5 text-[0.8rem] text-gray-700">
                      <CalendarIcon day={day} />
                      <span className="athlete-sport">{athlete.disciplin.sport}</span>
                      <span className="athlete-separator">-</span>
                      <Link 
                        href={`/disciplin/${encodeURIComponent(athlete.disciplin_id)}`}
                        className="athlete-disciplin underline hover:text-blue-600 cursor-pointer"
                      >
                        {athlete.disciplin.name}
                      </Link>
                    </div>
                  );
                })()}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {sortedAthletes.length === 0 && (
          <div className="athlete-empty-state text-center py-12 text-gray-500">
            No athletes found matching the selected filters.
          </div>
        )}
      </div>
    </main>
  );
}
