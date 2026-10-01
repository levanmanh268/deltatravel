import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { TourMediaUploadRequestSchema } from '@tour/shared';
import { CacheService } from '../cache/cache.module';
import { PrismaService } from '../database/prisma.service';
import { fail } from '../common/errors';

type PendingTourMedia = {
  actorId: string;
  tourId: string;
  path: string;
  publicUrl: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  slot: 'COVER' | 'GALLERY' | 'ITINERARY';
  day: number | null;
};

@Injectable()
export class TourMediaStorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly db: PrismaService,
  ) {}

  private settings() {
    const url = this.config.get<string>('SUPABASE_URL');
    const key =
      this.config.get<string>('SUPABASE_SECRET_KEY') ||
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const bucket =
      this.config.get<string>('SUPABASE_TOUR_BUCKET') ||
      this.config.get<string>('SUPABASE_AVATAR_BUCKET') ||
      'avatars';
    if (!url || !key) {
      fail(503, 'TOUR_MEDIA_STORAGE_NOT_CONFIGURED', 'Kho ảnh tour chưa được cấu hình trên server');
    }
    return { base: url.replace(/\/$/, '') + '/storage/v1', key, bucket };
  }

  private authHeaders(key: string) {
    return {
      apikey: key,
      ...(key.startsWith('sb_secret_') ? {} : { authorization: 'Bearer ' + key }),
      'content-type': 'application/json',
    };
  }

  private encodePath(path: string) {
    return path
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  private publicUrl(base: string, bucket: string, path: string) {
    return base + '/object/public/' + encodeURIComponent(bucket) + '/' + this.encodePath(path);
  }

  async createUploadTicket(
    actorId: string,
    tourId: string,
    input: z.infer<typeof TourMediaUploadRequestSchema>,
  ) {
    await this.db.tour.findFirstOrThrow({
      where: { id: tourId, deletedAt: null, countryCode: 'VN' },
      select: { id: true },
    });
    const { base, key, bucket } = this.settings();
    const extension = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }[input.contentType];
    const uploadId = randomUUID();
    const suffix = input.slot === 'ITINERARY' ? '-day-' + input.day : '';
    const path =
      'tour-media/' +
      tourId +
      '/' +
      input.slot.toLowerCase() +
      suffix +
      '-' +
      uploadId +
      '.' +
      extension;
    const endpoint =
      base + '/object/upload/sign/' + encodeURIComponent(bucket) + '/' + this.encodePath(path);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...this.authHeaders(key), 'x-upsert': 'false' },
        body: '{}',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      fail(503, 'TOUR_MEDIA_STORAGE_UNAVAILABLE', 'Không kết nối được kho ảnh tour');
    }
    const payload = (await response!.json().catch(() => ({}))) as {
      url?: string;
      message?: string;
      error?: string;
    };
    if (!response!.ok || !payload.url) {
      fail(
        503,
        'TOUR_MEDIA_STORAGE_UNAVAILABLE',
        payload.message || payload.error || 'Không tạo được signed upload URL cho ảnh tour',
      );
    }
    const signedUrl = payload.url.startsWith('http')
      ? payload.url
      : base + (payload.url.startsWith('/') ? payload.url : '/' + payload.url);
    const token = new URL(signedUrl).searchParams.get('token');
    if (!token) {
      fail(503, 'TOUR_MEDIA_STORAGE_INVALID_RESPONSE', 'Storage không trả upload token');
    }
    const publicUrl = this.publicUrl(base, bucket, path);
    const record: PendingTourMedia = {
      actorId,
      tourId,
      path,
      publicUrl,
      contentType: input.contentType,
      slot: input.slot,
      day: input.day ?? null,
    };
    await this.cache.writeRequired('tour-media:upload:' + uploadId, record, 7200);
    return {
      uploadId,
      path,
      signedUrl,
      token,
      publicUrl,
      expiresIn: 7200 as const,
      slot: input.slot,
      day: input.day ?? null,
    };
  }

  async claimUpload(actorId: string, tourId: string, uploadId: string) {
    const { base, key, bucket } = this.settings();
    const cacheKey = 'tour-media:upload:' + uploadId;
    const record = await this.cache.readRequired<PendingTourMedia>(cacheKey);
    if (!record || record.actorId !== actorId || record.tourId !== tourId) {
      fail(404, 'TOUR_MEDIA_UPLOAD_NOT_FOUND', 'Phiên tải ảnh tour không tồn tại hoặc đã hết hạn');
    }
    await this.db.tour.findFirstOrThrow({
      where: { id: tourId, deletedAt: null, countryCode: 'VN' },
      select: { id: true },
    });
    const infoUrl =
      base + '/object/info/' + encodeURIComponent(bucket) + '/' + this.encodePath(record.path);
    let response: Response;
    try {
      response = await fetch(infoUrl, {
        headers: this.authHeaders(key),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      fail(503, 'TOUR_MEDIA_STORAGE_UNAVAILABLE', 'Không xác minh được ảnh tour đã tải lên');
    }
    if (!response!.ok) {
      fail(409, 'TOUR_MEDIA_NOT_UPLOADED', 'Chưa tìm thấy ảnh tour đã tải lên Storage');
    }
    await this.cache.redis.del(cacheKey);
    return { url: record.publicUrl, slot: record.slot, day: record.day };
  }
}
