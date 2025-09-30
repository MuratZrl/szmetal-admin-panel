// src/lib/supabase/supabaseServer.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** RSC: sadece OKU. Cookie yazmak YASAK. */
export async function createSupabaseRSCClient() {
  const jar = await cookies();
  return createServerClient<Database, 'public'>(URL, ANON, {
    cookies: {
      get: (name: string) => jar.get(name)?.value,
      set: () => {},     // no-op
      remove: () => {},  // no-op
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/** Route Handler / Server Action: OKU + YAZ. */
export async function createSupabaseRouteClient() {
  const jar = await cookies();
  return createServerClient<Database, 'public'>(URL, ANON, {
    cookies: {
      get: (name: string) => jar.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        jar.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        jar.delete({ name, ...options });
      },
    },
  });
}

/** Tip aliases (inference’tan türet, elde yazma) */
export type SupabaseRSCClient   = Awaited<ReturnType<typeof createSupabaseRSCClient>>;
export type SupabaseRouteClient = Awaited<ReturnType<typeof createSupabaseRouteClient>>;

/** Eski isimle de ihtiyaç varsa: */
export { createSupabaseRSCClient as createSupabaseServerClient };
