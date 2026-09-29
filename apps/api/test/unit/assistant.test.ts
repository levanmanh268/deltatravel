import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

const { AssistantService } = require('../../dist/assistant/assistant.service');
const { AiProviderService } = require('../../dist/assistant/ai-provider.service');
const { CatalogAgent, CustomerAgent, OperationsAgent } = require('../../dist/assistant/agents');

describe('assistant Stage 1 grounding and authorization', () => {
  it('falls back deterministically when no AI provider is configured', async () => {
    const ai = new AiProviderService(new ConfigService({}));
    const planned = await ai.classify(
      'lập kế hoạch 2 người lớn 1 trẻ em ngân sách 8 triệu từ 10/10/2026 đến 12/10/2026',
      [],
    );
    expect(planned.mode).toBe('RULE_BASED');
    expect(planned.intent.intent).toBe('TRAVEL_PLAN');
    expect(planned.intent.adults).toBe(2);
    expect(planned.intent.children).toBe(1);
    expect(planned.intent.budgetVnd).toBe(8000000);
    expect(planned.intent.departureFrom).toBe('2026-10-10');
    expect(planned.intent.departureTo).toBe('2026-10-12');
  });

  it('delegates MY_BOOKINGS using the authenticated principal', async () => {
    const ai = {
      classify: vi.fn().mockResolvedValue({
        intent: { intent: 'MY_BOOKINGS', query: '' },
        mode: 'RULE_BASED',
      }),
      synthesize: vi.fn(),
    };
    const customer = {
      myBookings: vi.fn().mockResolvedValue({ reply: 'ok', actions: [], sources: [], facts: [] }),
    };
    const service = new AssistantService(ai, {}, customer, {}, {}, {});
    const user = { id: 'principal', role: 'CUSTOMER' };
    const result = await service.chat({ message: 'đơn của tôi', history: [] }, user);
    expect(result.reply).toBe('ok');
    expect(customer.myBookings).toHaveBeenCalledWith(user, undefined);
  });

  it('rejects customer access to OperationsAgent', async () => {
    const admin = { operationsOverview: vi.fn() };
    const operations = new OperationsAgent(admin);
    await expect(operations.run({ id: 'customer', role: 'CUSTOMER' })).rejects.toThrow();
    expect(admin.operationsOverview).not.toHaveBeenCalled();
  });

  it('routes admin page context to operations even when the prompt is about payments or inventory', async () => {
    const ai = new AiProviderService(new ConfigService({}));

    const refund = await ai.classify(
      'Có khoản hoàn tiền nào đang chờ không? Bối cảnh giao diện hiện tại: Admin route hiện tại: /admin/payments.',
      [],
    );
    expect(refund.mode).toBe('RULE_BASED');
    expect(refund.intent.intent).toBe('OPERATIONS');

    const inventory = await ai.classify(
      'Lịch nào cần chú ý về số chỗ? Bối cảnh giao diện hiện tại: Admin route hiện tại: /admin/schedules.',
      [],
    );
    expect(inventory.intent.intent).toBe('OPERATIONS');
  });

  it('detects a concrete booking context without treating its id as a schedule id', async () => {
    const ai = new AiProviderService(new ConfigService({}));
    const id = '33333333-3333-4333-8333-333333333333';
    const planned = await ai.classify('Tóm tắt booking ' + id + ' của tôi', []);
    expect(planned.mode).toBe('RULE_BASED');
    expect(planned.intent.intent).toBe('MY_BOOKINGS');
    expect(planned.intent.bookingId).toBe(id);
    expect(planned.intent.scheduleId).toBeUndefined();
  });

  it('synthesizes booking facts while preserving authenticated ownership lookup', async () => {
    const ai = {
      classify: vi.fn().mockResolvedValue({
        intent: {
          intent: 'MY_BOOKINGS',
          query: '',
          bookingId: '33333333-3333-4333-8333-333333333333',
        },
        mode: 'RULE_BASED',
      }),
      synthesize: vi.fn().mockResolvedValue({ reply: 'grounded booking summary', mode: 'GROQ' }),
    };
    const facts = [{ id: '33333333-3333-4333-8333-333333333333', status: 'PAID' }];
    const customer = {
      myBookings: vi.fn().mockResolvedValue({ reply: 'fallback', actions: [], sources: [], facts }),
    };
    const service = new AssistantService(ai, {}, customer, {}, {}, {});
    const user = { id: 'principal', role: 'CUSTOMER' };
    const result = await service.chat({ message: 'booking của tôi', history: [] }, user);
    expect(customer.myBookings).toHaveBeenCalledWith(user, '33333333-3333-4333-8333-333333333333');
    expect(ai.synthesize).toHaveBeenCalledWith('booking của tôi', facts, 'vi');
    expect(result.reply).toBe('grounded booking summary');
    expect(result.mode).toBe('GROQ');
  });

  it('applies seat, duration, date and budget constraints before recommending catalog tours', async () => {
    const tours = {
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'tour-ok',
            title: 'Đà Nẵng 3 ngày',
            destination: 'Đà Nẵng',
            durationDays: 3,
          },
          {
            id: 'tour-wrong-duration',
            title: 'Đà Nẵng 5 ngày',
            destination: 'Đà Nẵng',
            durationDays: 5,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 2,
      }),
    };
    const schedules = {
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'too-few-seats',
            departureAt: new Date('2026-10-15T08:00:00+07:00'),
            availableSeats: 1,
            adultPrice: 2000000,
            childPrice: 1000000,
          },
          {
            id: 'over-budget',
            departureAt: new Date('2026-10-15T08:00:00+07:00'),
            availableSeats: 8,
            adultPrice: 5000000,
            childPrice: 1000000,
          },
          {
            id: 'outside-window',
            departureAt: new Date('2026-11-01T08:00:00+07:00'),
            availableSeats: 8,
            adultPrice: 2000000,
            childPrice: 1000000,
          },
          {
            id: 'valid-schedule',
            departureAt: new Date('2026-10-16T08:00:00+07:00'),
            availableSeats: 8,
            adultPrice: 3000000,
            childPrice: 1000000,
          },
        ],
        page: 1,
        pageSize: 100,
        total: 4,
      }),
    };
    const catalog = new CatalogAgent(tours, schedules);
    const result = await catalog.run({
      intent: 'TRAVEL_PLAN',
      query: '',
      destination: 'Đà Nẵng',
      adults: 2,
      children: 0,
      budgetVnd: 8000000,
      durationDays: 3,
      departureFrom: '2026-10-10',
      departureTo: '2026-10-20',
    });

    expect(result.sources).toEqual([{ type: 'TOUR', id: 'tour-ok', label: 'Đà Nẵng 3 ngày' }]);
    expect(result.facts.candidates).toHaveLength(1);
    expect(result.facts.candidates[0].scheduleId).toBe('valid-schedule');
    expect(result.facts.candidates[0].partyTotal).toBe(6000000);
    expect(schedules.list).toHaveBeenCalledTimes(1);
  });

  it('does not broaden an explicit destination when the catalog has no direct match', async () => {
    const tours = {
      list: vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 }),
    };
    const catalog = new CatalogAgent(tours, { list: vi.fn() });
    const result = await catalog.run({
      intent: 'SEARCH_TOURS',
      query: '',
      destination: 'Côn Đảo',
    });

    expect(result.sources).toEqual([]);
    expect(tours.list).toHaveBeenCalledTimes(1);
  });

  it('minimizes booking facts before sending them to the external AI synthesizer', async () => {
    const bookings = {
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'booking-1',
            scheduleId: 'schedule-1',
            status: 'PAID',
            adults: 2,
            children: 0,
            totalAmount: 6000000,
            currency: 'VND',
            contactName: 'Sensitive Name',
            contactEmail: 'sensitive@example.com',
            contactPhone: '0901234567',
            expiresAt: '2026-10-10T10:00:00+07:00',
            paidAt: '2026-10-10T09:00:00+07:00',
            cashDueAt: null,
            cancelledAt: null,
            cancelReason: null,
            tourTitle: 'Đà Nẵng',
            departureAt: '2026-10-16T08:00:00+07:00',
            details: [],
            serverTime: '2026-10-10T09:05:00+07:00',
          },
        ],
      }),
    };
    const customer = new CustomerAgent(bookings);
    const result = await customer.myBookings({ id: 'principal', role: 'CUSTOMER' });
    const serialized = JSON.stringify(result.facts);

    expect(serialized).not.toContain('Sensitive Name');
    expect(serialized).not.toContain('sensitive@example.com');
    expect(serialized).not.toContain('0901234567');
    expect(serialized).toContain('booking-1');
    expect(serialized).toContain('PAID');
  });

  it('does not invent availability without a schedule id', async () => {
    const ai = {
      classify: vi.fn().mockResolvedValue({
        intent: { intent: 'AVAILABILITY', query: '' },
        mode: 'RULE_BASED',
      }),
      synthesize: vi.fn(),
    };
    const schedules = { get: vi.fn() };
    const service = new AssistantService(ai, {}, {}, {}, {}, schedules);
    const result = await service.chat({ message: 'còn chỗ không', history: [] }, undefined);
    expect(result.reply).toContain('lịch khởi hành cụ thể');
    expect(schedules.get).not.toHaveBeenCalled();
  });
});
