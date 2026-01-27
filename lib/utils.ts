import { ChanceCategory } from "@/types";

// Convert chance category to numeric value (5,4,3,2,1)
export function chanceToNumber(chance: ChanceCategory): number {
  const chanceMap: Record<ChanceCategory, number> = {
    "Big Favourite": 5,
    "Favourite": 4,
    "Challenger": 3,
    "Outsider": 2,
    "Wildcard": 1,
  };
  return chanceMap[chance] || 0;
}

// Generate star emoji string
export function getStars(count: number): string {
  return "⭐".repeat(count);
}
