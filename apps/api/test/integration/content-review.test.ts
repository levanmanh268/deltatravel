import 'reflect-metadata';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../src/database/prisma.service';
import { AdminService } from '../../src/admin/admin.service';
import { BookingsService } from '../../src/bookings/bookings.service';
import { ReviewsService } from '../../src/tours/reviews.service';
import type { CacheService } from '../../src/cache/cache.module';

const db = new PrismaService();
const admin = new AdminService(db, {
  read: async () => null,
  write: async () => {},
} as unknown as CacheService);
const bookings = new BookingsService(db);
const reviews = new ReviewsService(db);

let userId = '';
let tourId = '';
let scheduleId = '';

beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('tour_booking_test')) {
    throw new Error('Integration tests require a dedicated tour_booking_test database');
  }
  await db.$connect();
  const nonce = randomUUID();
  userId = (
    await db.user.create({
      data: {
        name: 'Content Review Test',
        email: `${nonce}@test.invalid`,
        passwordHash: 'not-a-login-hash',
      },
    })
  ).id;
  tourId = (
    await db.tour.create({
      data: {
        title: 'Tour content test',
        slug: `content-${nonce}`,
        description: 'Tour used to verify persisted content and verified reviews.',
        destination: 'Hà Nội',
        durationDays: 2,
        status: 'ACTIVE',
      },
    })
  ).id;
});

afterAll(async () => {
  if (tourId) {
    const bookingRows = await db.booking.findMany({
      where: { schedule: { tourId } },
      select: { id: true },
    });
    const bookingIds = bookingRows.map((row) => row.id);
    await db.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await db.bookingDetail.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await db.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await db.tourReview.deleteMany({ where: { tourId } });
    await db.schedule.deleteMany({ where: { tourId } });
    await db.tour.deleteMany({ where: { id: tourId } });
  }
  if (userId) {
    await db.refreshSession.deleteMany({ where: { userId } });
    await db.passwordResetChallenge.deleteMany({ where: { userId } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.auditLog.deleteMany({ where: { actorId: userId } });
  }
  await db.$disconnect();
});

describe('content and review persistence', () => {
  it('persists rich tour content and schedule duration through admin services', async () => {
    const updated = await admin.updateTour(
      tourId,
      {
        imageUrl: 'https://example.com/cover.webp',
        galleryImages: ['https://example.com/gallery.webp'],
        itinerary: [
          {
            day: 1,
            title: 'Ngày khám phá',
            activities: ['Tham quan điểm đến'],
            meals: 'Trưa',
            stay: null,
            imageUrl: null,
          },
          {
            day: 2,
            title: 'Ngày trải nghiệm',
            activities: ['Trải nghiệm địa phương'],
            meals: null,
            stay: 'Khách sạn',
            imageUrl: null,
          },
        ],
        commercial: {
          departureBasis: 'Điểm hẹn trung tâm',
          transport: ['Xe du lịch'],
          included: ['Vé tham quan'],
          notIncluded: ['Chi phí cá nhân'],
          optionalCosts: [],
          cancellationPolicy: 'Áp dụng theo điều kiện tour đã công bố.',
          dateChangePolicy: 'Đổi ngày theo tình trạng chỗ còn trống.',
          refundPolicy: 'Hoàn tiền theo chính sách hủy đã công bố.',
          singleRoomPolicy: 'Phụ thu phòng đơn được báo trước khi đặt.',
          childPolicy: 'Giá trẻ em áp dụng theo lịch khởi hành.',
          weatherPolicy: 'Điều chỉnh lịch trình khi thời tiết không bảo đảm an toàn.',
          incidentalCostPolicy: 'Chi phí phát sinh phải được công bố và xác nhận.',
        },
      },
      userId,
    );
    expect(updated.galleryImages).toEqual(['https://example.com/gallery.webp']);
    expect(updated.itinerary).toHaveLength(2);

    const created = await admin.createSchedule(
      {
        tourId,
        departureAt: new Date(Date.now() + 20 * 86400000).toISOString(),
        durationDays: 3,
        totalSeats: 20,
        adultPrice: 120000,
        childPrice: 60000,
        status: 'OPEN',
      },
      userId,
    );
    scheduleId = created.id;
    expect(created.durationDays).toBe(3);
  });

  it('returns tourId in booking DTO and enforces completed-booking reviews', async () => {
    const booking = await bookings.create(
      userId,
      {
        scheduleId,
        adults: 1,
        children: 0,
        contactName: 'Content Review Test',
        contactEmail: 'review@example.com',
        contactPhone: '0901234567',
      },
      randomUUID(),
    );
    expect(booking.tourId).toBe(tourId);

    await expect(
      reviews.upsert(tourId, userId, { rating: 5, comment: 'Chưa hoàn thành tour' }),
    ).rejects.toThrow();

    await db.booking.update({ where: { id: booking.id }, data: { status: 'COMPLETED' } });
    const saved = await reviews.upsert(tourId, userId, {
      rating: 5,
      comment: 'Trải nghiệm tốt và đúng mô tả',
    });
    expect(saved.verifiedPurchase).toBe(true);
    const page = await reviews.list(tourId);
    expect(page.summary.count).toBe(1);
    expect(page.summary.average).toBe(5);
  });
});
