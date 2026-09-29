'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Images, X } from 'lucide-react';
import type { TourGalleryImage } from '@/lib/tour-assets';

export function TourPhotoGallery({
  images,
  lang,
}: {
  images: TourGalleryImage[];
  lang: 'vi' | 'en';
}) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [active]);

  if (!images.length) return null;

  return (
    <section aria-labelledby="tour-gallery-title" className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
            <Images className="h-4 w-4" />
            {lang === 'en' ? 'Destination gallery' : 'Thư viện điểm đến'}
          </p>
          <h2 id="tour-gallery-title" className="mt-1 text-xl font-black text-black">
            {lang === 'en' ? 'See more before you go' : 'Xem nhiều góc hơn trước khi đi'}
          </h2>
        </div>
        <span className="rounded-full border border-black px-3 py-1 text-[10px] font-black uppercase">
          {images.length} {lang === 'en' ? 'photos' : 'ảnh'}
        </span>
      </div>

      <div className="grid min-h-[360px] grid-cols-2 gap-2 overflow-hidden rounded-[26px] bg-neutral-100 sm:h-[420px] sm:grid-cols-4 sm:grid-rows-2">
        {images.slice(0, 5).map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActive(index)}
            className={
              index === 0
                ? 'group relative col-span-2 row-span-2 min-h-[240px] overflow-hidden bg-neutral-200'
                : 'group relative min-h-[160px] overflow-hidden bg-neutral-200'
            }
            aria-label={(lang === 'en' ? 'Open photo ' : 'Mở ảnh ') + (index + 1)}
          >
            <Image
              src={image.src}
              alt={lang === 'en' ? image.altEn : image.altVi}
              fill
              sizes={
                index === 0 ? '(max-width: 640px) 100vw, 60vw' : '(max-width: 640px) 50vw, 25vw'
              }
              unoptimized={image.src.startsWith('http')}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {images.some((image) => image.sourceUrl) && (
        <p className="mt-2 text-[10px] leading-4 text-neutral-500">
          {lang === 'en' ? 'Supplementary imagery:' : 'Ảnh bổ sung:'}{' '}
          {images
            .filter((image) => image.sourceUrl)
            .map((image, index, sourced) => (
              <span key={image.sourceUrl}>
                <a
                  href={image.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-neutral-300 underline-offset-2 hover:text-black"
                >
                  {image.credit || 'Wikimedia Commons'}
                </a>
                {index < sourced.length - 1 ? ', ' : ''}
              </span>
            ))}
        </p>
      )}

      {active !== null && images[active] && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'en' ? 'Destination photo' : 'Ảnh điểm đến'}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/30 p-3 text-white backdrop-blur"
            aria-label={lang === 'en' ? 'Close photo' : 'Đóng ảnh'}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-full max-h-[82vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[active].src}
              alt={lang === 'en' ? images[active].altEn : images[active].altVi}
              fill
              unoptimized={images[active].src.startsWith('http')}
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
