// src/features/auth/AccessAutoRedirect.client.tsx
'use client';

import * as React from 'react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import type { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/supabaseClient'; // mevcut merkezî client

type Row = Database['public']['Tables']['users']['Row'];
type Role = Row['role'] | null | undefined;
type Status = Row['status'] | null | undefined;

type Props = {
  selfUserId: string | null;
  initialRole?: Row['role'] | null;
  initialStatus?: Row['status'] | null;
};

type Decision =
  | { action: 'none' }
  | { action: 'redirect'; to: `/${string}` }
  | { action: 'logout'; to: `/${string}` };

function layoutPolicy(pathname: string, status: Status): Decision {
  if (status === 'Banned') return { action: 'logout', to: '/login?reason=banned' };
  if (status === 'Inactive' && !pathname.startsWith('/account')) {
    return { action: 'redirect', to: '/account?reason=inactive' };
  }
  return { action: 'none' };
}

export default function AccessAutoRedirect({ selfUserId, initialRole = null, initialStatus = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Snapshot state
  const [, setRole] = React.useState<Role>(initialRole);
  const [status, setStatus] = React.useState<Status>(initialStatus);

  // En güncel değerleri handler içinde kullanmak için ref’te tut
  const statusRef = React.useRef<Status>(status);
  React.useEffect(() => { statusRef.current = status; }, [status]);
  const pathRef = React.useRef<string>(pathname);
  React.useEffect(() => { pathRef.current = pathname; }, [pathname]);

  const logoutOnceRef = React.useRef(false);
  const doLogout = React.useCallback(async (to: `/${string}`) => {
    if (logoutOnceRef.current) return;
    logoutOnceRef.current = true;
    try {
      await fetch(`/api/logout?redirect=${encodeURIComponent(to)}`, { method: 'POST', credentials: 'include' });
    } catch { /* yoksay */ }
    router.replace(to as Route);
  }, [router]);

  // 1) İlk snapshot'a göre karar ver
  React.useEffect(() => {
    if (!status) return;
    const d = layoutPolicy(pathname, status);
    if (d.action === 'logout') void doLogout(d.to);
    else if (d.action === 'redirect') router.replace(d.to as Route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, status]);

  // 2) Snapshot yoksa bir defa DB’den çek
  React.useEffect(() => {
    let cancelled = false;
    if (!selfUserId || status) return;

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
        const d = layoutPolicy(pathRef.current, nextStatus);
        if (d.action === 'logout') void doLogout(d.to);
        else if (d.action === 'redirect') router.replace(d.to as Route);
      }
    })();

    return () => { cancelled = true; };
  }, [selfUserId, status, router, doLogout]);

  // 3) Realtime: tek kanal, status/path ref’ten okunur; yeniden subscribe yok
  React.useEffect(() => {
    if (!selfUserId) return;

    const ch = supabase
      .channel(`users-status-watch:${selfUserId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${selfUserId}` },
        (payload) => {
          const row = payload.new as Partial<Row> | null;
          const nextStatus = (row?.status ?? null) as Status;

          if (nextStatus === statusRef.current) return;

          setStatus(nextStatus);
          const d = layoutPolicy(pathRef.current, nextStatus);
          if (d.action === 'logout') void doLogout(d.to);
          else if (d.action === 'redirect') router.replace(d.to as Route);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [selfUserId, router, doLogout]);

  return null;
}
