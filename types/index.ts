export type ChanceCategory = "Big Favourite" | "Favourite" | "Challenger" | "Outsider" | "Wildcard";

export interface Athlete {
  firstname: string;
  lastname: string;
  country: string;
  disciplin_id: string;
  chance: ChanceCategory;
}

export interface Disciplin {
  disciplin_id: string;
  name: string;
  sport: string;
  gender: string;
}

export interface CalendarDay {
  day: string;
  disciplin_id: string;
}

export interface Event {
  day: string;
  disciplin_id: string;
  time_begin: string;
  time_end: string;
  desc: string;
  is_medal: string;
  is_game: string;
  team_1: string;
  team_2: string;
}

export interface FilterState {
  selectedDay: string | null;
  selectedSports: string[];
  selectedCountries: string[];
}
