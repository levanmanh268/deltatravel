import { Injectable } from '@nestjs/common';
import { Prisma, type Tour } from '@prisma/client';
import { z } from 'zod';
import { TourQuerySchema } from '@tour/shared';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ToursService {
  constructor(private readonly db: PrismaService) {}

  private legacy(row: Tour) {
    const { deletedAt, imageUrl, galleryImages, itinerary, commercial, ...legacy } = row;
    return legacy;
  }

  private visible(row: Tour) {
    const { deletedAt, ...visible } = row;
    return visible;
  }

  private async enriched(rows: Tour[]) {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const now = new Date();
    const [prices, reviews] = await Promise.all([
      this.db.schedule.groupBy({
        by: ['tourId'],
        where: { tourId: { in: ids }, status: 'OPEN', departureAt: { gt: now } },
        _min: { adultPrice: true },
      }),
      this.db.tourReview.groupBy({
        by: ['tourId'],
        where: { tourId: { in: ids } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);
    const priceByTour = new Map(
      prices.map((item) => [
        item.tourId,
        item._min.adultPrice === null ? null : Number(item._min.adultPrice),
      ]),
    );
    const reviewByTour = new Map(
      reviews.map((item) => [
        item.tourId,
        { average: item._avg.rating ?? null, count: item._count._all },
      ]),
    );
    return rows.map((row) => {
      const review = reviewByTour.get(row.id);
      return {
        ...this.visible(row),
        fromPrice: priceByTour.get(row.id) ?? null,
        ratingAverage: review?.average ?? null,
        ratingCount: review?.count ?? 0,
      };
    });
  }

  async list(q: z.infer<typeof TourQuerySchema>, admin = false, includeEnriched = false) {
    const where: Prisma.TourWhereInput = {
      deletedAt: null,
      ...(!admin ? { status: 'ACTIVE', countryCode: 'VN' } : {}),
      ...(q.q
        ? {
            OR: [
              { title: { contains: q.q, mode: 'insensitive' } },
              { destination: { contains: q.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(q.destination ? { destination: { contains: q.destination, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.db.$transaction([
      this.db.tour.findMany({
        where,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.tour.count({ where }),
    ]);
    const items = includeEnriched ? await this.enriched(rows) : rows.map((row) => this.legacy(row));
    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async get(id: string, includeEnriched = false) {
    const tour = await this.db.tour.findFirstOrThrow({
      where: { id, status: 'ACTIVE', countryCode: 'VN', deletedAt: null },
    });
    if (!includeEnriched) return this.legacy(tour);
    return (await this.enriched([tour]))[0];
  }
}
