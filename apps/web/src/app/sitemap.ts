import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://delta-travel-web.onrender.com';
const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || 'https://delta-travel-api.onrender.com/api/v1'
).replace(/\/$/, '');

type TourItem = { id: string; updatedAt?: string };

async function fetchTourItems(): Promise<TourItem[]> {
  try {
    const response = await fetch(`${apiUrl}/tours?page=1&pageSize=100&contract=v2`, {
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { data?: { items?: TourItem[] } };
    return body.data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const tours = await fetchTourItems();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/tours`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/assistant`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/payment-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${siteUrl}/tours/${tour.id}`,
    lastModified: tour.updatedAt ? new Date(tour.updatedAt) : now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...tourRoutes];
}
