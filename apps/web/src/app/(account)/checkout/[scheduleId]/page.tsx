'use client';

import { Suspense, useEffect, useState, use, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAvailability } from '@/hooks/use-availability';
import { bookingApi } from '@/lib/api';
import type { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { IdSchema, type QuoteResultSchema, type Traveler } from '@tour/shared';
import { formatVND, formatDate } from '@/lib/format';

type QuoteResult = z.infer<typeof QuoteResultSchema>;
type TravelerDraft = Pick<Traveler, 'kind' | 'fullName' | 'birthDate' | 'specialRequest'>;

function syncTravelerDrafts(
  current: TravelerDraft[],
  adults: number,
  children: number,
): TravelerDraft[] {
  const existingAdults = current.filter((item) => item.kind === 'ADULT');
  const existingChildren = current.filter((item) => item.kind === 'CHILD');
  const make = (kind: 'ADULT' | 'CHILD', previous?: TravelerDraft): TravelerDraft => ({
    kind,
    fullName: previous?.fullName ?? '',
    birthDate: previous?.birthDate ?? null,
    specialRequest: previous?.specialRequest ?? null,
  });
  return [
    ...Array.from({ length: adults }, (_, index) => make('ADULT', existingAdults[index])),
    ...Array.from({ length: children }, (_, index) => make('CHILD', existingChildren[index])),
  ];
}

function parsePartyParam(value: string | null, fallback: number, min: number, max: number) {
  if (value === null || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { AiContextCard } from '@/components/ai-context-card';
import { useLanguage } from '@/providers/language-provider';
import {
  Calendar,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

function CheckoutContent({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const initialAdults = parsePartyParam(searchParams.get('adults'), 2, 1, 100);
  const initialChildren = parsePartyParam(searchParams.get('children'), 0, 0, 100);

  const [adults, setAdults] = useState<number>(initialAdults);
  const [childrenCount, setChildrenCount] = useState<number>(initialChildren);

  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [travelers, setTravelers] = useState<TravelerDraft[]>(() =>
    syncTravelerDrafts([], initialAdults, initialChildren),
  );

  // Polling availability every 3 seconds
  const { data: schedule, error: availabilityError } = useAvailability(scheduleId);

  // Quote
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Submitting state & error
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep the same idempotency key for a true retry of the same request, but
  // rotate it whenever any booking payload field changes.
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    setTravelers((current) => syncTravelerDrafts(current, adults, childrenCount));
  }, [adults, childrenCount]);

  const bookingRequestKey = useMemo(
    () =>
      JSON.stringify({
        scheduleId,
        adults,
        children: childrenCount,
        contactName,
        contactEmail,
        contactPhone,
        travelers,
      }),
    [scheduleId, adults, childrenCount, contactName, contactEmail, contactPhone, travelers],
  );

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, [bookingRequestKey]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`delta_checkout_draft_${scheduleId}`);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        adults?: number;
        children?: number;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
        travelers?: TravelerDraft[];
      };
      if (Number.isInteger(draft.adults) && draft.adults! >= 1) setAdults(draft.adults!);
      if (Number.isInteger(draft.children) && draft.children! >= 0)
        setChildrenCount(draft.children!);
      if (typeof draft.contactName === 'string') setContactName(draft.contactName);
      if (typeof draft.contactEmail === 'string') setContactEmail(draft.contactEmail);
      if (typeof draft.contactPhone === 'string') setContactPhone(draft.contactPhone);
      if (Array.isArray(draft.travelers)) setTravelers(draft.travelers);
    } catch {
      sessionStorage.removeItem(`delta_checkout_draft_${scheduleId}`);
    }
  }, [scheduleId]);

  // Fetch official quote
  useEffect(() => {
    let active = true;
    setQuoteLoading(true);
    setQuoteError(null);

    bookingApi
      .quote({
        scheduleId,
        adults,
        children: childrenCount,
      })
      .then((res) => {
        if (active) {
          setQuote(res);
          setQuoteError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setQuote(null);
          setQuoteError(
            err instanceof Error
              ? err.message
              : lang === 'en'
                ? 'Unable to calculate quote.'
                : 'Không thể tính toán chi phí.',
          );
        }
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [scheduleId, adults, childrenCount, lang]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      sessionStorage.setItem(
        `delta_checkout_draft_${scheduleId}`,
        JSON.stringify({
          adults,
          children: childrenCount,
          contactName,
          contactEmail,
          contactPhone,
          travelers,
        }),
      );
      const next = `/checkout/${scheduleId}?adults=${adults}&children=${childrenCount}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookingApi.create(
        {
          scheduleId,
          adults,
          children: childrenCount,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          travelers: travelers.map((traveler) => ({
            kind: traveler.kind,
            fullName: traveler.fullName.trim(),
            birthDate: traveler.birthDate || null,
            specialRequest: traveler.specialRequest?.trim() || null,
          })),
        },
        idempotencyKey,
      );

      sessionStorage.removeItem(`delta_checkout_draft_${scheduleId}`);
      router.push(`/bookings/${result.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Unable to create reservation. Please review your details.'
            : 'Không thể tạo đơn giữ chỗ. Quý khách vui lòng kiểm tra lại thông tin.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalGuests = adults + childrenCount;
  const isSeatExceeded = schedule ? totalGuests > schedule.availableSeats : false;

  return (
    <div className="space-y-8">
      {!user && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-950">
          {lang === 'en'
            ? 'You can review the trip and complete traveler details first. Sign in is only required when you actually hold the seats.'
            : 'Bạn có thể xem giá và điền thông tin hành khách trước. Hệ thống chỉ yêu cầu đăng nhập khi bạn thực sự bấm giữ chỗ.'}
        </div>
      )}
      <AiContextCard
        eyebrow="DELTA AI • KIỂM TRA TRƯỚC KHI ĐẶT"
        title="Kiểm tra lại chuyến đi trước khi bạn giữ chỗ"
        description="DELTA AI đối chiếu giá, ngày khởi hành và số chỗ hiện có. Hệ thống vẫn kiểm tra lại một lần nữa khi bạn bấm giữ chỗ."
        prompt={
          schedule && quote
            ? `Kiểm tra giúp tôi trước khi đặt lịch ${scheduleId}: ${adults} người lớn, ${childrenCount} trẻ em, tổng báo giá ${quote.totalAmount.toLocaleString('vi-VN')} VND, hiện còn ${schedule.availableSeats} chỗ. Hãy nêu điều cần chú ý và bước tiếp theo.`
            : `Kiểm tra giúp tôi lịch ${scheduleId} trước khi đặt tour.`
        }
        context={
          schedule
            ? `Checkout schedule ${scheduleId}; departure ${schedule.departureAt}; availableSeats ${schedule.availableSeats}; quote được lấy trực tiếp từ backend.`
            : `Checkout schedule ${scheduleId}; hệ thống đang tải availability.`
        }
        suggestions={[
          'Kiểm tra lại giá và số chỗ cho tôi.',
          'Giải thích quy trình giữ chỗ 15 phút.',
          'Tôi muốn AI tiếp tục thực hiện việc đặt tour.',
        ]}
        agentHref={
          '/assistant?scheduleId=' +
          encodeURIComponent(scheduleId) +
          '&adults=' +
          adults +
          '&children=' +
          childrenCount +
          '&prompt=' +
          encodeURIComponent('Tiếp tục lập kế hoạch đặt lịch tôi đang checkout.')
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Contact Form & Passenger Config */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmitBooking} className="space-y-8">
            {/* Passenger Count Selector */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-luxury">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 pb-4 border-b border-stone-100">
                <Users className="h-5 w-5 text-amber-700" />
                <span>{t('chk_passenger_section')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-xl border border-stone-200 bg-[#faf9f5] p-5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 block text-sm">
                      {t('bk_adult_unit')}
                    </span>
                    <span className="text-xs text-stone-500">{t('chk_adult_desc')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                      className="h-8 w-8 rounded-full border border-stone-300 bg-white flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{adults}</span>
                    <button
                      type="button"
                      disabled={adults >= 100}
                      onClick={() => setAdults((prev) => prev + 1)}
                      className="h-8 w-8 rounded-full border border-stone-300 bg-white flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-[#faf9f5] p-5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 block text-sm">
                      {t('bk_child_unit')}
                    </span>
                    <span className="text-xs text-stone-500">{t('chk_child_desc')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={childrenCount <= 0}
                      onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                      className="h-8 w-8 rounded-full border border-stone-300 bg-white flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{childrenCount}</span>
                    <button
                      type="button"
                      disabled={childrenCount >= 100}
                      onClick={() => setChildrenCount((prev) => prev + 1)}
                      className="h-8 w-8 rounded-full border border-stone-300 bg-white flex items-center justify-center font-bold text-stone-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Realtime availability badge */}
              <div className="mt-6 flex items-center justify-between text-xs px-1">
                <span className="text-stone-500">{t('chk_realtime_seats')}</span>
                {availabilityError ? (
                  <span className="font-medium text-amber-700">{t('chk_cant_check_seats')}</span>
                ) : schedule ? (
                  <span
                    className={`font-semibold ${
                      isSeatExceeded ? 'text-neutral-500 line-through' : 'text-black'
                    }`}
                  >
                    {schedule.availableSeats > 0
                      ? `${t('chk_remaining_seats')} ${schedule.availableSeats} ${t('chk_seats_unit')}`
                      : t('chk_sold_out')}
                  </span>
                ) : (
                  <span className="text-stone-400">{t('chk_checking_seats')}</span>
                )}
              </div>

              {isSeatExceeded && (
                <p role="alert" className="mt-2 text-xs text-red-600 font-medium">
                  {t('chk_seat_exceeded_detail')}
                </p>
              )}
            </div>

            {/* Traveler details */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-luxury">
              <div className="mb-6 border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  {lang === 'en' ? 'Traveler details' : 'Thông tin từng hành khách'}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  {lang === 'en'
                    ? 'Names are required for the booking. Date of birth and special requests are optional and should only be provided when relevant to the trip.'
                    : 'Họ tên được dùng để lập danh sách khách. Ngày sinh và yêu cầu đặc biệt là tùy chọn, chỉ cần cung cấp khi có liên quan đến chuyến đi.'}
                </p>
              </div>

              <div className="space-y-4">
                {travelers.map((traveler, index) => {
                  const adultNumber = travelers
                    .slice(0, index + 1)
                    .filter((item) => item.kind === 'ADULT').length;
                  const childNumber = travelers
                    .slice(0, index + 1)
                    .filter((item) => item.kind === 'CHILD').length;
                  const label =
                    traveler.kind === 'ADULT'
                      ? lang === 'en'
                        ? `Adult ${adultNumber}`
                        : `Người lớn ${adultNumber}`
                      : lang === 'en'
                        ? `Child ${childNumber}`
                        : `Trẻ em ${childNumber}`;

                  return (
                    <div
                      key={`${traveler.kind}-${index}`}
                      className="rounded-2xl border border-stone-200 bg-[#faf9f5] p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                          {label}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-stone-500 ring-1 ring-stone-200">
                          {traveler.kind === 'ADULT'
                            ? lang === 'en'
                              ? 'Adult'
                              : 'Người lớn'
                            : lang === 'en'
                              ? 'Child'
                              : 'Trẻ em'}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-stone-700">
                          {lang === 'en' ? 'Full name *' : 'Họ và tên *'}
                          <input
                            required
                            minLength={2}
                            maxLength={100}
                            value={traveler.fullName}
                            onChange={(event) =>
                              setTravelers((current) =>
                                current.map((item, travelerIndex) =>
                                  travelerIndex === index
                                    ? { ...item, fullName: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-normal text-stone-900 outline-none focus:border-black"
                            placeholder={
                              lang === 'en' ? 'Name on traveler list' : 'Tên trên danh sách khách'
                            }
                          />
                        </label>

                        <label className="text-xs font-semibold text-stone-700">
                          {lang === 'en' ? 'Date of birth' : 'Ngày sinh'}
                          <input
                            type="date"
                            value={traveler.birthDate ?? ''}
                            onChange={(event) =>
                              setTravelers((current) =>
                                current.map((item, travelerIndex) =>
                                  travelerIndex === index
                                    ? { ...item, birthDate: event.target.value || null }
                                    : item,
                                ),
                              )
                            }
                            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-normal text-stone-900 outline-none focus:border-black"
                          />
                        </label>
                      </div>

                      <label className="mt-4 block text-xs font-semibold text-stone-700">
                        {lang === 'en' ? 'Special request' : 'Yêu cầu đặc biệt'}
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={traveler.specialRequest ?? ''}
                          onChange={(event) =>
                            setTravelers((current) =>
                              current.map((item, travelerIndex) =>
                                travelerIndex === index
                                  ? { ...item, specialRequest: event.target.value || null }
                                  : item,
                              ),
                            )
                          }
                          className="mt-1.5 w-full resize-none rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-normal text-stone-900 outline-none focus:border-black"
                          placeholder={
                            lang === 'en'
                              ? 'Meals, mobility assistance, pickup note...'
                              : 'Ăn chay, hỗ trợ di chuyển, lưu ý điểm đón...'
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-stone-500">
                {lang === 'en'
                  ? 'Government identification is not collected by default. Operations may request additional documents only when a specific itinerary legally requires them.'
                  : 'Hệ thống không thu thập CCCD mặc định. Bộ phận vận hành chỉ yêu cầu thêm giấy tờ khi một hành trình cụ thể thực sự cần theo quy định.'}
              </p>
            </div>

            {/* Contact Information Form */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-luxury">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">
                {t('chk_contact_section')}
              </h2>
              <p className="text-xs text-stone-500 mb-6">{t('chk_contact_sub')}</p>

              <div className="space-y-5">
                <div>
                  <label htmlFor="contactName">{t('chk_rep_name_label')}</label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder={lang === 'en' ? 'e.g. John Doe' : 'Ví dụ: Nguyễn Minh Anh'}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contactEmail">{t('chk_rep_email_label')}</label>
                    <input
                      id="contactEmail"
                      type="email"
                      required
                      placeholder="guest@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone">{t('chk_rep_phone_label')}</label>
                    <input
                      id="contactPhone"
                      type="tel"
                      required
                      pattern="^(?:\+84|0)[0-9]{9,10}$"
                      placeholder="0912345678"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      {t('chk_phone_format_hint')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Lock className="h-4 w-4 text-stone-400" />
                <span>{t('chk_security_note')}</span>
              </div>

              <Button
                type="submit"
                disabled={
                  submitting ||
                  quoteLoading ||
                  !quote ||
                  isSeatExceeded ||
                  !contactName ||
                  !contactEmail ||
                  !contactPhone ||
                  travelers.some((traveler) => traveler.fullName.trim().length < 2)
                }
                className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-xl shadow-md text-sm font-semibold"
              >
                {submitting
                  ? t('chk_holding')
                  : !user
                    ? lang === 'en'
                      ? 'Sign in to hold seats'
                      : 'Đăng nhập để giữ chỗ'
                    : t('chk_btn_hold')}
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Booking Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-luxury">
            <h3 className="font-serif text-xl font-bold text-stone-900 pb-4 border-b border-stone-100">
              {t('chk_summary_section')}
            </h3>

            <div className="mt-5 space-y-4 text-xs">
              {schedule && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf9f5] border border-stone-200/80">
                  <Calendar className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block text-sm">
                      {t('chk_departure_prefix')} {formatDate(schedule.departureAt)}
                    </span>
                    <span className="text-stone-500 mt-0.5 block">{t('chk_dep_location')}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 py-3 border-y border-stone-100 text-stone-600">
                <div className="flex justify-between">
                  <span>
                    {t('bk_ticket_adult')} ({adults} {t('chk_seats_unit')}):
                  </span>
                  <span className="font-medium text-stone-900">
                    {formatVND(adults * (quote?.adultPrice ?? schedule?.adultPrice ?? 0))}
                  </span>
                </div>
                {childrenCount > 0 && (
                  <div className="flex justify-between">
                    <span>
                      {t('bk_ticket_child')} ({childrenCount} {t('chk_seats_unit')}):
                    </span>
                    <span className="font-medium text-stone-900">
                      {formatVND(childrenCount * (quote?.childPrice ?? schedule?.childPrice ?? 0))}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block text-sm">
                    {t('bk_total_summary')}
                  </span>
                  <span className="text-[10px] text-stone-400">{t('chk_tax_included')}</span>
                </div>
                <span className="font-serif text-2xl font-bold text-amber-900">
                  {quoteLoading
                    ? t('chk_calculating')
                    : quote
                      ? formatVND(quote.totalAmount)
                      : schedule
                        ? formatVND(
                            adults * schedule.adultPrice + childrenCount * schedule.childPrice,
                          )
                        : '—'}
                </span>
              </div>

              {quoteError && <p className="text-xs text-red-600">{quoteError}</p>}

              <div className="mt-6 rounded-xl bg-amber-50/60 border border-amber-200/60 p-4 space-y-2 text-stone-600">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{t('chk_hold_rule_title')}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{t('chk_hold_rule_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const resolvedParams = use(params);
  const scheduleId = resolvedParams.scheduleId;
  const { t } = useLanguage();

  if (!IdSchema.safeParse(scheduleId).success) {
    return (
      <PageShell
        badge={t('chk_shell_badge')}
        title={t('chk_shell_title')}
        description={t('chk_shell_desc')}
      >
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
          <p className="mt-3 text-sm font-bold text-red-900">Mã lịch khởi hành không hợp lệ.</p>
          <Button asChild className="mt-5 bg-stone-900 text-white">
            <Link href="/tours">Quay lại danh sách tour</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      badge={t('chk_shell_badge')}
      title={t('chk_shell_title')}
      description={t('chk_shell_desc')}
    >
      <Suspense
        fallback={
          <div className="p-12 text-center text-sm text-stone-500">{t('chk_loading_page')}</div>
        }
      >
        <CheckoutContent scheduleId={scheduleId} />
      </Suspense>
    </PageShell>
  );
}
