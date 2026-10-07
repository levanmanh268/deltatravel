# Delta Travel: AI First Tour Booking Platform

Website quảng bá và đặt tour du lịch nội địa Việt Nam, triển khai theo kiến trúc monorepo TypeScript.

## AI First

DELTA TRAVEL dùng AI như lớp điều phối chính trên homepage, catalog tour, chi tiết tour, checkout, booking và admin operations. Global AI Command Center hiểu route hiện tại, còn Action Agent có thể lập kế hoạch và tạo booking/payment sau explicit approval checkpoint. Manual UI vẫn được giữ nguyên để người dùng luôn có quyền kiểm soát.

Xem `docs/AI_FIRST_ARCHITECTURE.md` để biết kiến trúc, grounding và acceptance gate.

## Trạng thái hiện tại

Bản phát hành được kiểm chứng lại ngày 07/10/2026 đã có frontend, backend, PostgreSQL, Redis, DELTA AI, xác thực, quản trị, booking, traveler details, thời lượng riêng theo lịch khởi hành, ngày về dự kiến, feedback và đánh giá sao xác thực, thanh toán CASH, email reset password và avatar storage. Web và API đã qua CI đầy đủ, production deploy và live acceptance gồm browser, accessibility, security và AI first.

Các cổng VNPay, MoMo và ZaloPay đã có adapter, xác minh callback, idempotency và capability reporting. Chúng chỉ được bật khi server có merchant credentials thật. Khi chưa cấu hình, API trả trạng thái unavailable thay vì giả lập thanh toán thành công.

## Kiến trúc

```text
apps/web        Next.js 15 App Router
apps/api        NestJS + Prisma
packages/shared Zod schemas, DTO, business rules
PostgreSQL      dữ liệu giao dịch
Redis           queue, cache, delayed jobs
Groq/Gemini     AI provider server side
Supabase        avatar storage
Resend          email reset password
```

## Luồng người dùng chính

Khách có thể duyệt tour, xem lịch khởi hành và giá thật từ API, đăng ký hoặc đăng nhập, tạo booking, thanh toán CASH và theo dõi đơn. AI Agent có thể hiểu yêu cầu, tìm lịch phù hợp, giữ nguyên ràng buộc người dùng, dừng ở checkpoint yêu cầu phê duyệt rõ ràng rồi mới tạo booking và payment.

Admin và Operations có các màn hình quản lý tour, lịch trình, hình ảnh, lịch khởi hành, booking, payment, feedback và trạng thái tích hợp. Audit log và các thao tác phá hủy nhạy cảm vẫn chỉ dành cho ADMIN. Secret của AI, email, storage và payment gateway chỉ tồn tại phía server.

## Chạy local

Yêu cầu Node.js 22 LTS, npm, Docker Desktop.

```bash
npm ci
npm run setup
docker compose up -d --wait
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Web local: http://localhost:3000

API local: http://localhost:4000/api/v1

Health: http://localhost:4000/api/v1/health/ready

## Quality gates

```bash
npm run format:check
npm run typecheck
npm run docs:generate
npm test
npm run build
npm run test:integration
npm audit --omit=dev --audit-level=high
npm run verify:live
```

CI dùng PostgreSQL 16 và Redis native. Không dùng DB production cho test.

## Production endpoints hiện dùng

Web staging/public verification: https://delta-travel-web.onrender.com

API: https://delta-travel-api.onrender.com/api/v1

Web development source of truth: repository `levanmanh268/deltatravel`, branch `main`.

Web production branch: `manh/integrate-production-api`.

Production API source: repository `levanmanh268/tour-booking`, branch `manh/backend-ai-stage1`.

## Thanh toán

CASH đang available và đã được live smoke verification.

VNPay cần `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`.

MoMo cần `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`.

ZaloPay cần `ZALOPAY_APP_ID`, `ZALOPAY_KEY1`, `ZALOPAY_KEY2`.

Không commit credential vào Git. Sau khi có sandbox credentials, chạy toàn bộ callback matrix trước khi nhận tiền thật.

## Kiểm chứng và giới hạn

Xem `docs/VERIFICATION.md` để biết bằng chứng đã chạy, `docs/PRODUCTION_READINESS.md` để biết gate đã đạt, `docs/TEST_PLAN.md` để xem ma trận nghiệm thu, `docs/REQUIREMENTS_TRACEABILITY.md` để truy vết yêu cầu và `docs/DEMO_RUNBOOK.md` để chuẩn bị bảo vệ.

Tài liệu dự án hiện có chỉ xác nhận phạm vi SRS đã được trích trong quá trình phát triển. Chưa có toàn văn SRS hoặc rubric chính thức trong Project để đối chiếu thêm, vì vậy các yêu cầu ngoài phạm vi nguồn phải được giảng viên xác nhận trước khi coi là bắt buộc.

## Verification bổ sung

`npm run verify:live`, `npm run verify:browser`, `npm run verify:a11y`, `npm run verify:security` và `npm run verify:ai-first-live` dùng để kiểm tra deployment public. Xem `docs/FINAL_RELEASE_ACCEPTANCE.md` để biết commit và workflow evidence gần nhất.
