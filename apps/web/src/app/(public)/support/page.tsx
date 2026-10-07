import Link from 'next/link';
import { Mail, Phone, ShieldCheck, Bot, MapPin } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { siteConfig } from '@/lib/site-config';

export const metadata = {
  title: 'Hỗ trợ khách hàng',
  description: 'Kênh hỗ trợ chính thức của DELTA TRAVEL cho booking, thanh toán và chuyến đi.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return (
    <PageShell
      badge="HỖ TRỢ KHÁCH HÀNG"
      title="Cần hỗ trợ về booking hoặc chuyến đi?"
      description="Chỉ sử dụng các kênh được công bố trên trang này hoặc trong tài khoản. DELTA TRAVEL không yêu cầu chuyển tiền qua tài khoản cá nhân không được hiển thị trong hệ thống."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">Kênh hỗ trợ chính thức</h2>
          <div className="mt-5 space-y-4 text-sm text-stone-700">
            {siteConfig.supportPhone ? (
              <a
                className="flex items-center gap-3 rounded-xl bg-stone-50 p-4 hover:bg-stone-100"
                href={`tel:${siteConfig.supportPhone}`}
              >
                <Phone className="h-5 w-5" />
                <span>
                  <strong>Điện thoại:</strong> {siteConfig.supportPhone}
                </span>
              </a>
            ) : null}
            {siteConfig.supportEmail ? (
              <a
                className="flex items-center gap-3 rounded-xl bg-stone-50 p-4 hover:bg-stone-100"
                href={`mailto:${siteConfig.supportEmail}`}
              >
                <Mail className="h-5 w-5" />
                <span>
                  <strong>Email:</strong> {siteConfig.supportEmail}
                </span>
              </a>
            ) : null}
            {!siteConfig.supportPhone && !siteConfig.supportEmail ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
                Kênh điện thoại và email chưa được quản trị cấu hình. Trong thời gian này, hãy dùng
                khu vực tài khoản và DELTA AI để tra cứu trạng thái. Website sẽ không tự bịa hotline
                hoặc địa chỉ hỗ trợ.
              </div>
            ) : null}
            <Link
              href="/assistant"
              className="flex items-center gap-3 rounded-xl bg-black p-4 font-bold text-white"
            >
              <Bot className="h-5 w-5" />
              Mở DELTA AI
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">Đơn vị vận hành</h2>
          <div className="mt-5 space-y-4 text-sm text-stone-700">
            {siteConfig.operatorName ? (
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5" />
                <span>
                  <strong>{siteConfig.operatorName}</strong>
                </span>
              </div>
            ) : null}
            {siteConfig.operatorAddress ? (
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5" />
                <span>{siteConfig.operatorAddress}</span>
              </div>
            ) : null}
            {!siteConfig.operatorName || !siteConfig.operatorAddress ? (
              <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed">
                Thông tin pháp nhân hoặc đơn vị vận hành chưa được cấu hình đầy đủ. Trước khi nhận
                thanh toán thương mại thật, quản trị phải công bố danh tính đơn vị và địa chỉ hợp lệ
                tại đây.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
        <Link href="/terms" className="rounded-full border border-stone-300 px-4 py-2">
          Điều khoản sử dụng
        </Link>
        <Link href="/privacy" className="rounded-full border border-stone-300 px-4 py-2">
          Chính sách bảo mật
        </Link>
        <Link href="/payment-policy" className="rounded-full border border-stone-300 px-4 py-2">
          Thanh toán và hoàn tiền
        </Link>
      </div>
    </PageShell>
  );
}
