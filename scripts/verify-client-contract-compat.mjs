#!/usr/bin/env node

import { PageSchema, ScheduleSchema, TourSchema } from '../packages/shared/dist/index.js';

const tour = {
  id: '10000000-0000-4000-8000-000000000001',
  title: 'Compatibility Tour',
  slug: 'compatibility-tour',
  description:
    'Regression fixture used to protect the production catalog from API/client version skew.',
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

const TourResponseSchema = TourSchema.passthrough();
const parsed = PageSchema(TourResponseSchema).parse(page);
if (parsed.items[0].futureServerField?.safe !== true) {
  throw new Error('TourSchema no longer tolerates forward-compatible response fields');
}

const schedule = {
  id: '20000000-0000-4000-8000-000000000001',
  tourId: tour.id,
  departureAt: '2026-12-01T01:00:00.000Z',
  durationDays: 2,
  totalSeats: 30,
  reservedSeats: 5,
  availableSeats: 25,
  adultPrice: 2450000,
  childPrice: 1800000,
  status: 'OPEN',
  serverTime: '2026-10-01T00:00:00.000Z',
  futureServerField: { safe: true },
};

// Reproduce the production failure mode: a stale client does not know durationDays yet.
// Its response boundary must still accept additive server fields during a rolling deploy.
const LegacyScheduleSchema = ScheduleSchema.omit({ durationDays: true }).strict();
const ScheduleResponseSchema = LegacyScheduleSchema.passthrough();
const schedulePage = PageSchema(ScheduleResponseSchema).parse({
  items: [schedule],
  page: 1,
  pageSize: 20,
  total: 1,
});
if (
  schedulePage.items[0].durationDays !== 2 ||
  schedulePage.items[0].futureServerField?.safe !== true
) {
  throw new Error('Schedule response boundary no longer tolerates additive server fields');
}

console.log('CLIENT_CONTRACT_COMPAT_PASS');
