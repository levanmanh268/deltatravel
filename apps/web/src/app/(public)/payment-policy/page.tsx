import { PageShell } from '@/components/page-shell';

export const metadata = {
  title: 'Thanh toán và hoàn tiền',
  description: 'Nguyên tắc thanh toán, hủy và hoàn tiền trên DELTA TRAVEL.',
  alternates: { canonical: '/payment-policy' },
};

export default function PaymentPolicyPage() {
  return (
    <PageShell badge="THANH TOÁN" title="Thanh toán và hoàn tiền" description="Chỉ những phương thức đang được hệ thống xác nhận khả dụng mới được hiển thị cho khách hàng.">
      <article className="prose prose-stone max-w-none rounded-2xl border border-stone-200 bg-white p-7 text-sm leading-7">
        <h2>Phương thức thanh toán</h2>
        <p>Tiền mặt luôn được xử lý theo trạng thái chờ thu tiền. Cổng trực tuyến chỉ xuất hiện khi môi trường thanh toán thương mại đã được cấu hình và kiểm tra.</p>
        <h2>Không giả lập thanh toán thành công</h2>
        <p>Chuyển hướng trình duyệt không tự đổi booking sang đã thanh toán. Máy chủ chỉ cập nhật trạng thái sau khi xác minh thông tin từ cổng thanh toán.</p>
        <h2>Hủy và hoàn tiền</h2>
        <p>Chính sách hủy và hoàn tiền được công bố theo từng tour. Trước khi xác nhận hủy, khách hàng được nhắc đọc chính sách áp dụng cho booking của mình.</p>
        <h2>Hoàn tiền cần xử lý</h2>
        <p>Nếu giao dịch cần hoàn, hệ thống ghi nhận trạng thái để bộ phận vận hành đối soát. Không tự tuyên bố đã hoàn tiền khi chưa có bằng chứng giao dịch.</p>
      </article>
    </PageShell>
  );
}
