// app/api/clients/users/role/route.ts
import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { isUUID, isAppRole } from '@/features/clients/constants/users';

type UsersRow = Database['public']['Tables']['users']['Row'];
type AppRole = UsersRow['role'];
type AppStatus = UsersRow['status'];

type Body = { userId: string; role: AppRole };

function j(status: number, payload: unknown) {
  return NextResponse.json(payload, { status });
}

export async function POST(req: NextRequest) {
  // 1) Body doğrulama
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return j(400, { error: 'Geçersiz JSON' });
  }

  const userId = (raw as Partial<Body>)?.userId;
  const role = (raw as Partial<Body>)?.role;

  if (!userId || !isUUID(userId) || !role || !isAppRole(role)) {
    return j(400, { error: 'Invalid payload' });
  }

  // 2) İstek yapan kim?
  const ssr = await createSupabaseRouteClient();
  const { data: auth } = await ssr.auth.getUser();
  const requesterId = auth?.user?.id ?? null;
  if (!requesterId) {
    return j(401, { error: 'Unauthorized' });
  }

  // 3) Writer seç: Service Role varsa onu kullan (RLS by-pass), yoksa SSR
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url) return j(500, { error: 'NEXT_PUBLIC_SUPABASE_URL tanımsız' });

  let writer: SupabaseClient<Database>;
  if (srv) {
    writer = createClient<Database>(url, srv, { auth: { persistSession: false } });
  } else {
    // SSR client'ı tek tipe sabitle
    writer = ssr as unknown as SupabaseClient<Database>;
  }

  // 4) İstek yapan gerçekten Admin mi?
  const { data: me, error: meErr } = await writer
    .from('users')
    .select('id, role, status')
    .eq('id', requesterId)
    .maybeSingle();

  if (meErr) return j(500, { error: 'Kullanıcı getirilemedi' });
  if (!me) return j(401, { error: 'Kullanıcı bulunamadı' });
  if ((me.status as AppStatus) === 'Banned') return j(403, { error: 'Hesabınız yasaklı' });
  if ((me.role as AppRole) !== 'Admin') return j(403, { error: 'Sadece Admin rol atayabilir' });

  // 5) Son admin kendini düşürmesin
  if (requesterId === userId && role !== 'Admin') {
    const { count, error: cErr } = await writer
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .eq('role', 'Admin');

    if (cErr) return j(500, { error: 'Admin sayısı kontrol edilemedi' });
    if ((count ?? 0) <= 1) return j(403, { error: 'Son Admin kendini düşüremez' });
  }

  // 6) UPDATE + geri döndür
  const { data: updated, error: updErr } = await writer
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select('id, role')
    .maybeSingle();

  if (updErr) {
    const hint = srv
      ? 'Güncelleme başarısız.'
      : 'Güncelleme başarısız. SUPABASE_SERVICE_ROLE_KEY ekleyin veya RLS/RPC ayarlayın.';
    return j(500, { error: `${hint} ${updErr.message}` });
  }

  if (!updated) return j(404, { error: 'Kullanıcı bulunamadı' });

  return j(200, { id: updated.id, role: updated.role });
}
