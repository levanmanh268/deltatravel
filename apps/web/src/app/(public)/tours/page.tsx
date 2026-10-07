'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { tourApi } from '@/lib/api';
import type { Tour } from '@tour/shared';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/providers/language-provider';
import { getLocalizedTour } from '@/lib/fallback-data';
import { getTourImage, getTourLuxuryTag } from '@/lib/tour-assets';
import { GiantScrollTypography } from '@/components/giant-scroll-typography';
import { formatVND } from '@/lib/format';
import { LiquidGlassBadge } from '@/components/ui/liquid-glass-badge';
import { AiContextCard } from '@/components/ai-context-card';
import {
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCcw,
  Compass,
  Sparkles,
  Shield,
  Star,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from 'lucide-react';

function ToursListContent() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRegion = searchParams.get('region') || '';

  const [activeRegion, setActiveRegion] = useState(initialRegion);
  const [tours, setTours] = useState<Tour[]>([]);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [sortBy, setSortBy] = useState<
    'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'duration'
  >('recommended');

  const REGION_TABS = [
    { id: '', label: t('tours_tab_all'), subtitle: t('tours_tab_all_sub') },
    { id: 'bac', label: t('reg_bac_name'), subtitle: t('tours_tab_bac_sub') },
    { id: 'trung', label: t('reg_trung_name'), subtitle: t('tours_tab_trung_sub') },
    { id: 'nam', label: t('reg_nam_name'), subtitle: t('tours_tab_nam_sub') },
  ];

  const fetchTours = (region: string) => {
    setLoading(true);
    setAiRecommendedIds([]);
    setError(null);
    tourApi
      .list('', region)
      .then((res) => {
        setTours(res.items);
      })
      .catch((err) => {
        setTours([]);
        setError(
          err instanceof Error
            ? err.message
            : lang === 'en'
              ? 'Unable to load the live tour catalog.'
              : 'Không thể tải danh mục tour trực tiếp từ hệ thống.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const reg = searchParams.get('region') || '';
    setActiveRegion(reg);
    fetchTours(reg);

    const onUpdate = () => {
      fetchTours(reg);
    };
    window.addEventListener('delta_tours_updated', onUpdate);
    return () => window.removeEventListener('delta_tours_updated', onUpdate);
  }, [searchParams, lang]);

  const handleRegionChange = (regId: string) => {
    setActiveRegion(regId);
    const params = new URLSearchParams();
    if (regId) params.set('region', regId);
    router.push(`/tours${regId ? `?region=${regId}` : ''}`);
  };

  const orderedTours = useMemo(() => {
    if (!aiRecommendedIds.length) return tours;
    const rank = new Map(aiRecommendedIds.map((id, index) => [id, index]));
    return [...tours].sort((a, b) => {
      const ar = rank.get(a.id);
      const br = rank.get(b.id);
      if (ar === undefined && br === undefined) return 0;
      if (ar === undefined) return 1;
      if (br === undefined) return -1;
      return ar - br;
    });
  }, [tours, aiRecommendedIds]);

  const filteredTours = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(lang === 'en' ? 'en-US' : 'vi-VN');
    const ceiling = maxPrice ? Number(maxPrice) : null;
    const durationValue = duration ? Number(duration) : null;

    const result = orderedTours.filter((tour) => {
      const localized = getLocalizedTour(tour, lang);
      const searchable = [localized.title, localized.destination, localized.description]
        .join(' ')
        .toLocaleLowerCase(lang === 'en' ? 'en-US' : 'vi-VN');
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (ceiling !== null && Number.isFinite(ceiling)) {
        if (tour.fromPrice === null || tour.fromPrice === undefined || tour.fromPrice > ceiling) {
          return false;
        }
      }
      if (durationValue !== null && Number.isFinite(durationValue)) {
        if (durationValue === 5 ? tour.durationDays < 5 : tour.durationDays !== durationValue) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...result].sort(
        (a, b) =>
          (a.fromPrice ?? Number.MAX_SAFE_INTEGER) - (b.fromPrice ?? Number.MAX_SAFE_INTEGER),
      );
    }
    if (sortBy === 'price-desc') {
      return [...result].sort((a, b) => (b.fromPrice ?? -1) - (a.fromPrice ?? -1));
    }
    if (sortBy === 'rating') {
      return [...result].sort((a, b) => (b.ratingAverage ?? -1) - (a.ratingAverage ?? -1));
    }
    if (sortBy === 'duration') {
      return [...result].sort((a, b) => a.durationDays - b.durationDays);
    }
    return result;
  }, [orderedTours, query, maxPrice, duration, sortBy, lang]);

  const clearFilters = () => {
    setQuery('');
    setMaxPrice('');
    setDuration('');
    setSortBy('recommended');
  };

  const hasManualFilters = Boolean(
    query.trim() || maxPrice || duration || sortBy !== 'recommended',
  );

  return (
    <div className="relative space-y-12 text-black overflow-hidden pb-16">
      {/* Background Giant Parallax Typography 1 */}
      <div className="absolute top-4 left-0 right-0 pointer-events-none -z-10">
        <GiantScrollTypography
          text="CURATED ODYSSEY"
          direction="left"
          speed={0.95}
          outline={true}
        />
      </div>

      <AiContextCard
        eyebrow="DELTA AI • TOUR DISCOVERY"
        title="Bạn có thể hỏi DELTA AI hoặc tự lọc tour theo cách quen thuộc"
        description="AI gợi ý từ dữ liệu tour hiện có. Nếu muốn tự chọn, bộ lọc tìm kiếm, giá, thời lượng và sắp xếp nằm ngay bên dưới."
        prompt={
          activeRegion
            ? `Tìm tour phù hợp nhất ở miền ${activeRegion === 'bac' ? 'Bắc' : activeRegion === 'trung' ? 'Trung' : 'Nam'} cho tôi. Hãy ưu tiên lịch còn chỗ, giá hợp lý và giải thích vì sao phù hợp.`
            : 'Tìm giúp tôi một tour phù hợp nhất. Hãy hỏi hoặc suy luận từ nhu cầu tôi cung cấp, ưu tiên lịch còn chỗ và giá hợp lý.'
        }
        context={`Trang danh sách tour. Bộ lọc vùng hiện tại: ${activeRegion || 'tất cả'}. Catalog đang hiển thị ${tours.length} tour từ backend.`}
        suggestions={[
          'Tìm tour cho 2 người lớn, ngân sách khoảng 8 triệu.',
          'Tôi muốn đi 3-4 ngày, ưu tiên biển và lịch còn nhiều chỗ.',
          'Gợi ý chuyến đi tiết kiệm nhưng trải nghiệm tốt.',
        ]}
        agentHref={
          '/assistant?prompt=' +
          encodeURIComponent(
            activeRegion
              ? `Hãy lập kế hoạch một chuyến đi phù hợp ở miền ${activeRegion === 'bac' ? 'Bắc' : activeRegion === 'trung' ? 'Trung' : 'Nam'} cho tôi.`
              : 'Hãy lập kế hoạch chuyến đi phù hợp nhất cho tôi.',
          )
        }
        onResult={(result) => {
          const ids = result.sources
            .filter((source) => source.type === 'TOUR')
            .map((source) => source.id);
          setAiRecommendedIds([...new Set(ids)]);
        }}
        className="relative z-10"
      />

      {/* Region switcher */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2">
        <div className="inline-flex p-1.5 rounded-full bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_15px_35px_-10px_rgba(0,0,0,0.07)] gap-1.5 flex-wrap justify-center max-w-full">
          {REGION_TABS.map((tab) => {
            const isActive = activeRegion === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRegionChange(tab.id)}
                className={`group relative px-6 py-2.5 rounded-full text-xs font-black transition-all duration-400 flex items-center gap-2 ${
                  isActive
                    ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] scale-[1.02]'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/20 text-amber-200'
                      : 'bg-black/5 text-neutral-700 group-hover:bg-black/10'
                  }`}
                >
                  {tab.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        aria-label={lang === 'en' ? 'Tour filters' : 'Bộ lọc tour'}
        className="relative z-10 rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
            <SlidersHorizontal className="h-4 w-4" />
            {lang === 'en' ? 'Find the right tour' : 'Tìm tour phù hợp'}
          </div>
          {hasManualFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
              {lang === 'en' ? 'Clear filters' : 'Xóa bộ lọc'}
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <span className="sr-only">{lang === 'en' ? 'Search tours' : 'Tìm kiếm tour'}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={lang === 'en' ? 'Destination or tour name' : 'Điểm đến hoặc tên tour'}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
            />
          </label>

          <label>
            <span className="sr-only">{lang === 'en' ? 'Maximum price' : 'Giá tối đa'}</span>
            <select
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-black focus:bg-white"
            >
              <option value="">{lang === 'en' ? 'Any budget' : 'Mọi mức giá'}</option>
              <option value="2000000">≤ 2.000.000 ₫</option>
              <option value="4000000">≤ 4.000.000 ₫</option>
              <option value="6000000">≤ 6.000.000 ₫</option>
              <option value="10000000">≤ 10.000.000 ₫</option>
            </select>
          </label>

          <label>
            <span className="sr-only">{lang === 'en' ? 'Duration' : 'Thời lượng'}</span>
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-black focus:bg-white"
            >
              <option value="">{lang === 'en' ? 'Any duration' : 'Mọi thời lượng'}</option>
              <option value="1">{lang === 'en' ? '1 day' : '1 ngày'}</option>
              <option value="2">{lang === 'en' ? '2 days' : '2 ngày'}</option>
              <option value="3">{lang === 'en' ? '3 days' : '3 ngày'}</option>
              <option value="4">{lang === 'en' ? '4 days' : '4 ngày'}</option>
              <option value="5">{lang === 'en' ? '5+ days' : 'Từ 5 ngày'}</option>
            </select>
          </label>

          <label className="relative">
            <span className="sr-only">{lang === 'en' ? 'Sort tours' : 'Sắp xếp tour'}</span>
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
            >
              <option value="recommended">{lang === 'en' ? 'Recommended' : 'Đề xuất'}</option>
              <option value="price-asc">{lang === 'en' ? 'Lowest price' : 'Giá thấp nhất'}</option>
              <option value="price-desc">{lang === 'en' ? 'Highest price' : 'Giá cao nhất'}</option>
              <option value="rating">{lang === 'en' ? 'Best rated' : 'Đánh giá cao nhất'}</option>
              <option value="duration">
                {lang === 'en' ? 'Shortest duration' : 'Thời lượng ngắn nhất'}
              </option>
            </select>
          </label>
        </div>
      </section>

      {/* Collection Counter & Editorial Tagline */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b border-neutral-200/80 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#edcb8e]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-800">
            {activeRegion
              ? `${t('tours_counter_prefix')} ${REGION_TABS.find((r) => r.id === activeRegion)?.label.toUpperCase()} • ${filteredTours.length} ${t('tours_counter_suffix')}`
              : `${t('tours_counter_prefix')} • ${tours.length} ${t('tours_counter_suffix')}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
          <Shield className="h-3.5 w-3.5 text-amber-600" />
          <span>{t('tours_guarantee_text')}</span>
        </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-neutral-200/80 bg-white p-4 space-y-4 shadow-sm"
            >
              <div className="h-56 bg-neutral-200 rounded-2xl" />
              <div className="space-y-2 p-2">
                <div className="h-4 w-1/3 bg-neutral-200 rounded-full" />
                <div className="h-6 w-3/4 bg-neutral-200 rounded" />
                <div className="h-12 bg-neutral-100 rounded" />
                <div className="h-10 bg-neutral-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="liquid-glass-card rounded-3xl p-12 text-center max-w-lg mx-auto">
          <p className="text-sm font-bold text-black mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => fetchTours(activeRegion)}
            className="inline-flex items-center gap-2 rounded-full border border-black hover:bg-black hover:text-white text-xs font-bold uppercase px-6 py-2.5"
          >
            <RefreshCcw className="h-4 w-4 text-current" />
            <span>{lang === 'en' ? 'Reload Voyages' : 'Tải Lại Hành Trình'}</span>
          </Button>
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="liquid-glass-card rounded-3xl p-16 text-center max-w-xl mx-auto">
          <Compass className="mx-auto h-12 w-12 text-black/60 mb-4" />
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            {lang === 'en' ? 'No Open Voyages in this Region' : 'Chưa có hành trình mở bán'}
          </h2>
          <p className="mt-2 text-xs font-medium text-neutral-600 max-w-md mx-auto leading-relaxed">
            {lang === 'en'
              ? hasManualFilters
                ? 'No tours match the current filters. Try widening your search.'
                : 'There are currently no tours on sale in this region. Please select another region.'
              : hasManualFilters
                ? 'Không có tour khớp bộ lọc hiện tại. Hãy thử nới điều kiện tìm kiếm.'
                : 'Hiện chưa có tour mở bán tại khu vực này. Vui lòng chọn khu vực khác.'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              handleRegionChange('');
              clearFilters();
            }}
            className="mt-6 text-xs font-bold rounded-full border border-black hover:bg-black hover:text-white uppercase px-6 py-2.5"
          >
            {lang === 'en' ? 'View All Masterpieces' : 'Xem Toàn Bộ Tuyệt Tác'}
          </Button>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((rawTour, index) => {
            const tour = getLocalizedTour(rawTour, lang);
            const price = rawTour.fromPrice ?? null;
            const luxuryTag = getTourLuxuryTag(tour, lang);
            const heroImage = getTourImage(tour);

            return (
              <Link
                key={tour.id}
                href={`/tours/${tour.id}`}
                className="group relative flex flex-col rounded-[26px] overflow-hidden liquid-glass-card hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14)] transition-all duration-500"
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                {/* Hero Photograph Container with Apple-like Zoom & Depth */}
                <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={heroImage}
                    alt={tour.title}
                    fill
                    unoptimized={heroImage.startsWith('http')}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    priority={index < 3}
                  />

                  {/* Cinematic Ambient Dark Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                  {/* Top-Left: Luxury Curated Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <LiquidGlassBadge
                      variant="luxury"
                      icon={<Sparkles className="h-3 w-3 text-amber-300" />}
                    >
                      {luxuryTag}
                    </LiquidGlassBadge>
                  </div>

                  {/* Top-Right: Duration Liquid Glass Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <LiquidGlassBadge
                      variant="duration"
                      icon={<Calendar className="h-3 w-3 text-white" />}
                    >
                      {tour.durationDays === 1
                        ? lang === 'en'
                          ? 'DAY TRIP'
                          : 'TRONG NGÀY'
                        : `${tour.durationDays}${lang === 'en' ? 'D' : 'N'}${tour.durationDays - 1}${lang === 'en' ? 'N' : 'Đ'}`}
                    </LiquidGlassBadge>
                  </div>

                  {/* Bottom-Left: Location Pin Label */}
                  <div className="absolute bottom-3.5 left-4 z-10">
                    <LiquidGlassBadge
                      variant="destination"
                      icon={<MapPin className="h-3.5 w-3.5 text-amber-300 drop-shadow-md" />}
                    >
                      {tour.destination}
                    </LiquidGlassBadge>
                  </div>

                  {/* Bottom-Right: 5-Star Rating Pill */}
                  <div className="absolute bottom-3.5 right-4 z-10">
                    <LiquidGlassBadge
                      variant="rating"
                      icon={<Star className="h-3 w-3 fill-amber-300 text-amber-300" />}
                    >
                      {rawTour.ratingCount && rawTour.ratingAverage !== null
                        ? `${rawTour.ratingAverage?.toFixed(1)} · ${rawTour.ratingCount}`
                        : t('card_badge_luxury')}
                    </LiquidGlassBadge>
                  </div>
                </div>

                {/* Card Editorial Content Body */}
                <div className="flex flex-col flex-1 p-6 justify-between bg-white/95">
                  <div>
                    {aiRecommendedIds.includes(tour.id) && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-800 ring-1 ring-amber-200">
                        <Sparkles className="h-3 w-3" />
                        {lang === 'en' ? 'AI pick' : 'AI đề xuất'}
                      </div>
                    )}
                    <h2 className="text-[16px] font-black text-black leading-snug line-clamp-2 group-hover:text-amber-900 transition-colors duration-300 tracking-tight">
                      {tour.title}
                    </h2>

                    <p className="mt-3 text-xs leading-relaxed text-neutral-600 line-clamp-3 font-normal">
                      {tour.description}
                    </p>
                  </div>

                  {/* Bottom Price & Apple CTA Action */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-600 block tracking-wider">
                        {t('card_price_from')}
                      </span>
                      <span className="text-sm font-black text-black tracking-tight">
                        {price !== null
                          ? formatVND(price)
                          : lang === 'en'
                            ? 'See live schedules'
                            : 'Xem lịch & giá thật'}
                        {price !== null && (
                          <span className="text-[10px] font-medium text-neutral-600 ml-1">
                            {t('card_per_guest')}
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[11px] font-black text-white group-hover:bg-neutral-800 transition-all duration-300 group-hover:gap-2.5 shadow-sm">
                      <span>{t('card_view_action')}</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 text-amber-300" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Secondary Background Giant Parallax Typography 2 */}
      <div className="relative pointer-events-none -z-10 pt-4">
        <GiantScrollTypography
          text="SANCTUARY RETREAT"
          direction="right"
          speed={0.85}
          outline={false}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const { t, lang } = useLanguage();

  return (
    <PageShell
      badge={t('tours_header_badge')}
      title={t('tours_header_title')}
      description={t('tours_header_desc')}
    >
      <Suspense
        fallback={
          <div className="p-16 text-center text-xs font-black text-black uppercase tracking-widest">
            {lang === 'en' ? 'Loading curated collection...' : 'Đang tải bộ sưu tập tinh hoa...'}
          </div>
        }
      >
        <ToursListContent />
      </Suspense>
    </PageShell>
  );
}
