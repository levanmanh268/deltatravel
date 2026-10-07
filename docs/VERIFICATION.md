# Báo cáo kiểm chứng

Cập nhật: 07/10/2026.

## Bằng chứng đã chạy

| Hạng mục | Kết quả | Bằng chứng gần nhất |
| --- | --- | --- |
| npm ci | PASS | Web CI 37568316476, API CI 37569441758 |
| Prisma generate + migrate | PASS | PostgreSQL native trong CI |
| format:check | PASS | Web và API |
| TypeScript strict | PASS | shared, API, web |
| generated API contract | PASS | Web CI |
| client contract compatibility | PASS | Regression chống `unrecognized_keys` |
| unit tests | PASS | Web và backend business rules |
| production build | PASS | NestJS và Next.js |
| integration tests | PASS | PostgreSQL 16 và Redis |
| npm audit production | PASS | Không advisory high trở lên trong release gate |
| Render web deploy | PASS | `ffd2f50d996541558d053a5796741784b6688564` |
| Render API deploy | PASS | `e9c5faee5668cbd9525cd5f0253c4a21a5119c89` |
| API production migration | PASS | `202610070900_booking_travelers` |
| public live smoke | PASS | Live acceptance 37568316503 attempt 2 |
| browser smoke | PASS | Chromium và Firefox |
| accessibility | PASS | axe live acceptance |
| security smoke | PASS | live security job |
| DELTA AI live | PASS | AI first live job |
| API readiness | PASS | PostgreSQL + Redis reachable |
| AI provider | PASS | GROQ configured, fallback available |
| mail integration | PASS readiness | RESEND configured |
| avatar integration | PASS readiness | Supabase storage configured |
| payment capability | PASS | CASH available, gateway availability do backend báo thật |

## Kiểm chứng cho yêu cầu mới

Lượt 07/10/2026 đã có regression và live evidence cho các điểm sau:

1. Tour response chịu được trường mới do API bổ sung, không còn crash client vì `unrecognized_keys`.
2. Catalog không còn gắn cứng con số vào “Tất Cả”.
3. Card tour hiển thị thời gian dự kiến.
4. Mỗi lịch khởi hành có thời lượng riêng.
5. API tính `estimatedReturnAt` từ ngày khởi hành và thời lượng.
6. Trang chi tiết tour cho khách nhập ngày đi dự kiến và tính ngày về.
7. Booking detail hiển thị thời lượng cùng ngày về dự kiến.
8. Checkout thu họ tên từng hành khách và có trường ngày sinh, yêu cầu đặc biệt tùy chọn.
9. Backend production lưu traveler details sau migration mới.
10. ADMIN và OPERATIONS đọc được dashboard feedback.
11. Chỉ ADMIN được gỡ feedback, thao tác được audit.
12. Khách chỉ được tạo đánh giá xác thực sau khi booking ở trạng thái `COMPLETED`.

## Live acceptance gần nhất

Workflow `37568316503`, attempt 2, đã được chạy lại sau khi API release mới ở trạng thái live. Tất cả job đều PASS:

- exact deploy commit
- live smoke
- security
- browser
- accessibility
- AI first live

## Giới hạn của bằng chứng

CI và live acceptance chứng minh build, type safety, migrations, endpoint readiness, browser flow, accessibility, security smoke và contract compatibility trong phạm vi tự động hóa hiện có.

Chúng không thay thế merchant certification, penetration test độc lập, backup restore drill hoặc rubric chính thức của giảng viên.
