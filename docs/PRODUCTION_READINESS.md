# Production Readiness

Cập nhật: 07/10/2026.

## Đã đạt

- Frontend Next.js và backend NestJS build production thành công.
- PostgreSQL migrations và Redis integration chạy trong CI native.
- Auth, RBAC, refresh rotation, CSRF boundary và IDOR protection có test.
- Booking transaction, inventory locking, idempotency, timeout reclaim và cancellation có test.
- Checkout hỗ trợ thông tin từng hành khách và backend production đã có cột persistence tương ứng.
- Mỗi lịch khởi hành có `durationDays` riêng và API trả ngày về dự kiến.
- AI Agent dùng explicit approval trước action có side effect.
- Groq provider đang live, deterministic fallback vẫn có.
- Resend readiness và Supabase avatar storage readiness đang live.
- CASH payment hoạt động theo trạng thái `AWAITING_CASH`, không giả thành PAID.
- VNPay, MoMo và ZaloPay fail closed khi chưa đủ cấu hình cần thiết.
- ADMIN và OPERATIONS có quyền vận hành tour, nội dung lịch trình, ảnh, lịch khởi hành, booking, payment và feedback.
- Đánh giá sao chỉ được tạo từ khách có booking `COMPLETED`.
- Client contract cho tour chịu được additive server fields trong rolling deployment, ngăn tái diễn lỗi `unrecognized_keys`.
- Full web quality gate PASS.
- Full backend API quality gate PASS.
- Render web deploy PASS.
- Render API deploy PASS.
- Public live smoke PASS.
- Browser, accessibility, security và DELTA AI live acceptance PASS sau API deployment mới.

## Tự động hóa kiểm thử

`npm run verify:live` là smoke test read only cho public deployment.

`npm run verify:browser` kiểm tra các route công khai chính bằng browser thật.

`npm run verify:a11y` dùng Playwright và axe để kiểm tra accessibility.

`npm run verify:ai-first-live` kiểm tra trải nghiệm DELTA AI đang phục vụ ngoài production.

`VERIFY_ALLOW_MUTATIONS=true npm run verify:staging` là mutation E2E dành cho staging, có thể kiểm tra auth, booking, payment CASH, persistence và cleanup khi có credential test.

## Release evidence gần nhất

- Web source CI: `37568316476` PASS.
- Live acceptance sau API deploy: `37568316503`, attempt 2, PASS toàn bộ.
- Backend API CI: `37569441758` PASS.
- Web release commit: `ffd2f50d996541558d053a5796741784b6688564`.
- API live commit: `e9c5faee5668cbd9525cd5f0253c4a21a5119c89`.
- API production migration `202610070900_booking_travelers`: applied successfully.

## Còn phụ thuộc bên ngoài

### Merchant sandbox và production merchant

Adapter và callback validation đã có trong code. Merchant credential, sandbox account và certification do nhà cung cấp cấp nên không thể tự sinh. Chỉ bật phương thức nào backend báo thật sự available.

### SRS và rubric đầy đủ

Project hiện chưa chứa toàn văn SRS hoặc rubric chính thức. Vì vậy chỉ có thể đối chiếu các yêu cầu đã được cung cấp trong quá trình phát triển.

### Production operations

Backup restore drill, penetration test độc lập và merchant production certification là hoạt động vận hành bên ngoài codebase.

## Definition of Done kỹ thuật

Release đạt kỹ thuật khi CI xanh, deploy xanh, live smoke xanh, browser và accessibility xanh, không có secret trong Git, production dependency audit không có mức high trở lên, payment unavailable được báo trung thực và mọi action tạo booking hoặc payment của AI đều yêu cầu người dùng xác nhận rõ ràng.
