// src/features/auth/AccessAutoRedirect.client.tsx
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { Route } from 'next';

// DB tipleri
type Row = Database['public']['Tables']['users']['Row'];
type Role = Row['role'] | null | undefined;
type Status = Row['status'] | null | undefined;

type Props = {
  selfUserId: string | null;
  /** Server snapshot: layout'ta gönderin (getSidebarInitialData içinden) */
  initialRole?: Row['role'] | null;
  initialStatus?: Row['status'] | null;
};

/**
 * Layout için minimal politika:
 * - Banned: her yerde /unauthorized?reason=banned
 * - Inactive: /account dışındaysa /account?reason=inactive
 * - Active: dokunma (rol bazlı yetkileri sayfa guard’ları ve middleware halleder)
 */
function layoutPolicy(
  pathname: string,
  status: Status
): { shouldRedirect: boolean; to?: `/${string}` } {
  if (status === 'Banned') {
    return { shouldRedirect: true, to: '/unauthorized?reason=banned' };
  }
  if (status === 'Inactive') {
    if (!pathname.startsWith('/account')) {
      return { shouldRedirect: true, to: '/account?reason=inactive' };
    }
  }
  return { shouldRedirect: false };
}

export default function AccessAutoRedirect({
  selfUserId,
  initialRole = null,
  initialStatus = null,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Sadece public istekler ve realtime için hafif client
  const supabase = React.useMemo(
    () =>
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  // İlk snapshot ile state
  const [, setRole] = React.useState<Role>(initialRole);
  const [status, setStatus] = React.useState<Status>(initialStatus);

  // 1) İlk snapshot'a göre nazikçe yönlendir
  React.useEffect(() => {
    if (!status) return; // snapshot yoksa bekle
    const decision = layoutPolicy(pathname, status);
    if (decision.shouldRedirect && decision.to) {
      router.replace(decision.to as Route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 2) Snapshot yoksa bir defa DB'den çek
  React.useEffect(() => {
    let cancelled = false;
    if (!selfUserId) return;
    if (status) return; // snapshot zaten var

    (async () => {
      const { data } = await supabase
        .from('users')
        .select('role,status')
        .eq('id', selfUserId)
        .maybeSingle();

      if (cancelled) return;

      const nextRole = data?.role ?? null;
      const nextStatus = data?.status ?? null;

      setRole(nextRole);
      setStatus(nextStatus);

      if (nextStatus) {
        const decision = layoutPolicy(pathname, nextStatus);
        if (decision.shouldRedirect && decision.to) {
          router.replace(decision.to as Route);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selfUserId, status, pathname, supabase, router]);

  // 3) Realtime: statü değişirse uygula (rolü layout’ta zorlamıyoruz)
  React.useEffect(() => {
    if (!selfUserId) return;

    const ch = supabase
      .channel(`users-status-watch:${selfUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${selfUserId}` },
        payload => {
          const row = (payload.new ?? payload.old) as Partial<Row>;
          const nextStatus = (row?.status ?? null) as Status;

          // Değişmediyse boşuna koşma
          if (nextStatus === status) return;

          setStatus(nextStatus);

          const decision = layoutPolicy(pathname, nextStatus);
          if (decision.shouldRedirect && decision.to) {
            router.replace(decision.to as Route);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [selfUserId, status, pathname, supabase, router]);

  return null;
}
