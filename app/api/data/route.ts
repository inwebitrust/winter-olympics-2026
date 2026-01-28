import { NextResponse } from "next/server";
import { getAthletes, getDisciplins, getCalendar, getEvents } from "@/lib/sheets";

export async function GET() {
  try {
    const [athletes, disciplins, calendar, events] = await Promise.all([
      getAthletes(),
      getDisciplins(),
      getCalendar(),
      getEvents(),
    ]);

    return NextResponse.json({
      athletes,
      disciplins,
      calendar,
      events,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
