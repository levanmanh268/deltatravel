'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CheckCircle2, MessageSquareText, Star } from 'lucide-react';
import type { TourReviewList } from '@tour/shared';
import { reviewApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={value + ' / 5 sao'}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return onChange ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={star + ' sao'}
          >
            <Star
              className={
                'h-5 w-5 ' +
                (filled ? 'fill-amber-400 text-amber-500' : 'text-stone-300')
              }
            />
          </button>
        ) : (
          <Star
            key={star}
            className={
              'h-4 w-4 ' +
              (filled ? 'fill-amber-400 text-amber-500' : 'text-stone-300')
            }
          />
        );
      })}
    </div>
  );
}

export function TourReviews({ tourId, lang }: { tourId: string; lang: 'vi' | 'en' }) {
  const { user } = useAuth();
  const [data, setData] = useState<TourReviewList | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    reviewApi
      .list(tourId)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải đánh giá.');
      })
      .finally(() => setLoading(false));
  }, [tourId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await reviewApi.upsert(tourId, { rating, comment });
      setComment('');
      setNotice(
        lang === 'en'
          ? 'Your verified review has been saved.'
          : 'Đánh giá đã được lưu và gắn nhãn khách đã đặt tour.',
      );
      load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Could not save your review.'
            : 'Không thể lưu đánh giá.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      aria-labelledby="tour-reviews-title"
      className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
            <MessageSquareText className="h-4 w-4" />
            {lang === 'en' ? 'Traveler feedback' : 'Phản hồi khách hàng'}
          </p>
          <h2 id="tour-reviews-title" className="mt-1 text-2xl font-black text-stone-950">
            {lang === 'en' ? 'Ratings & reviews' : 'Đánh giá tour'}
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-stone-600">
            {lang === 'en'
              ? 'Only accounts with a paid, confirmed or completed booking for this tour can publish a review.'
              : 'Chỉ tài khoản có booking đã thanh toán, xác nhận hoặc hoàn thành tour này mới được đăng đánh giá.'}
          </p>
        </div>

        <div className="rounded-2xl bg-stone-950 px-5 py-4 text-white">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black">{data?.summary.average.toFixed(1) ?? '0.0'}</span>
            <span className="pb-1 text-xs text-stone-300">/ 5</span>
          </div>
          <Stars value={Math.round(data?.summary.average ?? 0)} />
          <p className="mt-1 text-[10px] text-stone-400">
            {data?.summary.count ?? 0} {lang === 'en' ? 'verified reviews' : 'đánh giá xác thực'}
          </p>
        </div>
      </div>

      {user && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-black text-stone-950">
                {lang === 'en' ? 'Share your experience' : 'Chia sẻ trải nghiệm của bạn'}
              </h3>
              <p className="mt-1 text-[11px] text-stone-600">
                {lang === 'en'
                  ? 'Submitting again updates your existing review.'
                  : 'Nếu gửi lại, hệ thống sẽ cập nhật đánh giá trước đó của bạn.'}
              </p>
            </div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            required
            minLength={3}
            maxLength={1200}
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={
              lang === 'en'
                ? 'What was useful, memorable, or worth improving?'
                : 'Điều gì đáng nhớ, hữu ích hoặc cần cải thiện?'
            }
            className="mt-4 w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 outline-none focus:border-amber-500"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-semibold text-stone-500">
              {comment.length}/1200
            </span>
            <Button type="submit" disabled={submitting || comment.trim().length < 3}>
              {submitting
                ? lang === 'en'
                  ? 'Saving...'
                  : 'Đang lưu...'
                : lang === 'en'
                  ? 'Submit verified review'
                  : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      )}

      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-7 space-y-4">
        {loading ? (
          [1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-stone-100" />
          ))
        ) : !data?.items.length ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center">
            <p className="text-sm font-bold text-stone-800">
              {lang === 'en' ? 'No reviews yet.' : 'Tour này chưa có đánh giá.'}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {lang === 'en'
                ? 'Verified travelers can be the first to share their experience.'
                : 'Khách đã đặt tour có thể là người đầu tiên chia sẻ trải nghiệm.'}
            </p>
          </div>
        ) : (
          data.items.map((review) => (
            <article key={review.id} className="rounded-2xl border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-black text-white">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-stone-950">
                      {review.authorName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {lang === 'en' ? 'Verified booking' : 'Đã đặt tour'}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Stars value={review.rating} />
                  <p className="mt-1 text-[10px] text-stone-400">
                    {new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
                      dateStyle: 'medium',
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-stone-700">
                {review.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
