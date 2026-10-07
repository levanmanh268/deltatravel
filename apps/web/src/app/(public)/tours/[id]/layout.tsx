import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://delta-travel-web.onrender.com';
const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || 'https://delta-travel-api.onrender.com/api/v1'
).replace(/\/$/, '');

type PublicTour = {
  id: string;
  title: string;
  description: string;
  destination: string;
  durationDays: number;
  imageUrl?: string | null;
  fromPrice?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number;
};

async function getTour(id: string): Promise<PublicTour | null> {
  try {
    const response = await fetch(`${apiUrl}/tours/${encodeURIComponent(id)}?contract=v2`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: PublicTour };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tour = await getTour(id);
  if (!tour) {
    return {
      title: 'Tour du lịch',
      alternates: { canonical: `/tours/${id}` },
    };
  }

  const description = tour.description.slice(0, 155);
  return {
    title: tour.title,
    description,
    alternates: { canonical: `/tours/${tour.id}` },
    openGraph: {
      type: 'website',
      url: `/tours/${tour.id}`,
      title: tour.title,
      description,
      images: tour.imageUrl ? [{ url: tour.imageUrl, alt: tour.title }] : undefined,
    },
    twitter: {
      card: tour.imageUrl ? 'summary_large_image' : 'summary',
      title: tour.title,
      description,
      images: tour.imageUrl ? [tour.imageUrl] : undefined,
    },
  };
}

export default async function TourDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTour(id);
  const structuredData = tour
    ? {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: tour.title,
        description: tour.description,
        touristType: 'Domestic traveler',
        itinerary: tour.destination,
        url: `${siteUrl}/tours/${tour.id}`,
        image: tour.imageUrl || undefined,
        offers:
          typeof tour.fromPrice === 'number'
            ? {
                '@type': 'Offer',
                priceCurrency: 'VND',
                price: tour.fromPrice,
                url: `${siteUrl}/tours/${tour.id}`,
              }
            : undefined,
        aggregateRating:
          tour.ratingCount && typeof tour.ratingAverage === 'number'
            ? {
                '@type': 'AggregateRating',
                ratingValue: tour.ratingAverage,
                ratingCount: tour.ratingCount,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      }
    : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
