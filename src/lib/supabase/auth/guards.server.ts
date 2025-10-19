// src/lib/supabase/auth/guards.server.ts
import 'server-only';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Tables } from '@/types/supabase';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Role = Tables<'users'>['role'];
type Status = Tables<'users'>['status'];

type ProfileRow = {
  id: Tables<'users'>['id'];
  role: Role;
  status: Status;
};

/* -------------------------------------------------------------------------- */
/* Role access matrix                                                          */
/* -------------------------------------------------------------------------- */

const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: [
    '/account',
    '/requests',
    '/clients',
    '/orders',
    '/create_request',
    '/products',
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
  return allow.some(b => n === b || n.startsWith(`${b}/`));
}

/* -------------------------------------------------------------------------- */
/* Core loader                                                                 */
/* -------------------------------------------------------------------------- */

/** Kullanıcı + profilini yükler. Yoksa { user:null, profile:null } döner. */
export async function loadAuthState(): Promise<{
  user: { id: string; email: string | null } | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: prof } = await supabase
    .from('users')
    .select('id, role, status')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: prof ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Guards                                                                      */
/* -------------------------------------------------------------------------- */

/** Login sayfasında çağır: girişliler içeri giremesin. */
export async function guardLoginPage(): Promise<void> {
  const { user, profile } = await loadAuthState();

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
  const { user, profile } = await loadAuthState();

  if (!user || !profile) {
    redirect('/login');
  }

  if (profile.status === 'Banned') {
    redirect('/unauthorized?reason=banned');
  }
  // Active/Inactive → render etmeye devam
}

/**
 * Her korumalı sayfada çağır.
 * Statü kuralları rol kurallarından ÖNCE uygulanır.
 *
 * Örnek:
 *   await requirePageAccess('/clients')
 *   await requirePageAccess('/dashboard')
 */
export async function requirePageAccess(pagePath: string): Promise<void> {
  const path = normalizePath(pagePath);
  const { user, profile } = await loadAuthState();

  if (!user || !profile) {
    redirect('/login');
  }

  // 1) Status önce
  if (profile.status === 'Banned') {
    redirect('/unauthorized?reason=banned');
  }

  if (profile.status === 'Inactive') {
    // Inactive sadece /account
    const isAccount = path === '/account' || path.startsWith('/account/');
    if (!isAccount) redirect('/account?reason=inactive');
    return; // /account serbest
  }

  // 2) Role sonra (Active kullanıcılar)
  if (profile.role === 'Admin') return;

  if (!roleAllows(profile.role, path)) {
    redirect('/unauthorized?reason=role');
  }
}

/* -------------------------------------------------------------------------- */
/* (Opsiyonel) Dışa aç: rol matrisi ve normalize yardımcıları                  */
/* -------------------------------------------------------------------------- */
export { ROLE_ACCESS };
