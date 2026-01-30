import type { Metadata } from "next";
import { Bebas_Neue, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "./responsive.scss";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const SITE_URL = "https://winter-olympics-2026.datasportiq.com";

export const metadata: Metadata = {
  title: "Winter Olympics 2026 Medal Chances | Milano Cortina",
  description: "Track medal chances for Winter Olympics 2026 athletes in Milano Cortina. Discover favorites, challengers, and outsiders for alpine skiing, biathlon, figure skating, and more winter sports.",
  keywords: ["Winter Olympics 2026", "Milano Cortina", "medal chances", "Olympics predictions", "alpine skiing", "biathlon", "figure skating", "ice hockey", "snowboarding", "cross-country skiing", "Olympic athletes"],
  authors: [{ name: "Anthony Veyssiere", url: "https://github.com/inwebitrust" }],
  creator: "Anthony Veyssiere",
  publisher: "Anthony Veyssiere",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Winter Olympics 2026 Medal Chances | Milano Cortina",
    description: "Track medal chances for Winter Olympics 2026 athletes. Discover favorites, challengers, and outsiders across all winter sports.",
    siteName: "Winter Olympics Medal Chances",
  },
  twitter: {
    card: "summary_large_image",
    title: "Winter Olympics 2026 Medal Chances",
    description: "Track medal chances for Winter Olympics 2026 athletes in Milano Cortina.",
    creator: "@inwebitrust",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${openSans.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
