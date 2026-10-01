import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CreateTourReviewSchema } from '@tour/shared';
import { PrismaService } from '../database/prisma.service';
import { fail } from '../common/errors';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: PrismaService) {}

  private dto(row: {
    id: string;
    tourId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    user: { name: string; avatarUrl: string | null };
  }) {
    return {
      id: row.id,
      tourId: row.tourId,
      rating: row.rating,
      comment: row.comment,
      authorName: row.user.name,
      authorAvatarUrl: row.user.avatarUrl,
      verifiedPurchase: true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async requireActiveTour(tourId: string) {
    await this.db.tour.findFirstOrThrow({
      where: { id: tourId, deletedAt: null, status: 'ACTIVE', countryCode: 'VN' },
      select: { id: true },
    });
  }

  async list(tourId: string) {
    await this.requireActiveTour(tourId);
    const [rows, aggregate, grouped] = await Promise.all([
      this.db.tourReview.findMany({
        where: { tourId },
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: 100,
      }),
      this.db.tourReview.aggregate({
        where: { tourId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.db.tourReview.groupBy({
        by: ['rating'],
        where: { tourId },
        _count: { _all: true },
      }),
    ]);
    const byRating = new Map(grouped.map((item) => [item.rating, item._count._all]));
    return {
      summary: {
        average: aggregate._avg.rating ?? 0,
        count: aggregate._count._all,
        breakdown: [5, 4, 3, 2, 1].map((rating) => ({
          rating,
          count: byRating.get(rating) ?? 0,
        })),
      },
      items: rows.map((row) => this.dto(row)),
    };
  }

  async upsert(tourId: string, userId: string, input: z.infer<typeof CreateTourReviewSchema>) {
    await this.requireActiveTour(tourId);
    const completed = await this.db.booking.findFirst({
      where: { userId, status: 'COMPLETED', schedule: { tourId } },
      select: { id: true },
    });
    if (!completed) {
      fail(
        403,
        'REVIEW_REQUIRES_COMPLETED_BOOKING',
        'Chỉ khách đã hoàn thành tour mới được đăng đánh giá xác thực',
      );
    }
    const row = await this.db.tourReview.upsert({
      where: { tourId_userId: { tourId, userId } },
      create: { tourId, userId, rating: input.rating, comment: input.comment },
      update: { rating: input.rating, comment: input.comment },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
    return this.dto(row);
  }

  async removeMine(tourId: string, userId: string) {
    await this.db.tourReview.deleteMany({ where: { tourId, userId } });
    return { ok: true as const };
  }
}
