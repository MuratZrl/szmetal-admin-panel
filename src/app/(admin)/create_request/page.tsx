// app/(admin)/create_request/page.tsx
export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import SystemsShell from '@/features/create_request/components/SystemsShell';
import { fetchSystems } from '@/features/create_request/services/systemCard.server';
import { requirePageAccess } from '@/lib/supabase/auth/guards.server';

export default async function CreateRequestPage() {
  // Sunucu tarafı güvenlik: Inactive isen /account'a, rolün yetmiyorsa /unauthorized'a
  await requirePageAccess('/create_request');

  const systems = await fetchSystems(); // SSR Supabase
  return <SystemsShell initialSystems={systems} />;
}
