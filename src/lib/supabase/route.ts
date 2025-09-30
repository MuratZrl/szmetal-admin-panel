// src/lib/supabase/route.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik');
}

export async function createRouteClient() {
  const store = await cookies();

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => store.getAll(),
    setAll: (list) => {
      for (const { name, value, options } of list) {
        store.set(name, value, { ...options, path: options?.path ?? '/' });
      }
    },
  };

  // SADECE <Database>. İkincil genericleri zorlama.
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: cookiesAdapter,
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Tip gerekiyorsa buradan al, SupabaseClient import etme:
export type RouteSupabaseClient = Awaited<ReturnType<typeof createRouteClient>>;
