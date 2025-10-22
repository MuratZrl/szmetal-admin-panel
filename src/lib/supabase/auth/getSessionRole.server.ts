// src/lib/auth/getSessionRole.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Tables } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';

export type Role = Tables<'users'>['role'];

export async function getSessionRole(): Promise<Role | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return null;

  const { data, error: qerr } = await sb
    .from('users')
    .select('role')
    .eq('id', (user as User).id)
    .maybeSingle<{ role: Role }>();

  if (qerr) return null;
  return data?.role ?? null;
}
