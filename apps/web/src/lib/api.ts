'use client';

import { z } from 'zod';
import {
  EnvelopeSchema,
  ErrorSchema,
  AuthResultSchema,
  UserSchema,
  TourSchema,
  ScheduleSchema,
  BookingSchema,
  PaymentSchema,
  PaymentProviderStatusSchema,
  IntegrationStatusSchema,
  PageSchema,
  QuoteResultSchema,
  AssistantResultSchema,
  RegisterSchema,
  LoginSchema,
  CreateBookingSchema,
  QuoteSchema,
  CreatePaymentSchema,
  CancelSchema,
  AssistantRequestSchema,
  AckSchema,
  SummarySchema,
  CreateTourSchema,
  UpdateTourSchema,
  CreateScheduleSchema,
  UpdateScheduleSchema,
  TransitionSchema,
  RefundRecordSchema,
  CashReceiptSchema,
  AuditSchema,
  AvatarUploadRequestSchema,
  AvatarUploadTicketSchema,
  AvatarCompleteSchema,
  AssistantProviderStatusSchema,
  AgentPlanSchema,
  AgentPlanRequestSchema,
  AgentPlanUpdateSchema,
  AgentApprovalSchema,
  AgentDeclineSchema,
  CreateTourReviewSchema,
  TourReviewSchema,
  TourReviewListSchema,
  AdminTourReviewSchema,
  TourMediaUploadRequestSchema,
  TourMediaUploadTicketSchema,
  TourMediaCompleteSchema,
  TourMediaCompleteResultSchema,
} from '@tour/shared';
import { inferTourRegion } from './fallback-data';

const BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'https://delta-travel-api.onrender.com/api/v1'
).replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 65000;

const TourResponseSchema = TourSchema.passthrough();
const ScheduleResponseSchema = ScheduleSchema.passthrough();

let accessToken: string | null = null;
let refreshFlight: Promise<z.infer<typeof AuthResultSchema>> | null = null;
const listeners = new Set<() => void>();

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function onSessionExpired(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
  }
}

type Options = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retryAuth?: boolean;
  anonymous?: boolean;
};

export async function api<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  options: Options = {},
): Promise<z.infer<T>> {
  const timeoutCtrl = new AbortController();
  const timeoutId = setTimeout(() => timeoutCtrl.abort(), REQUEST_TIMEOUT_MS);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutCtrl.signal])
    : timeoutCtrl.signal;

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method: options.method || 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal,
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        'X-CSRF-Protection': '1',
        ...(!options.anonymous && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (options.signal?.aborted) throw error;
      throw new ApiError(
        0,
        'REQUEST_TIMEOUT',
        'Máy chủ đang khởi động hoặc phản hồi quá chậm. Vui lòng thử lại.',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && options.retryAuth !== false && !path.startsWith('/auth/')) {
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      listeners.forEach((fn) => fn());
      throw new ApiError(401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn.');
    }
    return api(path, schema, { ...options, retryAuth: false });
  }

  const raw = await response.text();
  let body: unknown = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      throw new ApiError(
        response.ok ? 502 : response.status,
        'INVALID_JSON_RESPONSE',
        'Máy chủ đang trả phản hồi không hợp lệ. Vui lòng thử lại.',
        response.headers.get('x-request-id') || undefined,
      );
    }
  }

  if (!response.ok) {
    const parsed = ErrorSchema.safeParse(body);
    if (parsed.success) {
      throw new ApiError(
        response.status,
        parsed.data.error.code,
        parsed.data.error.message,
        parsed.data.meta.requestId,
      );
    }
    throw new ApiError(
      response.status,
      'INVALID_ERROR_RESPONSE',
      'Phản hồi lỗi không đúng API Contract.',
    );
  }

  const envelopeResult = EnvelopeSchema(z.unknown()).safeParse(body);
  if (!envelopeResult.success) {
    throw new ApiError(
      502,
      'API_ENVELOPE_MISMATCH',
      'Máy chủ đang trả dữ liệu không đúng định dạng. Vui lòng tải lại trang sau ít phút.',
    );
  }

  const parsed = schema.safeParse(envelopeResult.data.data);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('API_CONTRACT_MISMATCH', path, parsed.error.flatten());
    }
    throw new ApiError(
      502,
      'API_CONTRACT_MISMATCH',
      'Website và máy chủ đang chưa đồng bộ phiên bản dữ liệu. Vui lòng tải lại trang sau ít phút.',
      envelopeResult.data.meta.requestId,
    );
  }
  return parsed.data;
}

