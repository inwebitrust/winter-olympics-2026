import { NextResponse } from "next/server";
import { getAthletes, getDisciplins, getCalendar } from "@/lib/sheets";

export async function GET() {
  try {
    const [athletes, disciplins, calendar] = await Promise.all([
      getAthletes(),
      getDisciplins(),
      getCalendar(),
    ]);

    return NextResponse.json({
      athletes,
      disciplins,
      calendar,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
