# AI First Architecture

Cập nhật: 29/09/2026.

Delta Travel dùng AI như một lớp điều phối xuyên suốt sản phẩm thay vì đặt chatbot ở một trang riêng. Giao diện do nhóm xây dựng trước đó vẫn được giữ lại làm manual fallback và lớp kiểm soát trực quan.

## Nguyên tắc

1. AI xuất hiện trước manual flow ở các điểm quyết định chính.
2. AI chỉ tổng hợp từ dữ liệu production có thể kiểm chứng.
3. Tour, giá, số chỗ, booking và payment state luôn do backend quyết định.
4. AI được phép đọc, phân tích, xếp hạng và lập kế hoạch theo quyền hiện tại.
5. Side effect tạo booking hoặc payment của Agent phải dừng ở explicit approval checkpoint.
6. Manual UI không bị loại bỏ. Người dùng luôn có thể tự duyệt tour, chọn lịch và thao tác theo luồng truyền thống.

## Các surface AI

| Surface         | AI-first behavior                                                         |
| --------------- | ------------------------------------------------------------------------- |
| Homepage        | Live AI Planner đứng trước catalog thủ công và handoff sang Agent         |
| Global          | Page-aware AI Command Center hiểu route đang xem                          |
| Tour catalog    | AI discovery, nguồn TOUR từ backend và đưa tour được AI đề xuất lên trước |
| Tour detail     | AI Fit Advisor tự đọc tour production và handoff schedule sang Agent      |
| Checkout        | AI pre-booking review đọc quote và availability trước khi user giữ chỗ    |
| My Bookings     | AI Trip Concierge tóm tắt các đơn theo quyền customer                     |
| Booking detail  | AI phân tích đúng booking ID, trạng thái, bước tiếp theo và policy        |
| Assistant       | Action Agent nhận context từ tour/checkout và vẫn yêu cầu phê duyệt       |
| Admin dashboard | Grounded Operations Copilot đọc live operations facts                     |
| Admin subpages  | Persistent AI Ops strip thay prompt theo route hiện tại                   |

## Grounding

Assistant classifier có deterministic fallback. Synthesis provider nhận FACTS đã lấy từ service nội bộ và system prompt cấm phát minh giá, chỗ, trạng thái booking/payment hoặc policy. FACTS được coi là dữ liệu không tin cậy về mặt chỉ dẫn, vì vậy nội dung giống prompt, lệnh hoặc yêu cầu đổi vai trò nằm trong dữ liệu không được phép ghi đè system policy.

AI Tour Discovery áp dụng constraint gate trước khi xếp hạng. Điểm đến được nêu rõ không bị tự động nới sang tour khác; số chỗ phải đủ cho cả nhóm; thời lượng, cửa sổ ngày và ngân sách được kiểm tra trước khi tour trở thành candidate. Action Agent áp dụng cùng nguyên tắc constraint-first và kiểm tra quote lại ngay trước side effect.

Customer booking facts luôn được truy vấn với user ID hiện tại. Booking ID cụ thể được phân biệt với schedule ID trước khi lookup. Trước khi gửi facts cho provider ngoài, hệ thống loại contactName, contactEmail và contactPhone; UI và backend vẫn giữ đầy đủ dữ liệu cần thiết cho nghiệp vụ nhưng mô hình chỉ nhận phần tối thiểu phục vụ câu trả lời.

Operations facts gồm summary, booking/payment/tour/schedule status counts, payment provider counts, pending refunds, low-inventory schedules, recent audit actions và integration readiness dạng capability boolean. Không có secret được đưa vào facts. Chỉ ADMIN hoặc OPERATIONS được dùng OperationsAgent.

## Handoff từ tư vấn sang hành động

Context card và Command Center không tự tạo giao dịch. Khi user muốn AI hành động, giao diện chuyển context sang Agent bằng các tham số như scheduleId, destination, adults và children.

Agent lập plan, tìm candidate, kiểm tra payment capability rồi tạo checkpoint có requiresExplicitApproval=true. Chỉ endpoint approve đúng version mới tạo booking thật và payment.

## Acceptance

CI chạy `npm run verify:ai-first` để chống regression làm mất các AI surface cốt lõi. Browser/live acceptance tiếp tục kiểm tra deployment sau khi phát hành.
