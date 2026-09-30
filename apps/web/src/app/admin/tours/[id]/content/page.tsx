'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour, TourCommercial, TourItineraryDay } from '@tour/shared';
import { adminApi } from '@/lib/api';
import { getTourImage, getTourItinerary } from '@/lib/tour-assets';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';

function emptyDay(day: number): TourItineraryDay {
  return { day, title: `Ngày ${day}`, activities: [''], meals: null, stay: null, imageUrl: null };
}

function emptyCommercial(): TourCommercial {
  return {
    departureBasis: '',
    transport: [''],
    included: [''],
    notIncluded: [],
    optionalCosts: [],
    cancellationPolicy: '',
    dateChangePolicy: '',
    refundPolicy: '',
    singleRoomPolicy: '',
    childPolicy: '',
    weatherPolicy: '',
    incidentalCostPolicy: '',
  };
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TourContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tour, setTour] = useState<Tour | null>(null);
  const [requiredDays, setRequiredDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<TourItineraryDay[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [dayFiles, setDayFiles] = useState<Record<number, File | null>>({});
  const [commercial, setCommercial] = useState<TourCommercial>(emptyCommercial());

  useEffect(() => {
    let active = true;
    Promise.all([adminApi.tour(id), adminApi.schedules()])
      .then(([found, schedulePage]) => {
        if (!active) return;
        setTour(found);
        setImageUrl(found.imageUrl ?? null);
        setGallery(found.galleryImages ?? []);
        setCommercial(found.commercial ?? emptyCommercial());
        const scheduleDurations = schedulePage.items
          .filter((schedule) => schedule.tourId === found.id)
          .map((schedule) => schedule.durationDays);
        const required = Math.max(found.durationDays, ...scheduleDurations, 1);
        setRequiredDays(required);
        const backend = found.itinerary ?? [];
        const preset = getTourItinerary(found, 'vi');
        const presetIsPlaceholder =
          preset.length === 1 && preset[0]?.title.toLowerCase().includes('chờ xác minh');
        const existing = backend.length ? backend : presetIsPlaceholder ? [] : preset;
        const count = Math.max(required, existing.length);
        setItinerary(Array.from({ length: count }, (_, i) => existing[i] ?? emptyDay(i + 1)));
      })
      .catch(
        (e) => active && setError(e instanceof Error ? e.message : 'Không tải được nội dung tour.'),
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const completeDays = useMemo(
    () =>
      itinerary.filter(
        (day) =>
          day.title.trim().length >= 3 && day.activities.some((item) => item.trim().length >= 2),
      ).length,
    [itinerary],
  );

  const setDay = (index: number, patch: Partial<TourItineraryDay>) => {
    setItinerary((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    if (!tour) return;
    if (itinerary.length < requiredDays || completeDays < requiredDays) {
      setError(
        `Cần hoàn thiện ít nhất ${requiredDays} ngày lịch trình vì đây là thời lượng dài nhất đang được cấu hình.`,
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let nextCover = imageUrl;
      if (coverFile) nextCover = await adminApi.uploadTourImage(tour.id, coverFile, 'COVER');

      const uploadedGallery: string[] = [];
      const remainingGallerySlots = Math.max(0, 20 - gallery.length);
      for (const file of galleryFiles.slice(0, remainingGallerySlots)) {
        uploadedGallery.push(await adminApi.uploadTourImage(tour.id, file, 'GALLERY'));
      }
      const nextGallery = [...gallery, ...uploadedGallery].slice(0, 20);

      const nextItinerary: TourItineraryDay[] = [];
      for (const day of itinerary) {
        const file = dayFiles[day.day];
        const uploaded = file
          ? await adminApi.uploadTourImage(tour.id, file, 'ITINERARY', day.day)
          : day.imageUrl;
        nextItinerary.push({
          ...day,
          title: day.title.trim(),
          activities: day.activities.map((item) => item.trim()).filter(Boolean),
          meals: day.meals?.trim() || null,
          stay: day.stay?.trim() || null,
          imageUrl: uploaded || null,
        });
      }

      const commercialReady =
        commercial.departureBasis.trim().length >= 3 &&
        commercial.transport.some((item) => item.trim().length >= 2) &&
        commercial.included.some((item) => item.trim().length >= 2) &&
        commercial.cancellationPolicy.trim().length >= 5 &&
        commercial.dateChangePolicy.trim().length >= 5 &&
        commercial.refundPolicy.trim().length >= 5 &&
        commercial.singleRoomPolicy.trim().length >= 5 &&
        commercial.childPolicy.trim().length >= 5 &&
        commercial.weatherPolicy.trim().length >= 5 &&
        commercial.incidentalCostPolicy.trim().length >= 5;

      const updated = await adminApi.updateTour(tour.id, {
        imageUrl: nextCover,
        galleryImages: nextGallery,
        itinerary: nextItinerary,
        commercial: commercialReady
          ? {
              ...commercial,
              departureBasis: commercial.departureBasis.trim(),
              transport: commercial.transport.map((item) => item.trim()).filter(Boolean),
              included: commercial.included.map((item) => item.trim()).filter(Boolean),
              notIncluded: commercial.notIncluded.map((item) => item.trim()).filter(Boolean),
              optionalCosts: commercial.optionalCosts.map((item) => item.trim()).filter(Boolean),
              cancellationPolicy: commercial.cancellationPolicy.trim(),
              dateChangePolicy: commercial.dateChangePolicy.trim(),
              refundPolicy: commercial.refundPolicy.trim(),
              singleRoomPolicy: commercial.singleRoomPolicy.trim(),
              childPolicy: commercial.childPolicy.trim(),
              weatherPolicy: commercial.weatherPolicy.trim(),
              incidentalCostPolicy: commercial.incidentalCostPolicy.trim(),
            }
          : null,
      });
      setTour(updated);
      setImageUrl(updated.imageUrl ?? null);
      setGallery(updated.galleryImages ?? []);
      setItinerary(updated.itinerary ?? []);
      setCommercial(updated.commercial ?? emptyCommercial());
      setCoverFile(null);
      setGalleryFiles([]);
      setDayFiles({});
      setSuccess('Đã lưu ảnh và lịch trình vào backend. Trang khách và AI sẽ dùng dữ liệu này.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu nội dung tour.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      badge="TOUR CONTENT • SOURCE OF TRUTH"
      title={tour ? `Nội Dung & Ảnh • ${tour.title}` : 'Nội Dung & Ảnh Tour'}
      description="Ảnh bìa, gallery và ảnh từng ngày lịch trình được lưu từ backend. Không dùng lại một ảnh cho mọi khu vực nếu chưa có dữ liệu."
      action={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/tours">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          <Button
            onClick={() => void save()}
            disabled={saving || loading}
            className="bg-black text-white"
          >
            <Save className="mr-1 h-4 w-4" />
            {saving ? 'Đang tải & lưu...' : 'Lưu nội dung'}
          </Button>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          {success}
        </div>
      )}

      {loading || !tour ? (
        <div className="h-64 animate-pulse rounded-3xl bg-stone-100" />
      ) : (
        <div className="space-y-8">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">1. Ảnh bìa</h2>
            <p className="mt-1 text-xs text-stone-500">
              Ảnh dùng cho card và banner chi tiết. JPEG/PNG/WebP, tối đa 5 MB.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
                <Image
                  src={imageUrl || getTourImage(tour)}
                  alt="Ảnh bìa tour"
                  fill
                  className="object-cover"
                />
              </div>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed p-6 text-sm font-bold hover:bg-stone-50">
                <ImagePlus className="mr-2 h-5 w-5" />
                Chọn ảnh bìa mới
                <input
                  className="hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            {coverFile && <p className="mt-2 text-xs text-stone-600">Đã chọn: {coverFile.name}</p>}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">2. Ảnh chi tiết / Gallery</h2>
            <p className="mt-1 text-xs text-stone-500">
              Tối đa 20 ảnh. Nếu chưa có gallery, web không tự nhân bản ảnh bìa.
            </p>
            {gallery.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {gallery.map((url, index) => (
                  <div
                    key={url + index}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100"
                  >
                    <Image
                      src={url}
                      alt={`Ảnh chi tiết ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setGallery((items) => items.filter((_, i) => i !== index))}
                      className="absolute right-2 top-2 rounded-full bg-black/75 p-2 text-white"
                      aria-label={`Xóa ảnh ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed p-5 text-sm font-bold hover:bg-stone-50">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ảnh chi tiết
              <input
                className="hidden"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            {galleryFiles.length > 0 && (
              <p className="mt-2 text-xs text-stone-600">
                Sẽ tải thêm {galleryFiles.length} ảnh khi lưu.
              </p>
            )}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-black">3. Lịch trình & ảnh theo ngày</h2>
                <p className="mt-1 text-xs text-stone-500">
                  Tour mặc định {tour.durationDays} ngày. Lịch dài nhất hiện tại cần {requiredDays}{' '}
                  ngày nội dung.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border px-3 py-1 text-xs font-bold">
                  Hoàn thiện {completeDays}/{requiredDays} ngày bắt buộc
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={itinerary.length >= 60}
                  onClick={() => setItinerary((items) => [...items, emptyDay(items.length + 1)])}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm ngày
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {itinerary.map((day, index) => (
                <article key={day.day} className="rounded-2xl border p-5">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
                        {day.imageUrl ? (
                          <Image
                            src={day.imageUrl}
                            alt={`Ngày ${day.day}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-stone-500">
                            Chưa có ảnh riêng cho ngày {day.day}
                          </div>
                        )}
                      </div>
                      <label className="mt-2 block cursor-pointer rounded-xl border border-dashed p-3 text-center text-xs font-bold hover:bg-stone-50">
                        Tải ảnh ngày {day.day}
                        <input
                          className="hidden"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) =>
                            setDayFiles((files) => ({
                              ...files,
                              [day.day]: e.target.files?.[0] ?? null,
                            }))
                          }
                        />
                      </label>
                      {dayFiles[day.day] && (
                        <p className="mt-1 truncate text-[10px] text-stone-500">
                          {dayFiles[day.day]?.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold">
                        Tiêu đề ngày {day.day}
                        <input
                          value={day.title}
                          onChange={(e) => setDay(index, { title: e.target.value })}
                          maxLength={200}
                        />
                      </label>
                      <label className="block text-xs font-bold">
                        Hoạt động, mỗi dòng một mục
                        <textarea
                          rows={6}
                          value={day.activities.join('\n')}
                          onChange={(e) =>
                            setDay(index, { activities: e.target.value.split('\n') })
                          }
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-bold">
                          Bữa ăn
                          <input
                            value={day.meals ?? ''}
                            onChange={(e) => setDay(index, { meals: e.target.value || null })}
                            maxLength={200}
                          />
                        </label>
                        <label className="block text-xs font-bold">
                          Lưu trú
                          <input
                            value={day.stay ?? ''}
                            onChange={(e) => setDay(index, { stay: e.target.value || null })}
                            maxLength={200}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">4. Giá, dịch vụ & chính sách</h2>
            <p className="mt-1 text-xs text-stone-500">
              Đây là nguồn sự thật cho phương tiện, hạng mục đã bao gồm, chưa bao gồm và chính sách
              vận hành. Mỗi mục danh sách nhập một dòng.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block text-xs font-bold lg:col-span-2">
                Điểm / cơ sở khởi hành
                <input
                  value={commercial.departureBasis}
                  onChange={(e) =>
                    setCommercial((current) => ({ ...current, departureBasis: e.target.value }))
                  }
                  placeholder="Ví dụ: 07:00 tại Nhà hát Lớn Hà Nội, theo lịch mở bán"
                />
              </label>

              <label className="block text-xs font-bold">
                Phương tiện
                <textarea
                  rows={5}
                  value={commercial.transport.join('\n')}
                  onChange={(e) =>
                    setCommercial((current) => ({
                      ...current,
                      transport: e.target.value.split('\n'),
                    }))
                  }
                  placeholder="Xe Limousine Hà Nội – Ninh Bình&#10;Thuyền Tràng An"
                />
              </label>

              <label className="block text-xs font-bold">
                Giá đã bao gồm
                <textarea
                  rows={5}
                  value={commercial.included.join('\n')}
                  onChange={(e) =>
                    setCommercial((current) => ({
                      ...current,
                      included: e.target.value.split('\n'),
                    }))
                  }
                  placeholder="Xe di chuyển&#10;Vé tham quan...&#10;Bữa ăn..."
                />
              </label>

              <label className="block text-xs font-bold">
                Chưa bao gồm
                <textarea
                  rows={5}
                  value={commercial.notIncluded.join('\n')}
                  onChange={(e) =>
                    setCommercial((current) => ({
                      ...current,
                      notIncluded: e.target.value.split('\n'),
                    }))
                  }
                />
              </label>

              <label className="block text-xs font-bold">
                Chi phí tùy chọn / phát sinh
                <textarea
                  rows={5}
                  value={commercial.optionalCosts.join('\n')}
                  onChange={(e) =>
                    setCommercial((current) => ({
                      ...current,
                      optionalCosts: e.target.value.split('\n'),
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {[
                ['cancellationPolicy', 'Chính sách hủy tour'],
                ['dateChangePolicy', 'Đổi ngày đi'],
                ['refundPolicy', 'Hoàn tiền'],
                ['singleRoomPolicy', 'Phụ thu phòng đơn'],
                ['childPolicy', 'Chính sách trẻ em'],
                ['weatherPolicy', 'Thời tiết xấu / bất khả kháng'],
                ['incidentalCostPolicy', 'Chi phí phát sinh'],
              ].map(([key, label]) => (
                <label key={key} className="block text-xs font-bold">
                  {label}
                  <textarea
                    rows={4}
                    value={commercial[key as keyof TourCommercial] as string}
                    onChange={(e) =>
                      setCommercial((current) => ({ ...current, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>

            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-[11px] font-semibold text-amber-900">
              Tour mới chỉ được mở bán khi có ảnh bìa, lịch trình đủ số ngày, ít nhất một lịch khởi
              hành OPEN và bộ chính sách này đã hoàn thiện.
            </p>
          </section>
        </div>
      )}
    </PageShell>
  );
}
