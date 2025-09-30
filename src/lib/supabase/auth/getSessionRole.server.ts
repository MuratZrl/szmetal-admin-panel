// src/lib/auth/getSessionRole.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Tables } from '@/types/supabase';

export type Role = Tables<'users'>['role'];

export async function getSessionRole(): Promise<Role | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from('users')
    .select('role')
    .eq('id', user.id as Tables<'users'>['id'])
    .maybeSingle<{ role: Role }>();   // ← burası kritik

  if (error) return null;
  return data?.role ?? null;
}
