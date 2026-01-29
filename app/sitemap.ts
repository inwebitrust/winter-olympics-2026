import { MetadataRoute } from 'next'
import { getDisciplins, getAthletes } from '@/lib/sheets'
import { createAthleteSlug } from '@/lib/slug'

const SITE_URL = 'https://winter-olympics-2026.datasportsiq.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/data-checking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ]

  // Dynamic discipline routes
  const disciplins = await getDisciplins()
  const disciplineRoutes: MetadataRoute.Sitemap = disciplins.map((disciplin: any) => ({
    url: `${SITE_URL}/disciplin/${encodeURIComponent(disciplin.disciplin_id || '')}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Dynamic athlete routes
  const athletes = await getAthletes()
  const uniqueAthletes = new Map<string, { firstname: string; lastname: string }>()
  
  athletes.forEach((athlete: any) => {
    const key = `${athlete.firstname?.toLowerCase()}-${athlete.lastname?.toLowerCase()}`
    if (!uniqueAthletes.has(key) && athlete.firstname && athlete.lastname) {
      uniqueAthletes.set(key, {
        firstname: athlete.firstname,
        lastname: athlete.lastname,
      })
    }
  })

  const athleteRoutes: MetadataRoute.Sitemap = Array.from(uniqueAthletes.values()).map((athlete) => ({
    url: `${SITE_URL}/athlete/${createAthleteSlug(athlete.firstname, athlete.lastname)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticRoutes, ...disciplineRoutes, ...athleteRoutes]
}
