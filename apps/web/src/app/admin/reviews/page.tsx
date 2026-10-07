'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminTourReview } from '@tour/shared';
import { Star, MessageSquareText, RefreshCcw, Trash2, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            'h-4 w-4 ' + (star <= value ? 'fill-amber-400 text-amber-500' : 'text-stone-300')
          }
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AdminTourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminApi
      .reviews()
      .then((page) => setReviews(page.items))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Không thể tải feedback khách hàng.'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
    return {
      total,
      average,
      fiveStar: reviews.filter((review) => review.rating === 5).length,
      lowRating: reviews.filter((review) => review.rating <= 2).length,
    };
  }, [reviews]);

  const remove = async (review: AdminTourReview) => {
    if (user?.role !== 'ADMIN') return;
    const accepted = window.confirm(
      `Xóa đánh giá ${review.rating} sao của ${review.authorName} cho “${review.tourTitle}”? Thao tác sẽ được ghi audit log.`,
    );
    if (!accepted) return;

    setRemovingId(review.id);
    setError(null);
    try {
      await adminApi.removeReview(review.id);
      setReviews((items) => items.filter((item) => item.id !== review.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa đánh giá.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <PageShell
      badge="KHÁCH HÀNG • FEEDBACK"
      title="Đánh Giá & Phản Hồi"
      description="Theo dõi đánh giá sao và nội dung feedback từ khách đã hoàn thành tour. Chỉ đánh giá xác thực từ booking COMPLETED mới xuất hiện."
      action={
        <Button variant="outline" onClick={load} className="text-xs gap-1.5">
          <RefreshCcw className="h-4 w-4" />
          Tải lại
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Tổng feedback', stats.total.toString()],
          ['Điểm trung bình', stats.average.toFixed(1) + '/5'],
          ['Đánh giá 5 sao', stats.fiveStar.toString()],
          ['Cần chú ý', stats.lowRating.toString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              {label}
            </div>
            <div className="mt-1 text-3xl font-black text-stone-950">{value}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border bg-white" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <MessageSquareText className="mx-auto h-10 w-10 text-stone-400" />
          <p className="mt-3 text-sm font-black text-stone-900">Chưa có feedback xác thực</p>
          <p className="mt-1 text-xs text-stone-500">
            Feedback sẽ xuất hiện sau khi khách hoàn thành tour và gửi đánh giá.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-black text-stone-950">{review.tourTitle}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Booking xác thực
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Stars value={review.rating} />
                    <span className="text-xs font-bold text-stone-800">{review.authorName}</span>
                    <span className="text-[11px] text-stone-500">{review.authorEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <time className="text-[10px] text-stone-400">
                    {new Intl.DateTimeFormat('vi-VN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(review.createdAt))}
                  </time>
                  {user?.role === 'ADMIN' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={removingId === review.id}
                      onClick={() => void remove(review)}
                      className="h-8 border-red-200 text-[11px] text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {removingId === review.id ? 'Đang xóa' : 'Gỡ'}
                    </Button>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-xs leading-6 text-stone-700">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
