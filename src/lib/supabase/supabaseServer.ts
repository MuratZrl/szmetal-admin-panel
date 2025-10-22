// src/lib/supabase/supabaseServer.ts
import 'server-only';

import { cookies } from 'next/headers';
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Bu modül projedeki Supabase client’larının tek doğruluk kaynağıdır.
 * - RSC (Server Components) için: YALNIZCA OKUMA client’ı
 * - Route Handler / Server Action için: OKU + YAZ client’ı
 *
 * Neden iki client?
 * RSC ortamında response header’larına yazmak yasak. Login/logout gibi
 * yan etkili işlemler cookies yazımı gerektirdiği için Route/Action tarafında
 * ayrı bir client ile yapılmalı. Tek dosyada toplayıp drift’i önlüyoruz.
 */

// Ortam değişkenlerini “fail-fast” doğrula.
const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!URL || !ANON) throw new Error('[supabase] env eksik');

/* ----------------------------------------------------------------
   RSC (read-only) client
   - Kullanım: RSC page.tsx, loader benzeri server-only okuma senaryoları
   - Cookie: sadece OKU (setAll no-op)
   - Auth: persist/refresh/detect kapalı (yan etki yok)
----------------------------------------------------------------- */
export async function createSupabaseRSCClient() {
  const store = await cookies();

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => store.getAll(),
    setAll: () => {
      // RSC'de header yazımı yasak; sessiz no-op
    },
  };

  return createServerClient<Database>(URL, ANON, {
    cookies: cookiesAdapter,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/* ----------------------------------------------------------------
   Route/Action (read-write) client
   - Kullanım: /app/api/* route.ts, server actions, login/logout vb.
   - Cookie: OKU + YAZ (Supabase auth cookie’lerini günceller)
   - Auth: persist/refresh açık
   - Not: Bu dosya Node.js runtime’ında kullanılmalı.
----------------------------------------------------------------- */
export async function createSupabaseRouteClient() {
  const store = await cookies();

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => store.getAll(),
    setAll: (list) => {
      // Supabase, tek çağrıda birden fazla cookie basabilir.
      for (const { name, value, options } of list) {
        // Varsayılan path’i sabitle ki refresh cookie’leri her yerde geçerli olsun.
        const merged: CookieOptions = { path: '/', ...options };
        store.set(name, value, merged);
      }
    },
  };

  return createServerClient<Database>(URL, ANON, {
    cookies: cookiesAdapter,
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/* ----------------------------------------------------------------
   Tip kolaylıkları
----------------------------------------------------------------- */
export type SupabaseRSCClient   = Awaited<ReturnType<typeof createSupabaseRSCClient>>;
export type SupabaseRouteClient = Awaited<ReturnType<typeof createSupabaseRouteClient>>;

/* ----------------------------------------------------------------
   Geriye dönük alias (eski import’lar kırılmasın)
----------------------------------------------------------------- */
export { createSupabaseRSCClient as createSupabaseServerClient };
