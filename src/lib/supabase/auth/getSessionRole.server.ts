// src/lib/auth/getSessionRole.server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export type Role = 'Admin' | 'User';

export async function getSessionRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // SSR client için minimum yeterli
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {}, remove() {},
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // önce metadata, yoksa DB
  const metaRole = (user.app_metadata?.role ?? user.user_metadata?.role) as Role | undefined;
  if (metaRole) return metaRole;

  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  return (data?.role as Role | undefined) ?? null;
}
