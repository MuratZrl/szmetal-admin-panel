// src/features/auth/AccessAutoRedirect.client.tsx
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Projedeki kurallar:
// Admin: her yer
// Manager: dashboard hariç admin sayfaları
// User: yalnız account, create_request, orders
type Role = Database['public']['Tables']['users']['Row']['role'];
type Status = Database['public']['Tables']['users']['Row']['status'];

type Props = { selfUserId: string | null };

function canAccess(pathname: string, role: Role | null | undefined, status: Status | null | undefined): boolean {
  if (!role) return false;

  // Banned: hiçbir yere değil (login de engelli, sen yine de sakıncalı durum)
  if (status === 'Banned') return false;

  // Admin: özgür
  if (role === 'Admin') return true;

  // Manager: sadece dashboard yasak
  if (role === 'Manager') {
    return !pathname.startsWith('/dashboard');
  }

  // User: sadece account, create_request (Inactive ise create_request yasak), orders
  if (role === 'User') {
    if (pathname.startsWith('/account')) return true;
    if (pathname.startsWith('/orders')) return true;
    if (pathname.startsWith('/create_request')) {
      // Inactive create_request'a giremez (senaryon dikkate)
      return status !== 'Inactive';
    }
    return false;
  }

  return false;
}

export default function AccessAutoRedirect({ selfUserId }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Env zorunlu
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = React.useMemo<SupabaseClient<Database>>(
    () => createClient<Database>(url, anon),
    [url, anon]
  );

  // İlk yüklemede mevcut durumu kontrol et
  React.useEffect(() => {
    let canceled = false;
    if (!selfUserId) return;

    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', selfUserId)
        .maybeSingle();

      if (canceled || error) return;

      if (!canAccess(pathname, data?.role, data?.status)) {
        // Nereye?
        if (data?.status === 'Banned') {
          router.replace('/unauthorized');
          return;
        }
        // Kullanıcının erişebileceği en mantıklı yer
        router.replace('/account');
      }
    })();

    return () => {
      canceled = true;
    };
  }, [supabase, selfUserId, pathname, router]);

  // Realtime: kendi satırını dinle
  React.useEffect(() => {
    if (!selfUserId) return;

    const channel = supabase
      .channel(`users-role-watch:${selfUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${selfUserId}` },
        (payload) => {
          const next = (payload.new ?? payload.old) as Partial<Database['public']['Tables']['users']['Row']> | null;
          const role = next?.role;
          const status = next?.status;

          if (!canAccess(pathname, role, status)) {
            if (status === 'Banned') {
              router.replace('/unauthorized');
            } else {
              router.replace('/account');
            }
          } else {
            // Yetki hala var; veri farklılaştıysa sayfayı tazelemek isteyebilirsin
            // router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, selfUserId, pathname, router]);

  // Görsel bir şey üretmiyoruz
  return null;
}
