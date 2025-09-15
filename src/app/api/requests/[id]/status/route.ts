// app/api/requests/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { RequestStatus } from '@/features/requests/types';

type Body = { status: Extract<RequestStatus, 'approved' | 'rejected' | 'pending'> };

function parseStatus(v: unknown): Body['status'] | null {
  const s = typeof v === 'string' ? v.toLowerCase().trim() : '';
  return s === 'approved' || s === 'rejected' || s === 'pending' ? s : null;
}

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
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 3) rol kontrolü (örnek: public.users(role) tablosu varsayımı)
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (meErr || !me || !['Admin','Manager'].includes(String(me.role))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4) hedef sadece pending satırlar; yeni değer approved|rejected olmalı
  if (status === 'pending') {
    return NextResponse.json({ error: 'no_op' }, { status: 400 });
  }

  // 5) Atomik update: hem id hem de mevcut status = 'pending' koşuluyla
  const { data, error } = await supabase
    .from('requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, status')
    .maybeSingle(); // 0 satır güncellenirse error yerine null dönebilir

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    // id var ama satır pending değil → kilit
    return NextResponse.json({ error: 'status_locked' }, { status: 409 });
  }

  return NextResponse.json({ id: data.id, status: data.status as RequestStatus });
}
