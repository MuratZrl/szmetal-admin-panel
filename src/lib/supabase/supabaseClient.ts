// src/lib/supabase/supabaseClient.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * ensureEnv
 * ---------
 * • Tarayıcı client’ı ayağa kalkmadan önce zorunlu env’leri doğrular.
 * • Eksikse net bir hata fırlatır. Böylece “sessiz kırık client” yerine erken teşhis alırsın.
 */
function ensureEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY eksik.');
  }
  return { url, anon };
}

/**
 * createSupabaseBrowserClient
 * ---------------------------
 * • Kullanım yeri: TARAYICI (Client Components).
 * • Auth:
 *    - detectSessionInUrl: true → reset linkleri/OAuth dönüşlerinde URL token’ını yakalar.
 *    - persistSession: true → localStorage’da session tutar (SPA davranışı).
 *    - autoRefreshToken: true → access token’ı süre dolmadan yeniler.
 * • Not:
 *    - Bu client’ı “hafif” işler, realtime, storage, hızlı okuma için kullan.
 *    - RLS kontrollü kritik DB yazmalarını Server Action/Route Handler ile yap.
 */
export function createSupabaseBrowserClient(): TypedSupabaseClient {
  const { url, anon } = ensureEnv();

  return createClient<Database>(url, anon, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * HMR tekilliği
 * -------------
 * • Dev modda hot-reload sırasında client’ı yeniden oluşturmamak için
 *   global bir referansta tutuyoruz.
 * • Üretimde tek kere yaratılır, dev’de de stabil kalır.
 */
declare global {
  var __SB_BROWSER__: TypedSupabaseClient | undefined;
}

export const supabase: TypedSupabaseClient =
  globalThis.__SB_BROWSER__ ?? (globalThis.__SB_BROWSER__ = createSupabaseBrowserClient());