async function publicApiWithLegacyFallback<T extends z.ZodTypeAny>(
  currentPath: string,
  legacyPath: string,
  schema: T,
): Promise<z.infer<T>> {
  const options = { retryAuth: false, anonymous: true } as const;
  try {
    return await api(currentPath, schema, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 400 || error.code !== 'VALIDATION_ERROR') {
      throw error;
    }
    return api(legacyPath, schema, options);
  }
}

export function refreshSession() {
  if (!refreshFlight) {
    refreshFlight = (async () => {
      const result = await api('/auth/refresh', AuthResultSchema, {
        method: 'POST',
        body: {},
        retryAuth: false,
        anonymous: true,
      });
      setAccessToken(result.accessToken);
      return result;
    })().finally(() => {
      refreshFlight = null;
    });
  }
  return refreshFlight;
}

export const authApi = {
  register: async (input: z.input<typeof RegisterSchema>) => {
    const result = await api('/auth/register', AuthResultSchema, {
      method: 'POST',
      body: RegisterSchema.parse(input),
      retryAuth: false,
      anonymous: true,
    });
    setAccessToken(result.accessToken);
    return result;
  },

  login: async (input: z.input<typeof LoginSchema>) => {
    const result = await api('/auth/login', AuthResultSchema, {
      method: 'POST',
      body: LoginSchema.parse(input),
      retryAuth: false,
      anonymous: true,
    });
    setAccessToken(result.accessToken);
    return result;
  },

  me: () => api('/auth/me', UserSchema),

  logout: async () => {
    try {
      return await api('/auth/logout', AckSchema, {
        method: 'POST',
        body: {},
        retryAuth: false,
        anonymous: true,
      });
    } finally {
      setAccessToken(null);
    }
  },

  requestPasswordReset: (email: string) =>
    api('/auth/forgot-password', AckSchema, {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
      retryAuth: false,
      anonymous: true,
    }),

  resetPassword: (input: { email: string; code: string; newPassword: string }) =>
    api('/auth/reset-password', AckSchema, {
      method: 'POST',
      body: {
        email: input.email.trim().toLowerCase(),
        code: input.code.trim(),
        newPassword: input.newPassword,
      },
      retryAuth: false,
      anonymous: true,
    }),

  changePassword: (input: { email?: string; oldPassword: string; newPassword: string }) =>
    api('/auth/change-password', AckSchema, {
      method: 'POST',
      body: {
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      },
    }),
};

function belongsToRegion(tour: z.infer<typeof TourSchema>, region: string) {
  return !region || inferTourRegion(tour) === region;
}

export const tourApi = {
  list: async (q = '', region = '') => {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
    });
    if (q.trim()) params.set('q', q.trim());
    const currentParams = new URLSearchParams(params);
    currentParams.set('contract', 'v2');
    const res = await publicApiWithLegacyFallback(
      `/tours?${currentParams.toString()}`,
      `/tours?${params.toString()}`,
      PageSchema(TourResponseSchema),
    );
    const items = region ? res.items.filter((tour) => belongsToRegion(tour, region)) : res.items;
    return { ...res, items, total: items.length };
  },

  get: (id: string) =>
    publicApiWithLegacyFallback(`/tours/${id}?contract=v2`, `/tours/${id}`, TourResponseSchema),

  schedules: (id: string) =>
    publicApiWithLegacyFallback(
      `/tours/${id}/schedules?page=1&pageSize=100&contract=v2`,
      `/tours/${id}/schedules?page=1&pageSize=100`,
      PageSchema(ScheduleResponseSchema),
    ),
};

