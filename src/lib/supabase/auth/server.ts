// src/lib/supabase/auth/server.ts
import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export type Role = 'Admin' | 'Manager' | 'User';
export type UserStatus = 'Active' | 'Inactive' | 'Banned';

type ProfileRow = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'username' | 'role' | 'status'
>;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

export const getUserOrNull = cache(async () => {
  const sb = await getServerSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
});

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

/** Profil zorunlu + ban kontrolü: profil yoksa veya banlıysa redirect. */
export const requireActiveUser = cache(async (): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getUserOrNull>>>;
  profile: ProfileRow;
}> => {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/login?error=profile-missing');
  if (profile.status === 'Banned') redirect('/unauthorized');
  return { user, profile }; // redirect never döndüğü için profile kesin var
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
): Promise<{ user: NonNullable<Awaited<ReturnType<typeof getUserOrNull>>>; profile: ProfileRow }> {
  const { user, profile } = await requireActiveUser();
  const role = profile.role as Role;
  const status = profile.status as UserStatus;

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
