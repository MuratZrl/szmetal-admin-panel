// src/app/(admin)/layout.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';

import { getSidebarInitialData } from '@/features/sidebar/services/sidebar.server';
import { mainLinks } from '@/constants/mainlinks';

import AdminShell from '@/app/(admin)/AdminShell.client';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialData = await getSidebarInitialData();
  if (!initialData.userId) redirect('/login');

  return (
    <>

      <AdminShell initialData={initialData} mainLinks={mainLinks}>
        {children}
      </AdminShell>
      
    </>
  );
}
