"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CalendarHeader from "@/components/CalendarHeader";
import MethodologyModal from "@/components/MethodologyModal";
import Flag from "@/components/Flag";
import CalendarIcon from "@/components/CalendarIcon";
import { chanceToNumber, getStars } from "@/lib/utils";
import { getCountryName, getCountryCodeFromSlug } from "@/lib/countries";
import { createAthleteSlug } from "@/lib/slug";
import { Athlete, Disciplin, CalendarDay, Event, ChanceCategory } from "@/types";

const CHANCE_ORDER: Record<ChanceCategory, number> = {
  "Big Favourite": 5,
  "Favourite": 4,
  "Challenger": 3,
  "Outsider": 2,
  "Wildcard": 1,
};

function formatDayAsDate(dayNumber: string | null): string {
  if (!dayNumber) return "";
  const day = parseInt(dayNumber, 10);
  if (isNaN(day)) return `Jour ${dayNumber}`;
  const date = new Date(2026, 1, day);
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  const getOrdinal = (n: number) => {
    if (n === 1) return "1er";
    return `${n}`;
  };
  return `${weekday} ${getOrdinal(day)} ${month}`;
}

function normalizeKey(value: string): string {
  return String(value || "").trim().toLowerCase();
}

export default function DailyCountryPage() {
  const params = useParams();
  const countrySlug = params?.country_slug as string;
  const dayParam = params?.day as string;

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [disciplins, setDisciplins] = useState<Disciplin[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  const router = useRouter();
  const countryCode = useMemo(
    () => (countrySlug ? getCountryCodeFromSlug(countrySlug) : null),
    [countrySlug]
  );
  const countryName = countryCode ? getCountryName(countryCode) : "";

  const handleDaySelect = (day: string | null) => {
    if (day && countrySlug) {
      router.push(`/daily/${encodeURIComponent(countrySlug)}/${encodeURIComponent(day)}`);
    }
  };

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

  // Disciplines that have a MEDAL event on this day (meilleure chance / autres chances = only medal events that day)
  const disciplinIdsMedalEventDay = useMemo(() => {
    return Array.from(
      new Set(
        events
          .filter(
            (e) =>
              normalizeKey(e.day) === normalizeKey(dayParam) && e.is_medal === "1"
          )
          .map((e) => normalizeKey(e.disciplin_id))
      )
    );
  }, [events, dayParam]);

  // Athletes from this country in disciplines with a medal event THIS day (sorted by chance, best first)
  const countryAthletesForDay = useMemo(() => {
    if (!countryCode) return [];
    const codeNorm = normalizeKey(countryCode);
    return athletes
      .filter(
        (a) =>
          normalizeKey(a.country) === codeNorm &&
          disciplinIdsMedalEventDay.includes(normalizeKey(a.disciplin_id))
      )
      .map((a) => {
        const disciplin = disciplins.find(
          (d) => normalizeKey(d.disciplin_id) === normalizeKey(a.disciplin_id)
        );
        return { athlete: a, disciplin };
      })
      .sort(
        (x, y) =>
          (CHANCE_ORDER[y.athlete.chance as ChanceCategory] ?? 0) -
          (CHANCE_ORDER[x.athlete.chance as ChanceCategory] ?? 0)
      );
  }, [athletes, countryCode, disciplinIdsMedalEventDay, disciplins]);

  const meilleureChance = countryAthletesForDay[0] ?? null;
  const autresChances = countryAthletesForDay.slice(1);

  // Events this day where the country is involved (team match or discipline with country athletes)
  const aSuivreAujourdhui = useMemo(() => {
    const dayEvents = events.filter(
      (e) => normalizeKey(e.day) === normalizeKey(dayParam)
    );
    const codeNorm = countryCode ? normalizeKey(countryCode) : "";
    return dayEvents.filter((e) => {
      if (e.is_game === "1") {
        return (
          normalizeKey(e.team_1) === codeNorm || normalizeKey(e.team_2) === codeNorm
        );
      }
      const discId = normalizeKey(e.disciplin_id);
      return athletes.some(
        (a) =>
          normalizeKey(a.country) === codeNorm &&
          normalizeKey(a.disciplin_id) === discId
      );
    });
  }, [events, dayParam, countryCode, athletes]);

  // Global: must-not-miss medal events this day
  const aNePasRater = useMemo(() => {
    return events.filter(
      (e) =>
        normalizeKey(e.day) === normalizeKey(dayParam) && e.is_medal === "1"
    );
  }, [events, dayParam]);

  const days = useMemo(
    () => Array.from(new Set(events.map((e) => e.day).filter((d) => d))).sort(
      (a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0)
    ),
    [events]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014a5c] mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!countryCode || !countryName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pays non trouvé.</p>
          <Link href="/" className="text-[#014a5c] hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <CalendarHeader
        days={days}
        selectedDay={dayParam}
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

      <article className="max-w-4xl mx-auto px-6 py-8 font-serif">
        {/* Une de journal - masthead */}
        <header className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-black">
            Le Journal
          </h1>
          <p className="text-lg text-gray-700 mt-2">
            {formatDayAsDate(dayParam)} — {countryName}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Flag country={countryCode} className="w-8 h-8 object-cover rounded" />
            <span className="font-semibold text-gray-800">{countryName}</span>
          </div>
        </header>

        {/* Meilleure chance de médaille */}
        {meilleureChance && (
          <section className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b-2 border-black pb-1 mb-4">
              Meilleure chance de médaille
            </h2>
            <div className="bg-white border-2 border-gray-800 p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-[#014a5c] text-white flex items-center justify-center text-4xl font-bold rounded">
                {meilleureChance.athlete.firstname[0]}
                {meilleureChance.athlete.lastname[0]}
              </div>
              <div className="flex-1">
                <Link
                  href={`/athlete/${createAthleteSlug(meilleureChance.athlete.firstname, meilleureChance.athlete.lastname)}`}
                  className="text-2xl font-bold text-[#014a5c] hover:underline"
                >
                  {meilleureChance.athlete.firstname} {meilleureChance.athlete.lastname}
                </Link>
                <p className="text-gray-700 mt-1">
                  {meilleureChance.disciplin?.name ?? ""} — {meilleureChance.disciplin?.sport ?? ""}
                </p>
                <p className="text-lg mt-2">
                  {getStars(chanceToNumber(meilleureChance.athlete.chance as ChanceCategory))}{" "}
                  {meilleureChance.athlete.chance}
                </p>
                <p className="text-gray-600 mt-3 italic">
                  Grand favori pour ce jour. À suivre en direct.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Les autres chances de médaille */}
        {autresChances.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b-2 border-black pb-1 mb-4">
              Les autres chances de médaille
            </h2>
            <ul className="space-y-2 bg-white border border-gray-300 p-4">
              {autresChances.map(({ athlete, disciplin }, i) => (
                <li key={i} className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/athlete/${createAthleteSlug(athlete.firstname, athlete.lastname)}`}
                    className="font-semibold text-[#014a5c] hover:underline"
                  >
                    {athlete.firstname} {athlete.lastname}
                  </Link>
                  <span className="text-gray-600">
                    {disciplin?.name ?? ""} — {disciplin?.sport ?? ""}
                  </span>
                  <span className="text-sm font-medium">
                    {getStars(chanceToNumber(athlete.chance as ChanceCategory))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* À suivre aujourd'hui pour le pays */}
        {aSuivreAujourdhui.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b-2 border-black pb-1 mb-4">
              À suivre aujourd&apos;hui pour {countryName}
            </h2>
            <ul className="space-y-2 bg-white border border-gray-300 p-4">
              {aSuivreAujourdhui.map((event, i) => {
                const disciplin = disciplins.find(
                  (d) => normalizeKey(d.disciplin_id) === normalizeKey(event.disciplin_id)
                );
                return (
                  <li key={i} className="flex items-center gap-3 flex-wrap">
                    <CalendarIcon day={event.day ?? null} />
                    <span className="font-medium">{event.time_begin}</span>
                    {event.desc && <span className="text-gray-600">| {event.desc}</span>}
                    <Link
                      href={`/disciplin/${encodeURIComponent(event.disciplin_id)}`}
                      className="text-[#014a5c] hover:underline"
                    >
                      {disciplin?.name ?? event.disciplin_id}
                    </Link>
                    {event.is_medal === "1" && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Médaille
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* À ne pas rater (global) */}
        {aNePasRater.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b-2 border-black pb-1 mb-4">
              À ne pas rater
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              Épreuves médailles du jour (tous pays).
            </p>
            <ul className="space-y-2 bg-white border border-gray-300 p-4">
              {aNePasRater.map((event, i) => {
                const disciplin = disciplins.find(
                  (d) => normalizeKey(d.disciplin_id) === normalizeKey(event.disciplin_id)
                );
                return (
                  <li key={i} className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium">{event.time_begin}</span>
                    {event.desc && <span className="text-gray-600">| {event.desc}</span>}
                    <Link
                      href={`/disciplin/${encodeURIComponent(event.disciplin_id)}`}
                      className="text-[#014a5c] hover:underline font-medium"
                    >
                      {disciplin?.name ?? event.disciplin_id}
                    </Link>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Médaille
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!meilleureChance && autresChances.length === 0 && aSuivreAujourdhui.length === 0 && aNePasRater.length === 0 && (
          <p className="text-gray-600">
            Aucune donnée pour ce pays et ce jour. Essayez un autre jour ou un autre pays.
          </p>
        )}

        <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <Link href="/" className="text-[#014a5c] hover:underline">
            Retour à l&apos;accueil
          </Link>
          {" · "}
          <Link href="/calendar" className="text-[#014a5c] hover:underline">
            Calendrier
          </Link>
        </footer>
      </article>
    </div>
  );
}
