// src/lib/supabase/auth/guards.server.ts
import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';

import { resolveAvatarUrl } from '@/features/products/comments/services/resolveAvatarUrl.server';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type Role = 'Admin' | 'Manager' | 'User';
export type UserStatus = 'Active' | 'Inactive' | 'Banned';

export type ProfileRow = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'username' | 'role' | 'status' | 'image' | 'updated_at'
>;

export type AuthState = {
  user: User | null;
  profile: ProfileRow | null;
};

/* -------------------------------------------------------------------------- */
/* Supabase SSR client (cookie read-only in RSC)                               */
/* -------------------------------------------------------------------------- */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** RSC'de cookie yazmayız, sadece okuruz. */
export const getServerSupabase = cache(async () => {
  const jar = await cookies();
  return createServerClient<Database>(URL, ANON, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: () => {
        /* no-op in RSC */
      },
    },
  });
});

/* -------------------------------------------------------------------------- */
/* Core loaders                                                                */
/* -------------------------------------------------------------------------- */

export const getUserOrNull = cache(async (): Promise<User | null> => {
  const sb = await getServerSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
});

export const getUserAndProfile = cache(async (): Promise<AuthState> => {
  const sb = await getServerSupabase();
  const user = await getUserOrNull();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await sb
    .from('users')
    .select('id, email, username, role, status, image, updated_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  return { user, profile: profile ?? null };
});

/** Profil zorunlu + ban kontrolü. */
export const requireActiveUser = cache(async (): Promise<{
  user: User;
  profile: ProfileRow;
}> => {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/login?error=profile-missing');
  if (profile.status === 'Banned') redirect('/unauthorized?reason=banned');
  return { user, profile };
});

/* -------------------------------------------------------------------------- */
/* Role access matrix (path-based)                                             */
/* -------------------------------------------------------------------------- */

export const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: [
    '/account',
    '/requests',
    '/clients',
    '/orders',
    '/create_request',
    '/products',
    '/products_analytics',
  ],
  User: ['/account', '/create_request', '/orders', '/products'],
} as const;

function normalizePath(p: string): string {
  if (!p) return '/';
  const q = p.split('#')[0]!.split('?')[0]!;
  return q === '/' ? '/' : q.replace(/\/+$/g, '');
}

function roleAllows(role: Role, path: string): boolean {
  const n = normalizePath(path);
  const allow = ROLE_ACCESS[role];
  if (!allow) return false;
  if (allow.includes('*')) return true;
  return allow.some((b) => n === b || n.startsWith(`${b}/`));
}

/* -------------------------------------------------------------------------- */
/* Guards                                                                      */
/* -------------------------------------------------------------------------- */

/** Login sayfasında çağır: girişliler içeri giremesin. */
export async function guardLoginPage(): Promise<void> {
  const { user, profile } = await getUserAndProfile();

  if (!user) return; // oturum yok → login render et

  // Banlı/profilsiz ise login göstermeyelim
  if (!profile || profile.status === 'Banned') {
    redirect('/unauthorized?reason=banned');
  }

  // Active ya da Inactive fark etmez → login'e girmesin
  redirect('/account');
}

/** Account: yalnızca login ve banlı olmayan kullanıcı. Inactive serbest. */
export async function guardAccountPage(): Promise<void> {
  const { user, profile } = await getUserAndProfile();

  if (!user || !profile) redirect('/login');
  if (profile.status === 'Banned') redirect('/unauthorized?reason=banned');
  // Active/Inactive → render etmeye devam
}

/**
 * Her korumalı sayfada çağır.
 * - Login yoksa → /login
 * - Profile yoksa → /login?error=profile-missing
 * - Banned → /unauthorized
 * - Inactive → sadece /create_request'e giremez (senin requirement)
 * - Role → ROLE_ACCESS matrisi
 */
export async function requirePageAccess(pagePath: string): Promise<{
  user: User;
  profile: ProfileRow;
}> {
  const path = normalizePath(pagePath);
  const { user, profile } = await requireActiveUser();

  // Status kuralı (senin requirement)
  if (profile.status === 'Inactive') {
    const isCreate = path === '/create_request' || path.startsWith('/create_request/');
    if (isCreate) redirect('/unauthorized?reason=inactive');
  }

  const role = (profile.role ?? 'User') as Role;

  // Admin her şey
  if (role === 'Admin') return { user, profile };

  // Manager: dashboard yok (senin requirement)
  if (role === 'Manager') {
    const isDashboard = path === '/dashboard' || path.startsWith('/dashboard/');
    if (isDashboard) redirect('/unauthorized?reason=manager-no-dashboard');

    if (!roleAllows(role, path)) redirect('/unauthorized?reason=role');
    return { user, profile };
  }

  // User: matrise göre
  if (!roleAllows('User', path)) redirect('/unauthorized?reason=role');

  return { user, profile };
}

/* -------------------------------------------------------------------------- */
/* Optional: legacy "page key" API                                             */
/* -------------------------------------------------------------------------- */

const PAGE_KEY_TO_PATH = {
  account: '/account',
  dashboard: '/dashboard',
  create_request: '/create_request',
  orders: '/orders',
  clients: '/clients',
  requests: '/requests',
  products: '/products',
  products_analytics: '/products_analytics',
} as const;

export type PageKey = keyof typeof PAGE_KEY_TO_PATH;

/**
 * Eski `requirePageAccess('products')` stilini seviyorsan bu wrapper'ı kullan.
 * Yeni projede en düzgünü path bazlı `requirePageAccess('/products')`.
 */
export async function requirePageAccessKey(key: PageKey): Promise<{
  user: User;
  profile: ProfileRow;
}> {
  return requirePageAccess(PAGE_KEY_TO_PATH[key]);
}

/* -------------------------------------------------------------------------- */
/* getSessionInfo için:                                                       */
/* -------------------------------------------------------------------------- */

export type SessionInfo = {
  role: Role | null;
  userId: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export const getSessionInfo = cache(async (): Promise<SessionInfo> => {
  const { user, profile } = await requireActiveUser();

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaAvatar =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null;

  const avatarUrl = await resolveAvatarUrl(profile.image ?? metaAvatar);

  return {
    role: (profile.role ?? null) as Role | null,
    userId: user.id,
    username: profile.username ?? null,
    email: profile.email ?? user.email ?? null,
    avatarUrl,
  };
});

/* -------------------------------------------------------------------------- */
/* Route için:                                                                */
/* -------------------------------------------------------------------------- */

export type RequireAdminApiResult =
  | { ok: true; user: User; profile: ProfileRow }
  | { ok: false; status: 401 | 403 | 500; error: string };

/**
 * API route için: redirect yok.
 * Page guard ile karıştırma.
 */
export async function requireAdminApi(
  sb: SupabaseClient<Database>,
): Promise<RequireAdminApiResult> {
  const { data, error } = await sb.auth.getUser();
  const user = data.user ?? null;

  if (error || !user) {
    return { ok: false, status: 401, error: 'Auth gerekli' };
  }

  const { data: profile, error: profErr } = await sb
    .from('users')
    .select('id, email, username, role, status, image, updated_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (profErr) return { ok: false, status: 500, error: 'Profil okunamadı' };
  if (!profile) return { ok: false, status: 403, error: 'Profil yok' };

  if (profile.status === 'Banned') {
    return { ok: false, status: 403, error: 'Banned' };
  }

  if (profile.role !== 'Admin') {
    return { ok: false, status: 403, error: 'Yetki yok' };
  }

  return { ok: true, user, profile };
}

