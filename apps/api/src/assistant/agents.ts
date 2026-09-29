import { Injectable } from '@nestjs/common';
import type { AssistantResult } from '@tour/shared';
import { BOOKING_LABELS } from '@tour/shared';
import { ToursService } from '../tours/tours.service';
import { SchedulesService } from '../schedules/schedules.service';
import { BookingsService } from '../bookings/bookings.service';
import { AdminService } from '../admin/admin.service';
import { fail } from '../common/errors';
import type { AppRequest } from '../common/http';
import type { AgentIntent } from './ai-provider.service';

export type AgentPayload = Pick<AssistantResult, 'reply' | 'actions' | 'sources'> & {
  facts?: unknown;
};

@Injectable()
export class CatalogAgent {
  constructor(
    private readonly tours: ToursService,
    private readonly schedules: SchedulesService,
  ) {}

  private dateFloor(value?: string) {
    return value ? new Date(value + 'T00:00:00+07:00').getTime() : null;
  }

  private dateCeil(value?: string) {
    return value ? new Date(value + 'T23:59:59.999+07:00').getTime() : null;
  }

  async run(intent: AgentIntent): Promise<AgentPayload> {
    const explicitDestination = intent.destination?.trim();
    const searchQuery = explicitDestination || intent.query.trim();
    let page = await this.tours.list({
      q: searchQuery || undefined,
      page: 1,
      pageSize: 20,
    });

    // A free-form query may not match catalog text exactly. An explicit destination is a hard
    // constraint, so never silently broaden it to unrelated tours.
    if (!page.items.length && searchQuery && !explicitDestination) {
      page = await this.tours.list({ page: 1, pageSize: 20 });
    }

    const adults = intent.adults || 1;
    const children = intent.children || 0;
    const partySize = adults + children;
    const departureFrom = this.dateFloor(intent.departureFrom);
    const departureTo = this.dateCeil(intent.departureTo);
    const candidates: Array<{
      tourId: string;
      title: string;
      destination: string;
      durationDays: number;
      scheduleId: string;
      departureAt: Date;
      availableSeats: number;
      adultPrice: number;
      childPrice: number;
      partyTotal: number;
    }> = [];

    for (const tour of page.items) {
      if (intent.durationDays !== undefined && tour.durationDays !== intent.durationDays) continue;

      const schedules = await this.schedules.list(tour.id, 1, 100);
      const eligible = schedules.items
        .map((schedule) => ({
          schedule,
          total: adults * schedule.adultPrice + children * schedule.childPrice,
        }))
        .filter(({ schedule, total }) => {
          if (schedule.availableSeats < partySize) return false;
          const departureAt = new Date(schedule.departureAt).getTime();
          if (departureFrom !== null && departureAt < departureFrom) return false;
          if (departureTo !== null && departureAt > departureTo) return false;
          if (intent.budgetVnd !== undefined && total > intent.budgetVnd) return false;
          return true;
        })
        .sort((a, b) => {
          const dateDiff =
            new Date(a.schedule.departureAt).getTime() - new Date(b.schedule.departureAt).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.total - b.total;
        });

      const best = eligible[0];
      if (!best) continue;

      candidates.push({
        tourId: tour.id,
        title: tour.title,
        destination: tour.destination,
        durationDays: tour.durationDays,
        scheduleId: best.schedule.id,
        departureAt: best.schedule.departureAt,
        availableSeats: best.schedule.availableSeats,
        adultPrice: best.schedule.adultPrice,
        childPrice: best.schedule.childPrice,
        partyTotal: best.total,
      });
    }

    candidates.sort((a, b) => {
      const priceDiff = a.partyTotal - b.partyTotal;
      if (priceDiff !== 0) return priceDiff;
      return new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime();
    });

    const top = candidates.slice(0, 5);
    const reply = top.length
      ? top
          .map(
            (item) =>
              item.title +
              ' tại ' +
              item.destination +
              ', ' +
              item.durationDays +
              ' ngày, tổng cho nhóm hiện tại ' +
              item.partyTotal.toLocaleString('vi-VN') +
              ' VND, còn ' +
              item.availableSeats +
              ' chỗ.',
          )
          .join('\n')
      : 'Chưa tìm thấy tour đáp ứng đồng thời điểm đến, thời lượng, ngày đi, ngân sách và số chỗ trong dữ liệu hiện tại.';

    return {
      reply,
      actions: top.map((item) => ({
        label: 'Xem ' + item.title,
        href: '/tours/' + item.tourId,
        requiresConfirmation: false,
      })),
      sources: top.map((item) => ({
        type: 'TOUR' as const,
        id: item.tourId,
        label: item.title,
      })),
      facts: {
        constraints: {
          adults,
          children,
          budgetVnd: intent.budgetVnd,
          durationDays: intent.durationDays,
          destination: intent.destination,
          departureFrom: intent.departureFrom,
          departureTo: intent.departureTo,
        },
        candidates: top,
      },
    };
  }
}
@Injectable()
export class CustomerAgent {
  constructor(private readonly bookings: BookingsService) {}

