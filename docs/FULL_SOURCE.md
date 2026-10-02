# Chỉ mục mã nguồn triển khai

Cập nhật: 02/10/2026.

File này trước đây chứa một bản chép tĩnh của toàn bộ mã nguồn. Cách đó dễ drift khỏi repository sau mỗi migration, contract change hoặc bug fix, vì vậy bản chép tĩnh đã được loại bỏ để tránh tạo hai source of truth khác nhau.

## Source of truth

- Repository: `levanmanh268/deltatravel`
- Release branch cho bản bảo vệ: `manh/integrate-production-api`
- Runtime baseline đã kiểm định end-to-end: `823b980c0ef1c46c711f4030c40b9579ecfe40b3`
- CI baseline run: `36942743594`
- Release Live Acceptance baseline run: `36942743584`

Mã nguồn phải được đọc trực tiếp từ Git tree của release branch. Không dùng một snapshot Markdown để build, deploy hoặc đối chiếu implementation.

## Các điểm vào chính

- Frontend: `apps/web`
- Backend: `apps/api`
- Shared schemas và DTO: `packages/shared`
- Prisma schema và migrations: `apps/api/prisma`
- CI và release verification: `.github/workflows`
- Verification scripts: `scripts`
- API contract được sinh tự động: `docs/API_CONTRACT.md` và `docs/openapi.json`
- Kiến trúc AI: `docs/AI_FIRST_ARCHITECTURE.md`
- Database: `docs/DATABASE_SCHEMA.md`
- Traceability: `docs/REQUIREMENTS_TRACEABILITY.md`
- Test plan: `docs/TEST_PLAN.md`
- Security: `docs/SECURITY_CHECKLIST.md`
- Release acceptance: `docs/FINAL_RELEASE_ACCEPTANCE.md`
- Demo bảo vệ: `docs/DEMO_RUNBOOK.md`

## Quy tắc bàn giao

Không commit file `.env`, secret, dependency directory hoặc build output. Dùng `npm ci`, `npm run setup`, migration và các quality gate trong README để tái tạo môi trường. Nếu cần snapshot source để nộp offline, tạo ZIP trực tiếp từ release branch tại thời điểm nộp và ghi kèm commit SHA.