export const reviewApi = {
  list: (tourId: string) =>
    api(`/tours/${tourId}/reviews`, TourReviewListSchema, {
      retryAuth: false,
      anonymous: true,
    }),

  upsert: (tourId: string, input: z.input<typeof CreateTourReviewSchema>) =>
    api(`/tours/${tourId}/reviews`, TourReviewSchema, {
      method: 'POST',
      body: CreateTourReviewSchema.parse(input),
    }),

  removeMine: (tourId: string) =>
    api(`/tours/${tourId}/reviews/mine`, AckSchema, {
      method: 'DELETE',
    }),
};

export const scheduleApi = {
  availability: async (id: string, signal?: AbortSignal) => {
    const options = { signal, retryAuth: false, anonymous: true } as const;
    try {
      return await api(
        `/schedules/${id}/availability?contract=v2`,
        ScheduleResponseSchema,
        options,
      );
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 400 ||
        error.code !== 'VALIDATION_ERROR'
      ) {
        throw error;
      }
      return api(`/schedules/${id}/availability`, ScheduleResponseSchema, options);
    }
  },
};

export const bookingApi = {
  quote: (input: z.input<typeof QuoteSchema>) =>
    api('/bookings/quote', QuoteResultSchema, {
      method: 'POST',
      body: QuoteSchema.parse(input),
      retryAuth: false,
      anonymous: true,
    }),

  create: (input: z.input<typeof CreateBookingSchema>, idempotencyKey: string) =>
    api('/bookings', BookingSchema, {
      method: 'POST',
      body: CreateBookingSchema.parse(input),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  list: () => api('/bookings?page=1&pageSize=100', PageSchema(BookingSchema)),

  get: (id: string) => api(`/bookings/${id}`, BookingSchema),

  cancel: (id: string, reason: string) =>
    api(`/bookings/${id}/cancel`, BookingSchema, {
      method: 'POST',
      body: CancelSchema.parse({ reason }),
    }),

  delete: async (_id: string) => {
    throw new ApiError(
      405,
      'BOOKING_DELETE_UNSUPPORTED',
      'Đơn đặt tour được lưu để bảo toàn lịch sử giao dịch và không thể xóa.',
    );
  },
};

export const paymentApi = {
  providers: () =>
    api('/payments/providers/status', PaymentProviderStatusSchema, {
      retryAuth: false,
      anonymous: true,
    }),

  create: (input: z.input<typeof CreatePaymentSchema>) =>
    api('/payments', PaymentSchema, {
      method: 'POST',
      body: CreatePaymentSchema.parse(input),
    }),

  get: (id: string) => api(`/payments/${id}`, PaymentSchema),

  byBooking: (bookingId: string) => api(`/payments/booking/${bookingId}`, PaymentSchema.nullable()),
};

export const systemApi = {
  integrations: () =>
    api('/health/integrations', IntegrationStatusSchema, {
      retryAuth: false,
      anonymous: true,
    }),
};

export const assistantApi = {
  chat: (input: z.input<typeof AssistantRequestSchema>) =>
    api('/assistant/chat', AssistantResultSchema, {
      method: 'POST',
      body: AssistantRequestSchema.parse(input),
      retryAuth: Boolean(accessToken),
      anonymous: !accessToken,
    }),

  providerStatus: () =>
    api('/assistant/provider-status', AssistantProviderStatusSchema, {
      retryAuth: false,
      anonymous: true,
    }),

  createPlan: (input: z.input<typeof AgentPlanRequestSchema>) =>
    api('/assistant/agent/plans', AgentPlanSchema, {
      method: 'POST',
      body: AgentPlanRequestSchema.parse(input),
    }),

  getPlan: (id: string) => api(`/assistant/agent/plans/${id}`, AgentPlanSchema),

  updatePlan: (id: string, input: z.input<typeof AgentPlanUpdateSchema>) =>
    api(`/assistant/agent/plans/${id}`, AgentPlanSchema, {
      method: 'PATCH',
      body: AgentPlanUpdateSchema.parse(input),
    }),

  approvePlan: (id: string, version: number) =>
    api(`/assistant/agent/plans/${id}/approve`, AgentPlanSchema, {
      method: 'POST',
      body: AgentApprovalSchema.parse({ approved: true, version }),
    }),

  declinePlan: (id: string, reason?: string) =>
    api(`/assistant/agent/plans/${id}/decline`, AgentPlanSchema, {
      method: 'POST',
      body: AgentDeclineSchema.parse(reason ? { reason } : {}),
    }),
};

export const profileApi = {
  me: () => api('/profile/me', UserSchema),

  createAvatarUpload: (input: z.input<typeof AvatarUploadRequestSchema>) =>
    api('/profile/avatar/upload-url', AvatarUploadTicketSchema, {
      method: 'POST',
      body: AvatarUploadRequestSchema.parse(input),
    }),

  completeAvatar: (uploadId: string) =>
    api('/profile/avatar/complete', UserSchema, {
      method: 'POST',
      body: AvatarCompleteSchema.parse({ uploadId }),
    }),

  deleteAvatar: () =>
    api('/profile/avatar', UserSchema, {
      method: 'DELETE',
    }),

  uploadAvatar: async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new ApiError(400, 'INVALID_AVATAR_TYPE', 'Ảnh đại diện phải là JPEG, PNG hoặc WebP.');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new ApiError(400, 'AVATAR_TOO_LARGE', 'Ảnh đại diện không được vượt quá 2 MB.');
    }

    const ticket = await profileApi.createAvatarUpload({
      contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      sizeBytes: file.size,
    });

    const form = new FormData();
    form.append('cacheControl', '3600');
    form.append('', file, file.name || 'avatar');

    const upload = await fetch(ticket.signedUrl, {
      method: 'PUT',
      headers: { 'x-upsert': 'false' },
      body: form,
    });
    if (!upload.ok) {
      throw new ApiError(
        upload.status,
        'AVATAR_UPLOAD_FAILED',
        'Không tải được ảnh đại diện lên Storage.',
      );
    }

    return profileApi.completeAvatar(ticket.uploadId);
  },
};

