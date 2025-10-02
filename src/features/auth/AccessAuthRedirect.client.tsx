// src/features/auth/AccessAutoRedirect.client.tsx
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// DB tipleri
type Row = Database['public']['Tables']['users']['Row'];
type Role = Row['role'] | null | undefined;
type Status = Row['status'] | null | undefined;

type Props = {
  selfUserId: string | null;
  initialRole?: Row['role'] | null;
  initialStatus?: Row['status'] | null;
};

function canAccess(pathname: string, role: Role, status: Status): boolean {
  if (!role) return false;
  if (status === 'Banned') return false;

  if (role === 'Admin') return true;

  if (role === 'Manager') {
    // Manager sadece dashboard’a giremez
    return !pathname.startsWith('/dashboard');
  }

  if (role === 'User') {
    if (pathname.startsWith('/account')) return true;
    if (pathname.startsWith('/orders')) return true;
    if (pathname.startsWith('/create_request')) return status !== 'Inactive';
    return false;
  }

  return false;
}

export default function AccessAutoRedirect({ selfUserId, initialRole = null, initialStatus = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = React.useMemo<SupabaseClient<Database>>(
    () => createClient<Database>(url, anon),
    [url, anon]
  );

  // Tek gerçek: rol/status
  const [role, setRole] = React.useState<Role>(initialRole);
  const [status, setStatus] = React.useState<Status>(initialStatus);

  // 1) Sunucudan gelen ilk değerlerle ani yönlendirmeyi yap (varsa)
  React.useEffect(() => {
    if (role) {
      if (!canAccess(pathname, role, status)) {
        if (status === 'Banned') router.replace('/unauthorized');
        else router.replace('/account');
      }
    }
    // sadece ilk mount + pathname değişiminde kontrol yeterli
    // role/status'ı buraya koymuyoruz; aksi halde loop olabilir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 2) Kesin durumu DB’den çek (RLS uygunsa döner)
  React.useEffect(() => {
    let canceled = false;
    if (!selfUserId) return;

    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', selfUserId)
        .maybeSingle();

      if (canceled) return;

      if (error) {
        // Sessiz geç; server guard zaten koruyor
        return;
      }

      setRole(data?.role ?? null);
      setStatus(data?.status ?? null);

      if (data?.role && !canAccess(pathname, data.role, data.status)) {
        if (data.status === 'Banned') router.replace('/unauthorized');
        else router.replace('/account');
      }
    })();

    return () => {
      canceled = true;
    };
  }, [supabase, selfUserId, pathname, router]);

  // 3) Realtime ile anlık değişimleri yakala
  React.useEffect(() => {
    if (!selfUserId) return;

    const channel = supabase
      .channel(`users-role-watch:${selfUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${selfUserId}` },
        (payload) => {
          const next = (payload.new ?? payload.old) as Partial<Row> | null;
          const nextRole: Role = next?.role ?? null;
          const nextStatus: Status = next?.status ?? null;

          setRole(nextRole);
          setStatus(nextStatus);

          if (!canAccess(pathname, nextRole, nextStatus)) {
            if (nextStatus === 'Banned') router.replace('/unauthorized');
            else router.replace('/account');
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, selfUserId, pathname, router]);

  return null;
}
