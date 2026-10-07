import { PageShell } from '@/components/page-shell';

export const metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản sử dụng dịch vụ DELTA TRAVEL.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell
      badge="PHÁP LÝ"
      title="Điều khoản sử dụng"
      description="Các nguyên tắc cơ bản khi tra cứu và đặt tour trên DELTA TRAVEL."
    >
      <article className="prose prose-stone max-w-none rounded-2xl border border-stone-200 bg-white p-7 text-sm leading-7">
        <h2>1. Dữ liệu tour và giá</h2>
        <p>
          Giá, lịch khởi hành và số chỗ được lấy từ hệ thống tại thời điểm tra cứu. Báo giá cuối
          cùng được kiểm tra lại khi tạo booking.
        </p>
        <h2>2. Giữ chỗ và thanh toán</h2>
        <p>
          Booking chờ thanh toán có thời hạn hiển thị trong tài khoản. Phương thức thanh toán chỉ
          hợp lệ khi hệ thống đang hiển thị là khả dụng.
        </p>
        <h2>3. Hủy, đổi ngày và hoàn tiền</h2>
        <p>
          Điều kiện cụ thể được công bố trên từng tour và được đối chiếu với trạng thái booking.
          Không suy đoán mức hoàn tiền ngoài chính sách đã công bố.
        </p>
        <h2>4. DELTA AI</h2>
        <p>
          AI hỗ trợ tìm kiếm, giải thích và lập kế hoạch. Mọi hành động tạo booking hoặc thanh toán
          có tác động thật đều cần bước xác nhận của người dùng.
        </p>
        <h2>5. Thông tin hành khách</h2>
        <p>
          Người đặt chịu trách nhiệm cung cấp thông tin chính xác. Hệ thống chỉ yêu cầu dữ liệu cần
          cho chuyến đi và không thu thập giấy tờ định danh mặc định.
        </p>
      </article>
    </PageShell>
  );
}
