// src/lib/supabase/rsc.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * RSC (Server Components) içinde Supabase client factory.
 * - Env doğrulaması (modül yüklenirken)
 * - Yazma/okuma modu (write=false iken setAll no-op)
 * - Cookie path için ayarlanabilir varsayılan
 * - Tip güvenliği (never any)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik');
}

type CreateOpts = {
  /** Cookie yazımı açılsın mı (ör. login/logout gibi mutasyonlarda true) */
  write?: boolean;
  /** Supabase’in ayarladığı cookie’ler için path (varsayılan: "/") */
  cookiePath?: string;
};

function resolvePath(p?: string): string {
  return p && p.length > 0 ? p : '/';
}

export async function createRscClient(opts: CreateOpts = {}) {
  const { write = false, cookiePath } = opts;

  // Next 15 ile cookies() async
  const store = await cookies();

  const cookiesAdapter: CookieMethodsServer = {
    getAll() {
      return store.getAll();
    },
    setAll(list: { name: string; value: string; options: CookieOptions }[]) {
      if (!write) return;
      for (const { name, value, options } of list) {
        try {
          const merged: CookieOptions = {
            ...options,
            path: options?.path ?? resolvePath(cookiePath),
          };
          store.set(name, value, merged);
        } catch {
          // Header yazılamayacak bir aşamadaysa sessizce yoksay.
        }
      }
    },
  };

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: cookiesAdapter });
}

/** Sadece okuma için (cookie yazmaz) */
export const getReadOnlyRscClient = () => createRscClient({ write: false });

/** Yazma yetkili (auth akışlarında kullan) */
export const getWritableRscClient = () => createRscClient({ write: true });

/** Dış tip */
export type RscSupabaseClient = Awaited<ReturnType<typeof createRscClient>>;

/* -------------------------------------------------------
   Yardımcılar (isteğe bağlı ama kullanışlı)
------------------------------------------------------- */

export async function getRscSession() {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb.auth.getSession();
  return { session: data?.session ?? null, error };
}

type Status = 'Active' | 'Inactive' | 'Banned';
type Role = 'Admin' | 'Manager' | 'User';
export type ProfileRow = { status: Status; role: Role };

export async function getRscProfile(userId: string) {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb
    .from('users')
    .select('status, role')
    .eq('id', userId)
    .single<ProfileRow>();
  return { profile: data ?? null, error };
}

/** Küçük bir yardımcı: client ile tek seferlik işlem koşturma */
export async function withRscClient<T>(
  fn: (client: RscSupabaseClient) => Promise<T>,
  opts?: CreateOpts
): Promise<T> {
  const client = await createRscClient(opts);
  return fn(client);
}
