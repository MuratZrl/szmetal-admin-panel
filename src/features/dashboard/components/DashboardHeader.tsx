// src/features/dashboard/components/DashboardHeader.tsx
import * as React from 'react';
import DashboardHeaderClient from './DashboardHeader.client';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

type ProfileRow = { username: string | null; role: string | null; image?: string | null };

function roleLabelTR(role: string | null): string {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'manager') return 'Yönetici';
  if (r === 'user') return 'Kullanıcı';
  return 'Kullanıcı';
}

function istHour(): number {
  // Node tarafında Intl ile TR saatini h23 olarak al
  const hourStr = new Intl.DateTimeFormat('tr-TR', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: 'Europe/Istanbul',
  }).format(new Date());
  const h = parseInt(hourStr, 10);
  return Number.isFinite(h) ? h : 12;
}

function greetingTR(h: number): string {
  if (h >= 6 && h < 12) return 'Günaydın';
  if (h >= 12 && h < 15) return 'İyi günler';
  if (h >= 15 && h < 24) return 'İyi akşamlar';
  return 'İyi geceler';
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
  const greetPrefix = greetingTR(istHour()); // Türkiye saatine göre
  return <DashboardHeaderClient username={username} role={role} image={image} greetPrefix={greetPrefix} />;
}
