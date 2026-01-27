# Winter Olympics Medal Chances

A Next.js application to track and display medal chances for Winter Olympics athletes, with filtering by day, sport, and country.

## Features

- **Calendar Header**: Filter athletes by competition day (default: all days)
- **Filter Sidebar**: Filter by sports and countries
- **Athlete List**: Ranked athletes displayed in 5 categories:
  - Big Favourite
  - Favourite
  - Challenger
  - Outsider
  - Wildcard

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Source

Data is fetched from a Google Spreadsheet using the Google Sheets API v4. The spreadsheet contains three sheets:
- `athletes`: Athlete information (firstname, lastname, country, disciplin_id, chance)
- `disciplins`: Discipline information (disciplin_id, name, sport, gender)
- `calendar`: Calendar mapping (day, disciplin_id)

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: React components (CalendarHeader, FilterSidebar, AthleteList)
- `lib/`: Utility functions for fetching Google Sheets data
- `types/`: TypeScript type definitions
