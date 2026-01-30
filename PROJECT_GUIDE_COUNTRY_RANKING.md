# Country Sports Ranking Project - Development Guide

## Project Overview

A website that ranks countries across all sports and disciplines worldwide. The platform will display country rankings, sport-specific rankings, and detailed statistics for each country's performance across different sports.

**Domain**: `country-ranking.datasportiq.com` (or similar subdomain)

## Tech Stack

Use the **exact same tech stack** as the Winter Olympics project:

### Core Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Node.js 20+** (specify in `.nvmrc` and `package.json`)

### Styling
- **Tailwind CSS** (utility-first CSS)
- **SCSS/Sass** (for custom responsive styles)
- **Google Fonts**: Bebas Neue (headings) + Open Sans (body)

### Data Management
- **CSV files** stored in `public/data/` directory
- **papaparse** for CSV parsing
- Server-side data loading using Node.js `fs` module

### Deployment & Analytics
- **Vercel** (hosting)
- **Vercel Analytics** (`@vercel/analytics`)
- Custom domain with subdomain setup

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "^14.2.5",
    "papaparse": "^5.4.1",
    "@vercel/analytics": "^1.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/papaparse": "^5.3.14",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "sass": "^1.77.6"
  }
}
```

## Project Structure

```
country-ranking/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata, analytics
│   ├── page.tsx                 # Homepage with country rankings
│   ├── globals.css              # Global styles + Tailwind imports
│   ├── responsive.scss          # Mobile responsive styles
│   ├── sitemap.ts               # Dynamic sitemap generation
│   ├── country/
│   │   └── [countryCode]/
│   │       ├── layout.tsx       # Country-specific metadata
│   │       └── page.tsx         # Country detail page
│   ├── sport/
│   │   └── [sportSlug]/
│   │       ├── layout.tsx       # Sport-specific metadata
│   │       └── page.tsx         # Sport ranking page
│   └── api/
│       └── data/
│           └── route.ts         # API endpoint for data fetching
├── components/
│   ├── CountryCard.tsx          # Country ranking card component
│   ├── SportFilter.tsx          # Sport filter sidebar/header
│   ├── RankingTable.tsx         # Ranking table component
│   └── Flag.tsx                 # Country flag component (SVG icons)
├── lib/
│   ├── sheets.ts                # Data fetching functions (CSV)
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript interfaces
├── public/
│   ├── data/
│   │   ├── countries.csv        # Country data
│   │   ├── sports.csv           # Sports/disciplines data
│   │   ├── rankings.csv          # Country rankings per sport
│   │   └── statistics.csv        # Additional country statistics
│   └── flags/                   # Country flag SVGs (16x16px, 32x32px)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .nvmrc                       # Node.js version (20)
```

## Data Structure

### CSV Files

#### `countries.csv`
```csv
country_code,name,continent,population,gdp_per_capita
USA,United States,North America,331000000,69287
CHN,China,Asia,1400000000,12556
...
```

#### `sports.csv`
```csv
sport_id,name,category,discipline_count
football,Football,Team Sports,1
basketball,Basketball,Team Sports,1
tennis,Tennis,Individual Sports,5
swimming,Swimming,Aquatic Sports,16
...
```

#### `rankings.csv`
```csv
country_code,sport_id,rank,points,athletes_count,medals_gold,medals_silver,medals_bronze
USA,football,1,9500,25,5,3,2
CHN,swimming,1,9200,30,8,5,4
USA,basketball,1,9800,15,6,2,1
...
```

#### `statistics.csv` (optional)
```csv
country_code,sport_id,total_athletes,world_championships,olympic_medals,recent_performance
USA,football,250,12,45,excellent
CHN,swimming,180,8,32,good
...
```

## TypeScript Interfaces

```typescript
export interface Country {
  country_code: string;
  name: string;
  continent: string;
  population?: number;
  gdp_per_capita?: number;
}

export interface Sport {
  sport_id: string;
  name: string;
  category: string;
  discipline_count: number;
}

export interface Ranking {
  country_code: string;
  sport_id: string;
  rank: number;
  points: number;
  athletes_count: number;
  medals_gold?: number;
  medals_silver?: number;
  medals_bronze?: number;
}

export interface CountryRanking {
  country: Country;
  overall_rank: number;
  overall_points: number;
  sport_count: number;
  top_sports: Array<{
    sport: Sport;
    rank: number;
    points: number;
  }>;
}
```

## Features & Pages

### 1. Homepage (`/`)
- **Global country ranking table**
  - Sortable columns: Rank, Country, Overall Points, Sports Count, Top Sport
  - Filter by continent
  - Search by country name
- **Summary statistics**
  - Total countries tracked
  - Total sports/disciplines
  - Top performing countries by continent
- **Visual elements**
  - Country flags (16x16px SVGs)
  - Color-coded ranking badges
  - Responsive table design

### 2. Country Detail Page (`/country/[countryCode]`)
- **Country overview**
  - Full country name, flag (32x32px), continent
  - Overall ranking position
  - Total points across all sports
- **Sport rankings breakdown**
  - Table showing rank per sport
  - Points per sport
  - Medal counts (if available)
  - Link to sport detail page
- **Statistics**
  - Total athletes
  - Best performing sports
  - Recent performance trends (if data available)
- **SEO**: Dynamic metadata with country name, rankings

### 3. Sport Ranking Page (`/sport/[sportSlug]`)
- **Sport-specific country rankings**
  - Top countries for this sport
  - Points, ranks, medal counts
  - Country flags
- **Sport information**
  - Sport name, category
  - Number of disciplines
  - Related sports
- **SEO**: Dynamic metadata with sport name, top countries

### 4. Filtering & Navigation
- **Header navigation**
  - Home
  - Sports (dropdown with all sports)
  - Countries (dropdown with continents)
- **Filter sidebar** (desktop)
  - Filter by continent
  - Filter by sport category
  - Search countries
- **Mobile responsive**
  - Collapsible sidebar (burger menu)
  - Touch-friendly filters

## Design Guidelines

### Color Scheme
- Primary: `#014a5c` (dark teal/blue)
- Secondary: `#1b6e85` (medium teal)
- Background: `#f9fafb` (light gray)
- Text: `#1f2937` (dark gray)
- Borders: `#e5e7eb` (light gray)

