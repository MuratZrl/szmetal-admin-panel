// src/features/requests/services/id/user.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type AppRole = 'Admin' | 'Manager' | 'User' | 'Banned';

export type UserPublic = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  company: string | null;
  role: AppRole | string | null;
};

function asStringOrNull(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

export async function fetchUserPublic(userId: string): Promise<UserPublic | null> {
  if (!userId) return null;

  const supabase = await createSupabaseServerClient();

  // Şeman “profiles” değilse burayı güncelle (ör: users, app_users vs.)
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, phone, country, company, role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const d = data as Record<string, unknown>;
  return {
    id: String(d.id),
    username: asStringOrNull(d.username),
    email: asStringOrNull(d.email),
    phone: asStringOrNull(d.phone),
    country: asStringOrNull(d.country),
    company: asStringOrNull(d.company),
    role: asStringOrNull(d.role),
  };
}
