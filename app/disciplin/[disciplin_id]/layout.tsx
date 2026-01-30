import type { Metadata } from "next";
import { getCalendar, getDisciplins } from "@/lib/sheets";

const SITE_URL = "https://winter-olympics-2026.datasportiq.com";

function normalizeKey(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function disciplinToSlug(disciplinId: string): string {
  return String(disciplinId || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function formatDayAsDate(dayNumber: string | null): string | null {
  if (!dayNumber) return null;

  const day = parseInt(dayNumber, 10);
  if (Number.isNaN(day)) return null;

  const date = new Date(2026, 1, day); // February 2026
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${weekday}, ${month} ${getOrdinal(day)}`;
}

export async function generateMetadata({
  params,
}: {
  params: { disciplin_id: string };
}): Promise<Metadata> {
  const disciplinId = params?.disciplin_id || "";

  const [disciplins, calendar] = await Promise.all([getDisciplins(), getCalendar()]);

  const disciplin = disciplins.find(
    (d: any) => normalizeKey(d?.disciplin_id) === normalizeKey(disciplinId)
  );

  const calendarEntry = calendar.find(
    (c: any) => normalizeKey(c?.disciplin_id) === normalizeKey(disciplinId)
  );

  const disciplinName = disciplin?.name ? String(disciplin.name) : "Discipline";
  const sportName = disciplin?.sport ? String(disciplin.sport) : "Winter Olympics";

  const dayNumber = calendarEntry?.day ? String(calendarEntry.day) : null;
  const fullDate = formatDayAsDate(dayNumber);

  const title = `${disciplinName} (${sportName}) – Medal Chances | Winter Olympics 2026`;
  const descriptionParts = [
    `Medal chances and favorites for ${disciplinName} at Winter Olympics 2026 (Milano Cortina).`,
    fullDate ? `Schedule: ${fullDate}.` : null,
  ].filter(Boolean);
  const description = descriptionParts.join(" ");

  const canonical = `${SITE_URL}/disciplin/${encodeURIComponent(disciplinId)}`;
  const ogImage = `${SITE_URL}/disciplins/${disciplinToSlug(disciplinId)}.png`;

  return {
    title,
    description,
    keywords: [
      "Winter Olympics 2026",
      "Milano Cortina",
      "medal chances",
      "Olympics predictions",
      sportName,
      disciplinName,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description,
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

