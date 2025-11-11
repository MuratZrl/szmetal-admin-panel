// src/lib/supabase/rsc.ts
'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik');
}

export type CreateOpts = { write?: boolean; cookiePath?: string };
const resolvePath = (p?: string) => (p && p.length > 0 ? p : '/');

export async function createRscClient(opts: CreateOpts = {}) {
  const { write = false, cookiePath } = opts;
  const store = await cookies();

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => store.getAll(),
    setAll: (list) => {
      if (!write) return;
      for (const { name, value, options } of list) {
        try {
          const merged: CookieOptions = { ...options, path: options?.path ?? resolvePath(cookiePath) };
          store.set(name, value, merged);
        } catch {
          // header yazılamıyorsa yoksay
        }
      }
    },
  };

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookiesAdapter,
    auth: {
      // Read-only durumda sessiyon/refresh yapma; yazmalı client'ı ayrı kullanacağız
      persistSession: write,          // yazmalı client için true
      autoRefreshToken: write,        // yazmalı client için true
      detectSessionInUrl: false,
    },
  });
}

export const getReadOnlyRscClient = () => createRscClient({ write: false });
export const getWritableRscClient = () => createRscClient({ write: true });

export type RscSupabaseClient = Awaited<ReturnType<typeof createRscClient>>;

// İstek-içi deduplikasyon: bir request boyunca aynı çağrı tekrar edilirse ağ’a bir kez gider.
export const getRscUser = cache(async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb.auth.getUser();
  return { user: data.user ?? null, error };
});

export const getRscSession = cache(async (): Promise<{ session: Session | null; error: AuthError | null }> => {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb.auth.getSession();
  return { session: data.session ?? null, error };
});

export type ProfileRow = Pick<Database['public']['Tables']['users']['Row'], 'status' | 'role'>;

export const getRscProfile = cache(async (
  userId: string
): Promise<{ profile: ProfileRow | null; error: PostgrestError | null }> => {
  const sb = await getReadOnlyRscClient();
  const { data, error } = await sb
    .from('users')
    .select('status, role')
    .eq('id', userId)
    .maybeSingle();
  return { profile: (data as ProfileRow | null) ?? null, error };
});

export async function withRscClient<T>(
  fn: (client: RscSupabaseClient) => Promise<T>,
  opts?: CreateOpts
): Promise<T> {
  const client = await createRscClient(opts);
  return fn(client);
}
