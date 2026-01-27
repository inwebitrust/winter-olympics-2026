/**
 * Convert athlete name to URL slug
 * Format: firstname-lastname (lowercase, spaces replaced with hyphens)
 */
export function createAthleteSlug(firstname: string, lastname: string): string {
  const slug = `${firstname}-${lastname}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return slug;
}

/**
 * Parse athlete slug back to firstname and lastname
 */
export function parseAthleteSlug(slug: string): { firstname: string; lastname: string } | null {
  const parts = slug.split("-");
  if (parts.length < 2) return null;
  
  // Last part is lastname, everything else is firstname
  const lastname = parts[parts.length - 1];
  const firstname = parts.slice(0, -1).join(" ");
  
  return {
    firstname: firstname.charAt(0).toUpperCase() + firstname.slice(1),
    lastname: lastname.charAt(0).toUpperCase() + lastname.slice(1),
  };
}
