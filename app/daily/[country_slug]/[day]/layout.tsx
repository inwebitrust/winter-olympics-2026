import type { Metadata } from "next";
import { getCountryName, getCountryCodeFromSlug } from "@/lib/countries";

const SITE_URL = "https://winter-olympics-2026.datasportiq.com";

function formatDayAsDate(dayNumber: string | null): string {
  if (!dayNumber) return "";
  const day = parseInt(dayNumber, 10);
  if (isNaN(day)) return `Jour ${dayNumber}`;
  const date = new Date(2026, 1, day);
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  if (day === 1) return `${weekday} 1er ${month}`;
  return `${weekday} ${day} ${month}`;
}

export async function generateMetadata({
  params,
}: {
  params: { country_slug: string; day: string };
}): Promise<Metadata> {
  const countryCode = getCountryCodeFromSlug(params?.country_slug ?? "");
  const countryName = countryCode ? getCountryName(countryCode) : "Pays";
  const day = params?.day ?? "";
  const dateStr = formatDayAsDate(day);

  const title = `Le Journal — ${countryName} — ${dateStr} | JO 2026`;
  const description = `Meilleures chances de médaille et à suivre pour ${countryName} le ${dateStr}. JO d'hiver Milano Cortina 2026.`;
  const canonical = `${SITE_URL}/daily/${encodeURIComponent(params?.country_slug ?? "")}/${encodeURIComponent(day)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
