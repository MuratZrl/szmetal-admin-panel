// src/lib/supabase/supabaseClient.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type TypedSupabaseClient = SupabaseClient<Database>;

function ensureEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY eksik.');
  }
  return { url, anon };
}

/**
 * Browser için Supabase client factory.
 * Not: Email/şifre login’i server route’u ile yaptığın için
 * client SDK’da oturum bulunmayabilir. Auth gerektiren DB çağrılarını
 * server components / route handlers / server actions üzerinden yap.
 */
export function createSupabaseBrowserClient(): TypedSupabaseClient {
  const { url, anon } = ensureEnv();

  return createClient<Database>(url, anon, {
    auth: {
      // OAuth kullanmıyorsun ama password reset gibi URL token akışlarında
      // gerekeceği için açık kalsın. İstemiyorsan false yapabilirsin.
      detectSessionInUrl: true,
      // LocalStorage’da ayrı bir client session tutmak istemiyorsan false.
      // Server tarafı cookie ile ilerlediğinden karışıklığı azaltır.
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * HMR sırasında yeniden yaratmayı önlemek için tekil client.
 * İstersen yalnızca bu export’u kullan.
 */
declare global {
  var __SB_BROWSER__: TypedSupabaseClient | undefined;
}

export const supabase: TypedSupabaseClient =
  globalThis.__SB_BROWSER__ ?? (globalThis.__SB_BROWSER__ = createSupabaseBrowserClient());
