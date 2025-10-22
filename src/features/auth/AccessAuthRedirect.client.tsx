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

type Decision =
  | { action: 'none' }
  | { action: 'redirect'; to: `/${string}` }
  | { action: 'logout'; to: `/${string}` };

/**
 * Layout için minimal politika:
 * - Banned: her yerde LOGOUT + /login?reason=banned
 * - Inactive: /account dışındaysa /account?reason=inactive
 * - Active: dokunma
 */
function layoutPolicy(pathname: string, status: Status): Decision {
  if (status === 'Banned') {
    return { action: 'logout', to: '/login?reason=banned' };
  }
  if (status === 'Inactive') {
    if (!pathname.startsWith('/account')) {
      return { action: 'redirect', to: '/account?reason=inactive' };
    }
  }
  return { action: 'none' };
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

  // Logout’u çift tetiklemeyi engelle
  const logoutOnceRef = React.useRef(false);
  const doLogout = React.useCallback(
    async (to: `/${string}`) => {
      if (logoutOnceRef.current) return;
      logoutOnceRef.current = true;
      try {
        await fetch(`/api/logout?redirect=${encodeURIComponent(to)}`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // server logout başarısız olsa bile kullanıcıyı kurtarmak için yine de yönlendir
      }
      router.replace(to as Route);
    },
    [router]
  );

  // 1) İlk snapshot'a göre nazikçe yönlendir / logout et
  React.useEffect(() => {
    if (!status) return; // snapshot yoksa bekle
    const decision = layoutPolicy(pathname, status);
    if (decision.action === 'logout') {
      void doLogout(decision.to);
    } else if (decision.action === 'redirect') {
      router.replace(decision.to as Route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, status]);

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
        if (decision.action === 'logout') {
          void doLogout(decision.to);
        } else if (decision.action === 'redirect') {
          router.replace(decision.to as Route);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selfUserId, status, pathname, supabase, router, doLogout]);

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

          if (nextStatus === status) return;

          setStatus(nextStatus);

          const decision = layoutPolicy(pathname, nextStatus);
          if (decision.action === 'logout') {
            void doLogout(decision.to);
          } else if (decision.action === 'redirect') {
            router.replace(decision.to as Route);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [selfUserId, status, pathname, supabase, router, doLogout]);

  return null;
}
