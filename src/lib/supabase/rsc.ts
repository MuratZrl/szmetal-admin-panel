// src/lib/supabase/rsc.ts
'use server';
import 'server-only';

import { cookies } from 'next/headers';
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type {
  User,
  Session,
  AuthError,
  PostgrestError,
} from '@supabase/supabase-js';

/**
 * RSC (Server Components) içinde Supabase client factory.
 * - Env doğrulaması
 * - Yazma/okuma modu (write=false iken setAll no-op)
 * - Cookie path ayarı
 * - Tip güvenliği (any yok)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik'
  );
}

export type CreateOpts = {
  /** Cookie yazımı açılsın mı (ör. login/logout gibi mutasyonlarda true) */
  write?: boolean;
  /** Supabase’in ayarladığı cookie’ler için path (varsayılan: "/") */
  cookiePath?: string;
};

function resolvePath(p?: string): string {
  return p && p.length > 0 ? p : '/';
}

/** Ana client factory (RSC). Next 15 ile cookies() async döner. */
export async function createRscClient(opts: CreateOpts = {}) {
  const { write = false, cookiePath } = opts;

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
          // Header yazılamıyorsa sessizce yoksay.
        }
      }
    },
  };

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookiesAdapter,
  });
}

/** Sadece okuma (cookie yazmaz) */
export const getReadOnlyRscClient = () => createRscClient({ write: false });

/** Yazma yetkili (auth akışlarında kullan) */
export const getWritableRscClient = () => createRscClient({ write: true });

/** Dış client tipi */
export type RscSupabaseClient = Awaited<ReturnType<typeof createRscClient>>;

/* -------------------------------------------------------
   Yardımcılar
------------------------------------------------------- */

/** Session yerine doğrudan kullanıcı (server tarafında tavsiye edilen) */
export async function getRscUser(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb.auth.getUser();
  return { user: data.user ?? null, error };
}

/** İhtiyaç varsa session da alınabilir */
export async function getRscSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb.auth.getSession();
  return { session: data.session ?? null, error };
}

/** Profilin sadece rol ve durumunu okumak için küçük yardımcı */
export type ProfileRow = Pick<
  Database['public']['Tables']['users']['Row'],
  'status' | 'role'
>;

export async function getRscProfile(
  userId: string
): Promise<{ profile: ProfileRow | null; error: PostgrestError | null }> {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb
    .from('users')
    .select('status, role')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();
  return { profile: data ?? null, error };
}

/** Bir defalık işlem için client enjekte eden yardımcı */
export async function withRscClient<T>(
  fn: (client: RscSupabaseClient) => Promise<T>,
  opts?: CreateOpts
): Promise<T> {
  const client = await createRscClient(opts);
  return fn(client);
}
