// lib/supabaseServer.ts (server-only)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/supabase';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const cookieList = cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));

  return createServerClient<Database>( // <-- Buraya Database ekledik
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieList,
      },
    }
  );
}
