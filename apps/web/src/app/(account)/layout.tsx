'use client';

import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/components/require-auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Let travelers review a checkout before authentication. Creating the booking
  // still requires an authenticated customer on the API.
  if (pathname.startsWith('/checkout/')) {
    return <>{children}</>;
  }

  return <RequireAuth>{children}</RequireAuth>;
}
