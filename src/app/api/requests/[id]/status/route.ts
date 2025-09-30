// app/api/requests/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* -------------------------------- Types ---------------------------------- */
type Users       = Database['public']['Tables']['users'];
type UsersRow    = Users['Row'];
type Requests    = Database['public']['Tables']['requests'];
type RequestRow  = Requests['Row'];
type RequestUpd  = Requests['Update'];
type RequestId   = RequestRow['id'];
type ReqStatus   = RequestRow['status']; // 'approved' | 'rejected' | 'pending'

type Body = { status: ReqStatus };

/* --------------------------- Narrow helpers ------------------------------ */
function parseStatus(v: unknown): Body['status'] | null {
  const s = typeof v === 'string' ? v.toLowerCase().trim() : '';
  return s === 'approved' || s === 'rejected' || s === 'pending' ? s : null;
}

// TS inference bazen Postgrest zincirinde update() parametresini `never` yapıyor.
// Patch’i önce tablo tipine göre doğrulayıp sonra bilinçli `never` veriyoruz.
function asUpdateParam<T>(u: T) {
  return u as unknown as never;
}

/* --------------------------------- Route --------------------------------- */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // 1) body
  const body = (await req.json().catch(() => null)) as Partial<Body> | null;
  const status = parseStatus(body?.status);
  if (!id || !status) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  // 2) supabase ve kullanıcı
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 3) rol kontrolü
  type UserRoleOnly = Pick<UsersRow, 'role'>;
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id as UsersRow['id'])
    .single<UserRoleOnly>();

  if (meErr || !me || !['Admin', 'Manager'].includes(String(me.role))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4) hedef sadece pending satırlar; yeni değer approved|rejected olmalı
  if (status === 'pending') {
    return NextResponse.json({ error: 'no_op' }, { status: 400 });
  }

  // 5) Atomik update: hem id hem de mevcut status = 'pending' koşuluyla
  const patch = { status, updated_at: new Date().toISOString() } satisfies RequestUpd;

  const { data, error } = await supabase
    .from('requests')
    .update(asUpdateParam<RequestUpd>(patch))
    .eq('id', id as RequestId)
    .eq('status', 'pending' satisfies ReqStatus)
    .select('id, status')
    .maybeSingle<Pick<RequestRow, 'id' | 'status'>>(); // null => kilit/uyuşmazlık

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    // id var ama satır pending değil → kilit
    return NextResponse.json({ error: 'status_locked' }, { status: 409 });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
