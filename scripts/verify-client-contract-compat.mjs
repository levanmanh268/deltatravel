#!/usr/bin/env node

import { PageSchema, TourSchema } from '../packages/shared/dist/index.js';

const tour = {
  id: '10000000-0000-4000-8000-000000000001',
  title: 'Compatibility Tour',
  slug: 'compatibility-tour',
  description:\n    'Regression fixture used to protect the production catalog from API/client version skew.',
  destination: 'Hà Nội',
  countryCode: 'VN',
  durationDays: 2,
  imageUrl: null,
  galleryImages: [],
  itinerary: [],
  commercial: null,
  status: 'ACTIVE',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  fromPrice: 2450000,
  ratingAverage: 4.8,
  ratingCount: 12,
  futureServerField: { safe: true },
};

const page = {
  items: [tour],
  page: 1,
  pageSize: 20,
  total: 1,
};

const parsed = PageSchema(TourSchema).parse(page);
if (parsed.items[0].futureServerField?.safe !== true) {
  throw new Error('TourSchema no longer tolerates forward-compatible response fields');
}

console.log('CLIENT_CONTRACT_COMPAT_PASS');
