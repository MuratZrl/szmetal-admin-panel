// src/lib/auth/guards.server.ts
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

type Status = 'Active' | 'Inactive' | 'Banned';
type Role = 'Admin' | 'Manager' | 'User';
type Profile = { status: Status; role: Role } | null;

async function loadAuthState() {
  const sb = await createSupabaseServerClient(); // sadece okur
  const { data: sess } = await sb.auth.getSession();
  const session = sess?.session ?? null;

  if (!session) {
    return { sb, session: null, user: null, profile: null as Profile };
  }

  const { data: u } = await sb.auth.getUser();
  const user = u?.user ?? null;

  if (!user) {
    // render akışında cookie yazma yok; sadece durum döneriz
    return { sb, session: null, user: null, profile: null as Profile };
  }

  const { data: profile } = await sb
    .from('users')
    .select('status, role')
    .eq('id', user.id)
    .maybeSingle();

  return { sb, session, user, profile: (profile as Profile) ?? null };
}

/** Login sayfasında çağır: aktif kullanıcı varsa account'a at; sorunluysa /api/logout ile temizlet */
export async function guardLoginPage() {
  const { user, profile } = await loadAuthState();

  if (!user) return; // login render et

  // Profil yok veya aktif değil → logout route'u cookie temizleyip geri çağırır
  if (!profile || profile.status !== 'Active') {
    redirect('/api/logout?redirect=/login');
  }

  // Aktif kullanıcı → login'e girmesin
  redirect('/account');
}

/** Account sayfası: aktif değilse logout route üzerinden login'e gönder */
export async function guardAccountPage() {
  const { user, profile } = await loadAuthState();

  if (!user || !profile || profile.status !== 'Active') {
    redirect('/api/logout?redirect=/login');
  }
}
