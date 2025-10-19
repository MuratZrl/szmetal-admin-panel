// src/lib/auth/apiGuard.server.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { Tables } from '@/types/supabase';

type Role = Tables<'users'>['role'];
type Status = Tables<'users'>['status'];
export type Profile = { role: Role; status: Status };

export type ApiAuth = {
  userId: string;
  email: string | null;
  profile: Profile;
};

/** API uçları için ortak auth + profil yükleyici. */
export async function requireApiAuth(): Promise<ApiAuth | NextResponse> {
  const sb = await createSupabaseRouteClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { data: prof } = await sb
    .from('users')
    .select('role,status')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (!prof) {
    return NextResponse.json({ error: 'profile_missing' }, { status: 403 });
  }
  if (prof.status === 'Banned') {
    return NextResponse.json({ error: 'banned' }, { status: 403 });
  }
  return { userId: user.id, email: user.email ?? null, profile: prof };
}

/** Yalnızca Active kullanıcılar. Inactive/Banned 403. */
export function assertActive(auth: ApiAuth): NextResponse | null {
  if (auth.profile.status !== 'Active') {
    return NextResponse.json({ error: 'inactive' }, { status: 403 });
  }
  return null;
}

/** Rol bazlı kontrol. */
export function assertRole(auth: ApiAuth, allowed: ReadonlyArray<Role>): NextResponse | null {
  if (!allowed.includes(auth.profile.role)) {
    return NextResponse.json({ error: 'role' }, { status: 403 });
  }
  return null;
}
