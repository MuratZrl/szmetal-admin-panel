// src/features/dashboard/components/DashboardHeader.tsx
import * as React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import DashboardHeaderClient from './DashboardHeader.client';

type ProfileRow = { username: string | null; role: string | null; image?: string | null };

function roleLabelTR(role: string | null): string {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'manager') return 'Yönetici';
  if (r === 'user') return 'Kullanıcı';
  if (r === 'banned') return 'Engelli';
  return 'Kullanıcı';
}

async function fetchProfile(): Promise<{ username: string; role: string; image: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { username: 'Misafir', role: 'Kullanıcı', image: null };

  const { data } = await supabase
    .from('users')
    .select('username, role, image')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  const meta = user.user_metadata as Record<string, unknown> | null;
  const metaUsername = typeof meta?.username === 'string' ? meta.username : null;
  const fallbackFromEmail =
    typeof user.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : null;

  return {
    username: data?.username ?? metaUsername ?? fallbackFromEmail ?? 'Kullanıcı',
    role: roleLabelTR(data?.role ?? (typeof meta?.role === 'string' ? meta.role : null)),
    image: typeof data?.image === 'string' ? data.image : null,
  };
}

export default async function DashboardHeader() {
  const { username, role, image } = await fetchProfile();
  return <DashboardHeaderClient username={username} role={role} image={image} />;
}
