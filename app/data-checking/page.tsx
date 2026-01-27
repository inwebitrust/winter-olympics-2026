"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Athlete, Disciplin, CalendarDay, ChanceCategory } from "@/types";

const chanceToValue = (chance: ChanceCategory | string): number => {
  const chanceMap: Record<string, number> = {
    "Big Favourite": 5,
    "Favourite": 4,
    "Challenger": 3,
    "Outsider": 2,
    "Wildcard": 1,
  };
  return chanceMap[chance] || 0;
};

interface DisciplinStats {
  disciplin: Disciplin;
  day: string | null;
  chanceSum: number;
  athleteCount: number;
}

export default function DataCheckingPage() {
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

  // Calculate stats per discipline
  const disciplinStats = useMemo((): DisciplinStats[] => {
    return disciplins.map((disciplin) => {
      const disciplinId = String(disciplin.disciplin_id || "").trim().toLowerCase();
      
      // Find athletes for this discipline
      const disciplinAthletes = athletes.filter(
        (a) => String(a.disciplin_id || "").trim().toLowerCase() === disciplinId
      );

      // Sum the chance values
      const chanceSum = disciplinAthletes.reduce(
        (sum, athlete) => sum + chanceToValue(athlete.chance),
        0
      );

      // Find the day for this discipline
      const calendarEntry = calendar.find(
        (c) => String(c.disciplin_id || "").trim().toLowerCase() === disciplinId
      );

      return {
        disciplin,
        day: calendarEntry?.day || null,
        chanceSum,
        athleteCount: disciplinAthletes.length,
      };
    }).sort((a, b) => b.chanceSum - a.chanceSum); // Sort by chanceSum descending
  }, [athletes, disciplins, calendar]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalChanceSum = disciplinStats.reduce((sum, d) => sum + d.chanceSum, 0);
    const totalAthletes = disciplinStats.reduce((sum, d) => sum + d.athleteCount, 0);
    return { totalChanceSum, totalAthletes };
  }, [disciplinStats]);

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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to main page
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Checking</h1>
          <p className="text-gray-600">
            Check chance distribution across disciplines. Total: {totalStats.totalChanceSum} stars across {totalStats.totalAthletes} entries in {disciplinStats.length} disciplines.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-300">Discipline</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-300">Sport</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 border-b border-gray-300">Day</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 border-b border-gray-300">Athletes</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 border-b border-gray-300">Chance Sum</th>
              </tr>
            </thead>
            <tbody>
              {disciplinStats.map((stat, index) => (
                <tr 
                  key={stat.disciplin.disciplin_id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                >
                  <td className="px-4 py-2 border-b border-gray-200">
                    <Link 
                      href={`/disciplin/${encodeURIComponent(stat.disciplin.disciplin_id)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {stat.disciplin.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-gray-700">
                    {stat.disciplin.sport}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center text-gray-700">
                    {stat.day || '-'}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center text-gray-700">
                    {stat.athleteCount}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    <span className={`font-semibold ${
                      stat.chanceSum === 0 ? 'text-red-600' :
                      stat.chanceSum < 5 ? 'text-orange-600' :
                      stat.chanceSum > 20 ? 'text-green-600' :
                      'text-gray-700'
                    }`}>
                      {stat.chanceSum} ⭐
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold mb-1">Color Legend:</p>
          <ul className="flex gap-4">
            <li><span className="text-red-600 font-semibold">Red</span>: 0 stars (no athletes)</li>
            <li><span className="text-orange-600 font-semibold">Orange</span>: &lt;5 stars (few chances)</li>
            <li><span className="text-gray-700 font-semibold">Gray</span>: 5-20 stars (normal)</li>
            <li><span className="text-green-600 font-semibold">Green</span>: &gt;20 stars (many chances)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
