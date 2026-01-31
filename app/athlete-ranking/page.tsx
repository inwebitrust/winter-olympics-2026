"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import CalendarHeader from "@/components/CalendarHeader";
import MethodologyModal from "@/components/MethodologyModal";
import Flag from "@/components/Flag";
import CalendarIcon from "@/components/CalendarIcon";
import { chanceToNumber, getStars } from "@/lib/utils";
import { createAthleteSlug } from "@/lib/slug";
import { Athlete, Disciplin, CalendarDay, ChanceCategory } from "@/types";

function chanceToValue(chance: ChanceCategory | string): number {
  const chanceMap: Record<string, number> = {
    "Big Favourite": 5,
    "Favourite": 4,
    "Challenger": 3,
    "Outsider": 2,
    "Wildcard": 1,
  };
  return chanceMap[chance] || 0;
}

function normalizeKey(value: string): string {
  return String(value || "").trim().toLowerCase();
}

interface AthleteChance {
  disciplin_id: string;
  chance: ChanceCategory;
  disciplin?: Disciplin;
  day?: string | null;
}

interface AthleteRankingEntry {
  firstname: string;
  lastname: string;
  country: string;
  chanceCount: number;
  totalPower: number;
  chances: AthleteChance[];
}

export default function AthleteRankingPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [expandedAthleteKey, setExpandedAthleteKey] = useState<string | null>(null);

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

  const rankedAthletes = useMemo((): AthleteRankingEntry[] => {
    const byAthlete = new Map<string, { chances: AthleteChance[]; sample: Athlete }>();

    athletes.forEach((a) => {
      const key = `${normalizeKey(a.firstname)}|${normalizeKey(a.lastname)}|${normalizeKey(a.country)}`;
      const disciplin = disciplins.find(
        (d) => normalizeKey(d.disciplin_id) === normalizeKey(a.disciplin_id)
      );
      const calendarEntry = calendar.find(
        (c) => normalizeKey(c.disciplin_id) === normalizeKey(a.disciplin_id)
      );
      const chanceEntry: AthleteChance = {
        disciplin_id: a.disciplin_id,
        chance: a.chance as ChanceCategory,
        disciplin,
        day: calendarEntry?.day ?? null,
      };
      if (!byAthlete.has(key)) {
        byAthlete.set(key, { chances: [], sample: a });
      }
      byAthlete.get(key)!.chances.push(chanceEntry);
    });

    const entries: AthleteRankingEntry[] = [];
    byAthlete.forEach(({ chances, sample }) => {
      const totalPower = chances.reduce((sum, c) => sum + chanceToValue(c.chance), 0);
      entries.push({
        firstname: sample.firstname,
        lastname: sample.lastname,
        country: sample.country,
        chanceCount: chances.length,
        totalPower,
        chances: [...chances].sort((x, y) => chanceToValue(y.chance) - chanceToValue(x.chance)),
      });
    });

    return entries.sort((a, b) => b.totalPower - a.totalPower);
  }, [athletes, disciplins, calendar]);

  const days = useMemo(() => calendar.map((c) => c.day).filter((d) => d), [calendar]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader
        days={days}
        selectedDay={null}
        onDaySelect={handleDaySelect}
        onMethodologyClick={() => setIsMethodologyModalOpen(true)}
        showAllDays={false}
        disciplins={disciplins}
      />
      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
      <div className="h-[125px] flex-shrink-0" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Athlete Ranking</h1>
        <p className="text-gray-600 mb-6">
          Athletes ranked by total medal chances (sum of stars across disciplines). Expand a row to see details per discipline.
        </p>

        <div className="space-y-1">
          {rankedAthletes.map((entry, index) => {
            const rank = index + 1;
            const athleteKey = `${entry.firstname}-${entry.lastname}-${entry.country}`;
            const isExpanded = expandedAthleteKey === athleteKey;

            return (
              <div
                key={athleteKey}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedAthleteKey(isExpanded ? null : athleteKey)
                  }
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`flex-shrink-0 w-6 text-sm font-semibold text-gray-500 ${
                      rank <= 3 ? "text-[#014a5c]" : ""
                    }`}
                  >
                    {rank}
                  </span>
                  <span
                    className={`transform transition-transform flex-shrink-0 text-gray-400 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    aria-hidden
                  >
                    ▶
                  </span>
                  <Flag
                    country={entry.country}
                    className="w-6 h-6 object-cover rounded flex-shrink-0"
                  />
                  <Link
                    href={`/athlete/${createAthleteSlug(entry.firstname, entry.lastname)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-gray-800 hover:text-[#014a5c] hover:underline"
                  >
                    {entry.firstname} {entry.lastname}
                  </Link>
                  <span className="text-sm text-gray-500 ml-auto">
                    {entry.chanceCount} chance{entry.chanceCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-medium text-[#014a5c]">
                    {entry.totalPower} ⭐
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="space-y-2 pl-8">
                      {entry.chances.map((c) => (
                        <div
                          key={c.disciplin_id}
                          className="flex items-center gap-3 flex-wrap"
                        >
                          <CalendarIcon day={c.day} />
                          <Link
                            href={`/disciplin/${encodeURIComponent(c.disciplin_id)}`}
                            className="text-sm font-medium text-[#014a5c] hover:underline"
                          >
                            {c.disciplin?.name ?? c.disciplin_id}
                          </Link>
                          {c.disciplin?.sport && (
                            <span className="text-sm text-gray-500">
                              {c.disciplin.sport}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-600">
                            {getStars(chanceToNumber(c.chance))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
