import type { Metadata } from "next";

const SITE_URL = "https://winter-olympics-2026.datasportsiq.com";

export const metadata: Metadata = {
  title: "Interactive Calendar | Winter Olympics 2026 Medal Chances",
  description: "Browse the complete schedule of Winter Olympics 2026 events in Milano Cortina. Filter by day, session (Morning, Afternoon, Evening), and country. See medal events, game schedules, and athlete medal chances.",
  keywords: [
    "Winter Olympics 2026",
    "Milano Cortina",
    "Olympics schedule",
    "Olympics calendar",
    "medal events",
    "Olympics timetable",
    "Winter Olympics schedule",
  ],
  alternates: {
    canonical: `${SITE_URL}/calendar`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/calendar`,
    title: "Interactive Calendar | Winter Olympics 2026 Medal Chances",
    description: "Browse the complete schedule of Winter Olympics 2026 events in Milano Cortina. Filter by day, session, and country.",
    siteName: "Winter Olympics Medal Chances",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Calendar | Winter Olympics 2026",
    description: "Browse the complete schedule of Winter Olympics 2026 events in Milano Cortina.",
  },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