### Typography
- **Headings**: Bebas Neue (bold, uppercase for titles)
- **Body**: Open Sans (clean, readable)
- Font sizes: Responsive (smaller on mobile)

### Components Style
- **Cards**: White background, subtle border, rounded corners
- **Tables**: Clean, sortable, hover effects
- **Buttons**: Rounded, primary color on hover/active
- **Flags**: SVG icons, consistent sizing

### Responsive Breakpoints
- Mobile: `< 600px` (single column, collapsible sidebar)
- Tablet: `600px - 1280px` (adjusted layout)
- Desktop: `> 1280px` (full layout with sidebar)

## SEO Requirements

### Metadata
- **Homepage**: "Global Country Sports Rankings | World's Best Sporting Nations"
- **Country pages**: Dynamic titles like "United States Sports Rankings | Country Profile"
- **Sport pages**: Dynamic titles like "Football Country Rankings | Top Nations"

### Sitemap
- Generate dynamic sitemap including:
  - All country pages
  - All sport pages
  - Static pages
- Update automatically when CSV data changes

### Canonical URLs
- Use full domain URLs: `https://country-ranking.datasportiq.com/...`
- Set canonical in all metadata

### Open Graph & Twitter Cards
- Dynamic images per country/sport
- Descriptive titles and descriptions
- Proper URL structure

## Data Loading Strategy

### Server-Side Data Fetching
- Use `lib/sheets.ts` pattern (but for CSV files)
- Functions: `getCountries()`, `getSports()`, `getRankings()`, `getStatistics()`
- No caching during development (`cache: 'no-store'` if using API routes)
- CSV files read from `public/data/` using `fs.readFileSync`

### API Route
- `/api/data` endpoint returns all data
- Used by client components for initial load
- Can be cached in production if needed

### Client-Side State
- Use `useState` for filters, search, sorting
- Use `useMemo` for computed rankings, filtered data
- Use `useEffect` for initial data fetch

## Development Workflow

### Initial Setup
1. Create Next.js project: `npx create-next-app@latest --typescript --tailwind --app`
2. Install dependencies: `npm install papaparse @vercel/analytics sass`
3. Install dev dependencies: `npm install -D @types/papaparse @types/node`
4. Set Node.js version: Create `.nvmrc` with `20`
5. Configure Tailwind, PostCSS, TypeScript
6. Set up folder structure

### Data Preparation
1. Prepare CSV files in `public/data/`
2. Create TypeScript interfaces in `types/index.ts`
3. Implement data loading functions in `lib/sheets.ts`
4. Test data parsing

### Component Development
1. Build reusable components (CountryCard, RankingTable, etc.)
2. Create page components
3. Add responsive styles in `responsive.scss`
4. Test on mobile/tablet/desktop

### SEO & Deployment
1. Add metadata to all pages
2. Generate sitemap
3. Set up custom domain on Vercel
4. Configure Google Search Console
5. Submit sitemap

## Key Features to Implement

### Ranking Calculations
- **Overall ranking**: Sum of points across all sports (weighted or unweighted)
- **Sport-specific ranking**: Points/rank per sport
- **Weighted rankings**: Option to weight sports by popularity/importance

### Filtering & Sorting
- Filter by continent
- Filter by sport category
- Search countries by name
- Sort by rank, points, country name
- Multi-select filters

### Visualizations (Optional)
- Bar charts for top countries
- Pie charts for continent distribution
- Line charts for ranking trends over time (if historical data)

### Performance Optimizations
- Lazy load country flags
- Virtualize long lists (if many countries)
- Memoize computed rankings
- Optimize CSV parsing

## Testing Checklist

- [ ] All CSV files load correctly
- [ ] Rankings calculate accurately
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Country detail pages load with correct data
- [ ] Sport pages show correct rankings
- [ ] SEO metadata is correct
- [ ] Sitemap generates correctly
- [ ] All links work
- [ ] Performance is acceptable (< 3s load time)

## Notes for AI/LLM Assistant

When implementing this project:
1. **Follow the exact same patterns** from the Winter Olympics project
2. **Reuse components** where possible (Flag, CalendarHeader structure, etc.)
3. **Maintain consistent code style** and naming conventions
4. **Prioritize mobile responsiveness** - test on small screens
5. **Ensure TypeScript types** are properly defined
6. **Add error handling** for missing data
7. **Implement loading states** for data fetching
8. **Use semantic HTML** for accessibility
9. **Optimize images** (SVG flags, compressed if needed)
10. **Document complex logic** with comments

## Future Enhancements (Optional)

- Historical rankings (track changes over time)
- Comparison tool (compare 2-3 countries side-by-side)
- Athlete search and profiles
- Sport-specific statistics
- Export rankings to CSV/PDF
- Dark mode toggle
- Multi-language support
- Social sharing buttons

---

**Project Owner**: Anthony Veyssiere  
**Domain**: datasportiq.com  
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Vercel
