// app/api/account/close/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type Body = { password: string; confirm: string };

function bad(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.password || !body?.confirm) return bad('missing_fields', 400);
  if (body.confirm.trim().toUpperCase() !== 'SİL') return bad('confirm_required', 400);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return bad('env_missing', 500);

  // 1) Mevcut oturumu al
  const cookieStore = await cookies();
  const pending: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[] = [];

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() { return cookieStore.getAll().map(c => ({ name: c.name, value: c.value })); },
      setAll(toSet) { toSet.forEach(({ name, value, options }) => pending.push({ name, value, options })); },
    },
  });

  const { data: { user }, error: meErr } = await supabase.auth.getUser();
  if (meErr || !user?.email) return bad('unauthorized', 401);

  // 2) Parola doğrula (reh-oturum)
  const temp = createSupabaseClient(url, anon, { auth: { persistSession: false } });
  const { error: signErr } = await temp.auth.signInWithPassword({
    email: user.email,
    password: body.password,
  });
  if (signErr) return bad('invalid_password', 401);

  // 3) Audit için profil satırını işaretle (opsiyonel ama tavsiye)
  const admin = createAdminClient(url, service, { auth: { persistSession: false } });
  // status='Deleted' kolonun yoksa atla, sadece silmeye devam et
  await admin.from('users').update({
    status: 'Deleted',
    deleted_at: new Date().toISOString(),
    deleted_by: user.id,
    deleted_reason: 'self-request',
  }).eq('id', user.id);

  // 4) Oturumu kapat (tarayıcı cookie’lerini temizleyelim)
  await supabase.auth.signOut();

  // 5) Auth’tan kalıcı sil
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    // Silme başarısız olursa en azından erişim kapalı kalsın
    return bad('delete_failed', 500);
  }

  // 6) Response + cookie sync
  const res = NextResponse.json({ ok: true });
  pending.forEach(pc => res.cookies.set(pc.name, pc.value, pc.options));
  return res;
}
