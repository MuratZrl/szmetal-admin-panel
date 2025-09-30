// src/lib/supabase/auth/server.ts
import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient  } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/** Uygulamadaki rol ve statüler */
export type Role = 'Admin' | 'Manager' | 'User';
export type UserStatus = 'Active' | 'Inactive' | 'Banned';

type ProfileRow = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'username' | 'role' | 'status'
>;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * RSC (Server Component) için tek bir Supabase client — okuma modunda.
 * setAll no-op: RSC içinde cookie yazamazsın; token yenileme yazmaları middleware/route’da yapılmalı.
 * Tipi bilerek anotlamıyoruz; createServerClient ne döndürüyorsa onu kabul ediyoruz.
 */
export const getServerSupabase = cache(async () => {
  const jar = await cookies();
  return createServerClient<Database, 'public'>(URL, ANON, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: () => { /* RSC'de yazma yok */ },
    },
    auth: {
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
});

/** Oturumdaki kullanıcıyı tek seferlik getir (cache) */
export const getUserOrNull = cache(async () => {
  const sb = await getServerSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
});

/** Kullanıcı + profil satırı (tek seferlik, cache) */
export const getUserAndProfile = cache(async (): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getUserOrNull>>> | null;
  profile: ProfileRow | null;
}> => {
  const sb = await getServerSupabase();
  const user = await getUserOrNull();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await sb
    .from('users')
    .select('id, email, username, role, status')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  return { user, profile: profile ?? null };
});

/** Auth zorunlu: yoksa /login */
export const requireUser = cache(async () => {
  const user = await getUserOrNull();
  if (!user) redirect('/login');
  return user;
});

/** Ban kontrolü: banlıysa /unauthorized, yoksa kullanıcıyı döndür */
export const requireActiveUser = cache(async () => {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect('/login');
  if (profile?.status === 'Banned') redirect('/unauthorized');
  return { user, profile };
});

/**
 * Sayfa erişim kuralları:
 * - Admin: her yer
 * - Manager: "dashboard" hariç
 * - User: sadece "account", "create_request", "orders"
 * - Ek kural: "Inactive" kullanıcı /create_request göremez
 */
export async function requirePageAccess(
  page: 'dashboard' | 'account' | 'create_request' | 'orders' | 'clients' | 'requests' | 'products'
) {
  const { user, profile } = await requireActiveUser();
  const role = (profile?.role ?? 'User') as Role;
  const status = (profile?.status ?? 'Active') as UserStatus;

  // ❌ Eskisi: Inactive + create_request → /account
  // ✅ Doğrusu: açıkça yetkisiz sayfa
  if (status === 'Inactive' && page === 'create_request') {
    redirect('/unauthorized?reason=inactive');
  }

  if (role === 'Admin') return { user, profile };

  if (role === 'Manager') {
    if (page === 'dashboard') redirect('/unauthorized?reason=manager-no-dashboard');
    return { user, profile };
  }

  // role === 'User'
  const userAllowed = new Set(['account', 'create_request', 'orders']);
  if (!userAllowed.has(page)) redirect('/unauthorized?reason=role');

  return { user, profile };
}