  async myBookings(user: AppRequest['user'], bookingId?: string): Promise<AgentPayload> {
    if (!user) {
      return {
        reply: 'Bạn cần đăng nhập để xem các đơn đặt tour của mình.',
        actions: [{ label: 'Đăng nhập', href: '/login', requiresConfirmation: false }],
        sources: [],
      };
    }

    const items = bookingId
      ? [await this.bookings.get(bookingId, user.id)]
      : (await this.bookings.list({ page: 1, pageSize: 5 }, user.id)).items;

    const safeFacts = items.map((booking) => ({
      id: booking.id,
      scheduleId: booking.scheduleId,
      status: booking.status,
      adults: booking.adults,
      children: booking.children,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      expiresAt: booking.expiresAt,
      paidAt: booking.paidAt,
      cashDueAt: booking.cashDueAt,
      cancelledAt: booking.cancelledAt,
      cancelReason: booking.cancelReason,
      tourTitle: booking.tourTitle,
      departureAt: booking.departureAt,
      details: booking.details,
      serverTime: booking.serverTime,
    }));

    return {
      reply: items.length
        ? items
            .map(
              (b) =>
                b.tourTitle +
                ': ' +
                BOOKING_LABELS[b.status] +
                ', ' +
                b.totalAmount.toLocaleString('vi-VN') +
                ' VND, khởi hành ' +
                new Date(b.departureAt).toLocaleString('vi-VN') +
                '.',
            )
            .join('\n')
        : 'Bạn chưa có đơn đặt tour.',
      actions: items.map((b) => ({
        label: 'Xem ' + b.tourTitle,
        href: '/bookings/' + b.id,
        requiresConfirmation: false,
      })),
      sources: items.map((b) => ({
        type: 'BOOKING' as const,
        id: b.id,
        label: b.tourTitle,
      })),
      facts: safeFacts,
    };
  }
}
@Injectable()
export class PolicyAgent {
  run(intent: AgentIntent): AgentPayload {
    const policy =
      'Hệ thống chỉ nhận tour nội địa Việt Nam. Mỗi đơn cần ít nhất 1 người lớn. ' +
      'Chỗ được giữ đúng 15 phút. Khách chỉ được tự hủy khi đơn đang chờ thanh toán hoặc đã thanh toán ' +
      'và còn ít nhất 72 giờ trước giờ khởi hành. Giá và số chỗ luôn được kiểm tra lại tại thời điểm tạo đơn. ' +
      'Thanh toán chỉ được coi là thành công sau callback đã xác minh từ cổng thanh toán; browser return không tự đánh dấu PAID.';

    return {
      reply: policy,
      actions:
        intent.intent === 'POLICY'
          ? []
          : [
              {
                label: 'Mở Đơn của tôi',
                href: '/bookings',
                requiresConfirmation: true,
              },
            ],
      sources: [
        {
          type: 'POLICY',
          id: 'SRS-TOUR-2026-v1.0',
          label: 'Quy tắc đặt, giữ chỗ, hủy và thanh toán',
        },
      ],
      facts: { policy },
    };
  }
}

@Injectable()
export class OperationsAgent {
  constructor(private readonly admin: AdminService) {}

  async run(user: AppRequest['user']): Promise<AgentPayload> {
    if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
      fail(403, 'FORBIDDEN', 'Chỉ bộ phận vận hành được xem dữ liệu quản trị');
    }
    const overview = await this.admin.operationsOverview();
    const summary = overview.summary;
    const statusLine = Object.entries(overview.bookingStatusCounts)
      .map(([status, count]) => status + ': ' + count)
      .join(', ');
    const lowInventory = overview.lowInventorySchedules.length
      ? ' Có ' + overview.lowInventorySchedules.length + ' lịch sắp hết chỗ cần theo dõi.'
      : '';
    return {
      reply:
        'Có ' +
        summary.tours +
        ' tour, ' +
        summary.bookings +
        ' đơn và ' +
        summary.pendingRefunds +
        ' giao dịch cần xử lý hoàn tiền. Trạng thái booking: ' +
        statusLine +
        '.' +
        lowInventory,
      actions: [
        { label: 'Quản lý tour', href: '/admin/tours', requiresConfirmation: false },
        {
          label: 'Lịch khởi hành',
          href: '/admin/schedules',
          requiresConfirmation: false,
        },
        {
          label: 'Xử lý đơn',
          href: '/admin/bookings',
          requiresConfirmation: true,
        },
        {
          label: 'Đối soát thanh toán',
          href: '/admin/payments',
          requiresConfirmation: true,
        },
      ],
      sources: [{ type: 'OPERATIONS', id: 'summary', label: 'Thống kê vận hành' }],
      facts: overview,
    };
  }
}
