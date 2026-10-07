import { PageShell } from '@/components/page-shell';

export const metadata = {
  title: 'Chính sách bảo mật',
  description: 'Cách DELTA TRAVEL sử dụng dữ liệu tài khoản, booking và hành khách.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <PageShell badge="QUYỀN RIÊNG TƯ" title="Chính sách bảo mật" description="Thu thập tối thiểu, dùng đúng mục đích và không hiển thị dữ liệu riêng tư công khai.">
      <article className="prose prose-stone max-w-none rounded-2xl border border-stone-200 bg-white p-7 text-sm leading-7">
        <h2>Dữ liệu được sử dụng</h2>
        <p>Tài khoản, thông tin liên hệ, booking, thanh toán, tên hành khách và các yêu cầu đặc biệt do bạn chủ động cung cấp được dùng để vận hành chuyến đi.</p>
        <h2>Nguyên tắc tối thiểu hóa</h2>
        <p>CCCD hoặc giấy tờ định danh không được thu thập mặc định. Nếu một hành trình cụ thể cần giấy tờ theo quy định, bộ phận vận hành phải nêu rõ mục đích trước khi yêu cầu.</p>
        <h2>AI và quyền truy cập</h2>
        <p>DELTA AI chỉ được truy cập dữ liệu theo quyền của tài khoản hiện tại. Booking của khách hàng khác không được dùng làm ngữ cảnh trả lời.</p>
        <h2>Bảo mật phiên đăng nhập</h2>
        <p>Phiên đăng nhập, phân quyền và các thao tác nhạy cảm được kiểm tra ở máy chủ. Không dựa vào vai trò do trình duyệt tự khai báo.</p>
      </article>
    </PageShell>
  );
}
