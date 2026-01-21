'use client';
// src/lib/supabase/supabaseClient.ts

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type TypedSupabaseClient = SupabaseClient<Database>;

function ensureEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('[supabase] env eksik');
  return { url, anon };
}

export function createSupabaseBrowserClient() {
  const { url, anon } = ensureEnv();
  return createBrowserClient<Database>(url, anon, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
}

declare global {
  var __SB_BROWSER__: ReturnType<typeof createSupabaseBrowserClient> | undefined;
}

export const supabase =
  globalThis.__SB_BROWSER__ ?? (globalThis.__SB_BROWSER__ = createSupabaseBrowserClient());
