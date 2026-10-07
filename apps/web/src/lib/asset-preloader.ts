/**
 * Progressive image preloading for the cinematic homepage.
 *
 * The first screen must become usable quickly, so only a small representative
 * set of frames and hero images is treated as critical. The remaining sequence
 * is warmed in the background after the page is interactive.
 */

export const TOTAL_FRAMES = 150;
const CRITICAL_FRAME_INDICES = [1, 2, 3, 8, 15, 30, 60, 90, 120, 150];

export function getFramePath(idx: number): string {
  const pad = idx.toString().padStart(3, '0');
  return `/frames/ezgif-frame-${pad}.webp`;
}

export const frameCache = new Map<number, HTMLImageElement>();
export const imageCache = new Map<string, HTMLImageElement>();

export const CRITICAL_TOUR_IMAGES = [
  '/favicon_logo_delta.png',
  '/tour-ha-long.jpg',
  '/tour-da-nang.jpg',
  '/tour-phu-quoc.jpg',
];

function connectionIsConstrained() {
  if (typeof navigator === 'undefined') return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return Boolean(
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g',
  );
}

export function preloadSingleImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const cached = imageCache.get(src);
    if (cached?.complete) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    const finish = () => {
      imageCache.set(src, img);
      if (typeof img.decode === 'function') {
        img
          .decode()
          .catch(() => {})
          .finally(() => resolve(img));
      } else {
        resolve(img);
      }
    };

    if (img.complete) {
      finish();
      return;
    }
    img.onload = finish;
    img.onerror = () => {
      imageCache.set(src, img);
      resolve(img);
    };
  });
}

export function preloadFrame(frameIdx: number): Promise<HTMLImageElement> {
  const cached = frameCache.get(frameIdx);
  if (cached) return Promise.resolve(cached);

  return preloadSingleImage(getFramePath(frameIdx)).then((img) => {
    frameCache.set(frameIdx, img);
    return img;
  });
}

async function preloadFrames(
  frameIndices: number[],
  concurrency = 4,
  onFrameLoaded?: (current: number, total: number) => void,
): Promise<void> {
  let loadedCount = 0;
  let activeWorkers = 0;
  let nextIndex = 0;

  return new Promise((resolve) => {
    const processNext = () => {
      if (loadedCount >= frameIndices.length) {
        resolve();
        return;
      }

      while (activeWorkers < concurrency && nextIndex < frameIndices.length) {
        const frameIdx = frameIndices[nextIndex++];
        activeWorkers += 1;
        preloadFrame(frameIdx)
          .catch(() => {})
          .finally(() => {
            activeWorkers -= 1;
            loadedCount += 1;
            onFrameLoaded?.(loadedCount, frameIndices.length);
            processNext();
          });
      }
    };
    processNext();
  });
}

export async function preloadCriticalAssets(
  onProgress?: (progress: number, loadedItem: string) => void,
): Promise<void> {
  const frames = connectionIsConstrained() ? [1, 30, 90, 150] : CRITICAL_FRAME_INDICES;
  const images = connectionIsConstrained()
    ? CRITICAL_TOUR_IMAGES.slice(0, 2)
    : CRITICAL_TOUR_IMAGES;
  const total = frames.length + images.length;
  let loaded = 0;

  const notify = (name: string) => {
    loaded += 1;
    onProgress?.(Math.min(100, Math.round((loaded / total) * 100)), name);
  };

  const safety = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1800);
  });

  const work = Promise.all([
    Promise.all(images.map((src) => preloadSingleImage(src).finally(() => notify(src)))),
    preloadFrames(frames, 4, (current, count) => notify(`3D ${current}/${count}`)),
  ]).then(() => undefined);

  await Promise.race([work, safety]);
  onProgress?.(100, 'ready');
}

export function startBackgroundFramePreload(
  onFrameLoaded?: (current: number, total: number) => void,
) {
  if (typeof window === 'undefined' || connectionIsConstrained()) return;

  const run = () => {
    const remaining = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1).filter(
      (index) => !frameCache.has(index),
    );
    void preloadFrames(remaining, 4, onFrameLoaded);
  };

  const idleCallback = (
    window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    }
  ).requestIdleCallback;

  if (typeof idleCallback === 'function') {
    idleCallback(run, { timeout: 2500 });
  } else {
    globalThis.setTimeout(run, 700);
  }
}