function tourPayload(input: Partial<z.infer<typeof TourSchema>>) {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    destination: input.destination,
    countryCode: input.countryCode || 'VN',
    durationDays: input.durationDays,
    imageUrl: input.imageUrl,
    galleryImages: input.galleryImages,
    itinerary: input.itinerary,
    commercial: input.commercial,
    status: input.status,
  };
}

export const adminApi = {
  summary: () => api('/admin/summary', SummarySchema),

  tours: () => api('/admin/tours?page=1&pageSize=100', PageSchema(TourResponseSchema)),

  tour: async (id: string) => {
    const page = await adminApi.tours();
    const tour = page.items.find((item) => item.id === id);
    if (!tour) throw new ApiError(404, 'TOUR_NOT_FOUND', 'Không tìm thấy tour.');
    return tour;
  },

  createTour: (input: Partial<z.infer<typeof TourSchema>>) =>
    api('/admin/tours', TourResponseSchema, {
      method: 'POST',
      body: CreateTourSchema.parse(tourPayload(input)),
    }),

  updateTour: (id: string, input: Partial<z.infer<typeof TourSchema>>) => {
    const candidate = Object.fromEntries(
      Object.entries(tourPayload(input)).filter(([, value]) => value !== undefined),
    );
    return api(`/admin/tours/${id}`, TourResponseSchema, {
      method: 'PATCH',
      body: UpdateTourSchema.parse(candidate),
    });
  },

  toggleTourStatus: async (id: string) => {
    const page = await adminApi.tours();
    const tour = page.items.find((item) => item.id === id);
    if (!tour) {
      throw new ApiError(404, 'TOUR_NOT_FOUND', 'Không tìm thấy tour.');
    }
    return adminApi.updateTour(id, {
      status: tour.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  },

  deleteTour: (id: string) =>
    api(`/admin/tours/${id}`, AckSchema, {
      method: 'DELETE',
    }),

  schedules: () => api('/admin/schedules?page=1&pageSize=100', PageSchema(ScheduleResponseSchema)),

  createSchedule: (input: z.input<typeof CreateScheduleSchema>) =>
    api('/admin/schedules', ScheduleResponseSchema, {
      method: 'POST',
      body: CreateScheduleSchema.parse(input),
    }),

  updateSchedule: (id: string, input: z.input<typeof UpdateScheduleSchema>) =>
    api(`/admin/schedules/${id}`, ScheduleResponseSchema, {
      method: 'PATCH',
      body: UpdateScheduleSchema.parse(input),
    }),

  createTourMediaUpload: (tourId: string, input: z.input<typeof TourMediaUploadRequestSchema>) =>
    api(`/admin/tours/${tourId}/media/upload-url`, TourMediaUploadTicketSchema, {
      method: 'POST',
      body: TourMediaUploadRequestSchema.parse(input),
    }),

  completeTourMediaUpload: (tourId: string, uploadId: string) =>
    api(`/admin/tours/${tourId}/media/complete`, TourMediaCompleteResultSchema, {
      method: 'POST',
      body: TourMediaCompleteSchema.parse({ uploadId }),
    }),

  uploadTourImage: async (
    tourId: string,
    file: File,
    slot: 'COVER' | 'GALLERY' | 'ITINERARY',
    day?: number,
  ) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new ApiError(400, 'INVALID_TOUR_IMAGE_TYPE', 'Ảnh tour phải là JPEG, PNG hoặc WebP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError(400, 'TOUR_IMAGE_TOO_LARGE', 'Mỗi ảnh tour không được vượt quá 5 MB.');
    }
    const ticket = await adminApi.createTourMediaUpload(tourId, {
      contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      sizeBytes: file.size,
      slot,
      day: day ?? null,
    });
    const form = new FormData();
    form.append('cacheControl', '3600');
    form.append('', file, file.name || 'tour-image');
    const upload = await fetch(ticket.signedUrl, {
      method: 'PUT',
      headers: { 'x-upsert': 'false' },
      body: form,
    });
    if (!upload.ok) {
      throw new ApiError(
        upload.status,
        'TOUR_IMAGE_UPLOAD_FAILED',
        'Không tải được ảnh tour lên Storage.',
      );
    }
    const completed = await adminApi.completeTourMediaUpload(tourId, ticket.uploadId);
    return completed.url;
  },

  bookings: () => api('/admin/bookings?page=1&pageSize=100', PageSchema(BookingSchema)),

  booking: (id: string) => api(`/admin/bookings/${id}`, BookingSchema),

  updateBookingStatus: (id: string, status: 'CONFIRMED' | 'COMPLETED') =>
    api(`/admin/bookings/${id}/status`, BookingSchema, {
      method: 'PATCH',
      body: TransitionSchema.parse({ status }),
    }),

  cancelBooking: (id: string, reason: string) =>
    api(`/admin/bookings/${id}/cancel`, BookingSchema, {
      method: 'POST',
      body: CancelSchema.parse({ reason }),
    }),

  reviews: () =>
    api('/admin/reviews?page=1&pageSize=100', PageSchema(AdminTourReviewSchema)),

  removeReview: (id: string) =>
    api(`/admin/reviews/${id}`, AckSchema, {
      method: 'DELETE',
    }),

  payments: () => api('/admin/payments?page=1&pageSize=100', PageSchema(PaymentSchema)),

  recordCashReceipt: (id: string, input: z.input<typeof CashReceiptSchema>) =>
    api(`/admin/payments/${id}/cash-receipt`, PaymentSchema, {
      method: 'POST',
      body: CashReceiptSchema.parse(input),
    }),

  recordRefund: (id: string, input: z.input<typeof RefundRecordSchema>) =>
    api(`/admin/payments/${id}/refund-record`, PaymentSchema, {
      method: 'POST',
      body: RefundRecordSchema.parse(input),
    }),

  auditLogs: () => api('/admin/audit-logs?page=1&pageSize=100', PageSchema(AuditSchema)),
};
