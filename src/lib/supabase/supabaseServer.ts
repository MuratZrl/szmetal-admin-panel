// src/lib/supabase/supabaseServer.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type DB = Database;
export type TypedSupabaseClient = SupabaseClient<DB>;

function ensureEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('[supabase] env yok.');
  }
}

/**
 * write = true  → Server Action / Route Handler gibi response’a cookie yazabildiğin yerler
 * write = false → RSC gibi read-only ortamlar
 */
export async function createSupabaseServerClient(opts: { write?: boolean } = {}): Promise<TypedSupabaseClient> {
  ensureEnv();
  const { write = false } = opts;

  const store = await cookies();

  return createServerClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // YENİ API: getAll + setAll
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet) {
          if (!write) return; // RSC’de yazma yok
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // bazı ortamlarda read-only olabilir, sessiz geç
          }
        },
      },
    }
  );
}

export async function getServerSession() {
  const sb = await createSupabaseServerClient();
  return sb.auth.getSession();
}

export async function getServerUser() {
  const sb = await createSupabaseServerClient();
  return sb.auth.getUser();
}

export async function getWritableServerClient(): Promise<TypedSupabaseClient> {
  return createSupabaseServerClient({ write: true });
}

export async function signOutServer() {
  const sb = await getWritableServerClient();
  return sb.auth.signOut();
}
