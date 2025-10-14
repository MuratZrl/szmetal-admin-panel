// src/lib/supabase/supabaseServer.ts
import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * createSupabaseRSCClient
 * -----------------------
 * • Kullanım yeri: Server Components (RSC) ve loader benzeri, KESİNLİKLE “yalnızca okuma”.
 * • Cookie policy: Yalnızca OKU. Cookie yazmak yasak (Next RSC kısıtı).
 * • Auth: SSR cookie’lerinden oturumu okur. Auto refresh/persist kapalı.
 * • Ne işe yarar?
 *    - Sunucu tarafı render’da (RSC) kullanıcı bilgisi/DB verisi okumak.
 *    - Sessiz, yan etkisiz, cache-friendly sorgular.
 * • Ne yapmaz?
 *    - Cookie yazmaz, login/logout yapmaz, “yan etki” yaratmaz.
 */
export async function createSupabaseRSCClient() {
  const jar = await cookies();
  return createServerClient<Database, 'public'>(URL, ANON, {
    cookies: {
      // RSC’de yalnızca mevcut cookie’yi okuyabiliriz
      get: (name: string) => jar.get(name)?.value,
      set: () => {},     // no-op: RSC cookie yazamaz
      remove: () => {},  // no-op: RSC cookie silemez
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * createSupabaseRouteClient
 * -------------------------
 * • Kullanım yeri: Route Handlers (/app/api/*), Server Actions ve diğer tam sunucu tarafı kodlar.
 * • Cookie policy: OKU + YAZ. Session cookie’lerini güncelleyebilir.
 * • Auth: SSR cookie’lerinden okur, gerekirse set/delete yapar (login, logout vb.).
 * • Ne işe yarar?
 *    - Form işlemleri, login/logout, server-side DB yazma, RLS ile korunan endpoint’ler.
 * • Dikkat:
 *    - Bu fonksiyonun çağrıldığı dosya/route **server runtime** (Node.js) olmalı.
 *    - Kullanıcı girdisini doğrudan SQL’e yollama; daima uygun filtre/validasyon yap.
 */
export async function createSupabaseRouteClient() {
  const jar = await cookies();
  return createServerClient<Database, 'public'>(URL, ANON, {
    cookies: {
      get: (name: string) => jar.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        // Route/Action içinde cookie yazabiliriz (login, refresh, logout)
        jar.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        jar.delete({ name, ...options });
      },
    },
  });
}

/**
 * Tür kolaylıkları:
 * • SupabaseRSCClient: RSC (read-only) client tip çıkarımı
 * • SupabaseRouteClient: Route/Action (read-write) client tip çıkarımı
 */
export type SupabaseRSCClient   = Awaited<ReturnType<typeof createSupabaseRSCClient>>;
export type SupabaseRouteClient = Awaited<ReturnType<typeof createSupabaseRouteClient>>;

/**
 * Geriye dönük isim:
 * • Bazı modüller eski ismi arıyorsa aynı fonksiyona alias veriyoruz.
 */
export { createSupabaseRSCClient as createSupabaseServerClient };
