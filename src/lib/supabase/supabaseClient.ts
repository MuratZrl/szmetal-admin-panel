// src/lib/supabase/supabaseClient.ts
'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createSupabaseBrowserClient as _create } from './client';


export type TypedSupabaseClient = SupabaseClient<Database>;

/** Eski API ile bire bir aynı factory */
export function createSupabaseBrowserClient(): TypedSupabaseClient {
  return _create();
}

/** 
 * Geriye dönük uyumluluk için tekil client.
 * HMR sırasında yeniden yaratmamak için global cache.
 */
declare global {
  var __SB_CLIENT__: TypedSupabaseClient | undefined;
}

export const supabase: TypedSupabaseClient =
  globalThis.__SB_CLIENT__ ?? (globalThis.__SB_CLIENT__ = _create());
