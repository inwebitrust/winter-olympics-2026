import type { Metadata } from "next";

const SITE_URL = "https://winter-olympics-2026.datasportiq.com";

export const metadata: Metadata = {
  title: "Athlete Ranking | Winter Olympics 2026 Medal Chances",
  description:
    "Ranking of Winter Olympics 2026 athletes by total medal chances. See who has the most medal opportunities across disciplines in Milano Cortina.",
  alternates: {
    canonical: `${SITE_URL}/athlete-ranking`,
  },
};

export default function AthleteRankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
