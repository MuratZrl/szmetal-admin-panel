'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type DB = Database;
export type TypedSupabaseClient = SupabaseClient<DB>;

/**
 * Ortam değişkenleri kontrolü. Build ya da runtime’da sessiz hata istemiyorsan zorunlu.
 */
function ensureEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.'
    );
  }
}

/**
 * Next 15 ile cookies() Promise dönebiliyor; burada tek yerden bekliyoruz.
 */
async function getCookieStore() {
  // Eğer projen “sync cookies()” ise TS uyumlu; “await” fazlalık olmaz.
  return await cookies();
}

type CreateOpts = {
  /**
   * true: Server Action / Route Handler içinde yazma yapılır (set/remove).
   * false: RSC gibi yerlerde yazma NO-OP (Next yazmayı yasaklıyor).
   */
  write?: boolean;
};

/**
 * Tek giriş noktası: SSR için Supabase client.
 * RSC:  createSupabaseServerClient()           // read-only (write = false)
 * Action/Route: createSupabaseServerClient({ write: true })
 */
export async function createSupabaseServerClient(
  opts: CreateOpts = {}
): Promise<TypedSupabaseClient> {
  ensureEnv();

  const { write = false } = opts;
  const store = await getCookieStore();

  return createServerClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Supabase adapter string | null bekliyor
          return store.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (!write) return; // RSC’de yazmaya kalkma, Next hata fırlatır
          store.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (!write) return;
          // Next 15’te delete var; bazı ortamlarda fallback olarak set+maxAge:0 kullan.
          try {
            store.delete(name);
          } catch {
            store.set({ name, value: '', ...options, maxAge: 0 });
          }
        },
      },
    }
  );
}

/* -------------------- Sık kullanılan yardımcılar -------------------- */

/** Session bilgisini döndürür (RSC’de güvenle kullan). */
export async function getServerSession() {
  const sb = await createSupabaseServerClient();
  return sb.auth.getSession();
}

/** Kullanıcı bilgisini döndürür (RSC’de güvenle kullan). */
export async function getServerUser() {
  const sb = await createSupabaseServerClient();
  return sb.auth.getUser();
}

/**
 * Oturum kapatma gibi çerez yazan işlemler için.
 * Bunu sadece Server Action veya Route Handler içinde çağır.
 */
export async function getWritableServerClient(): Promise<TypedSupabaseClient> {
  return createSupabaseServerClient({ write: true });
}

/** Örnek: server tarafında güvenli signOut */
export async function signOutServer() {
  const sb = await getWritableServerClient();
  return sb.auth.signOut();
}
