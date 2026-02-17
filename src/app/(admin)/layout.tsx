// src/app/(admin)/layout.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { getSidebarInitialData } from '@/features/sidebar/services/sidebar.server';
import { mainLinks } from '@/constants/mainlinks';
import AdminShell from '@/app/(admin)/AdminShell.client';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/** IP ile korunan sidebar rotaları */
const IP_RESTRICTED_HREFS = new Set(['/products', '/products_analytics']);

const ALLOWED_IPS = new Set(
  (process.env.ALLOWED_IPS ?? '').split(',').map(ip => ip.trim()).filter(Boolean),
);

function getClientIp(h: Headers): string | null {
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    null
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialData = await getSidebarInitialData();
  if (!initialData.userId) redirect('/login');

  let visibleLinks = mainLinks;

  if (process.env.NODE_ENV === 'production' && ALLOWED_IPS.size > 0) {
    const h = await headers();
    const clientIp = getClientIp(h);
    const isCompanyIp = clientIp !== null && ALLOWED_IPS.has(clientIp);

    if (!isCompanyIp) {
      visibleLinks = mainLinks.filter(link => !IP_RESTRICTED_HREFS.has(link.href ?? ''));
    }
  }

  return (
    <AdminShell initialData={initialData} mainLinks={visibleLinks}>
      {children}
    </AdminShell>
  );
}
