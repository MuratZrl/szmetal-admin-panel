// app/api/clients/users/status/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { isAppStatus, isUUID } from '@/features/clients/constants/users';

type UsersRow = Database['public']['Tables']['users']['Row'];
type RoleStatus = Pick<UsersRow, 'role' | 'status'>;
type IdStatus = Pick<UsersRow, 'id' | 'status'>;

type Body = { userId: string; status: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isUUID(body.userId) || !isAppStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // 1) Oturum sahibini bul ve Admin mi kontrol et
  const userSb = await createSupabaseRouteClient(); // session’lı client
  const { data: auth } = await userSb.auth.getUser();
  const me = auth?.user ?? null;
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const meResp = await userSb.from('users').select('role, status').eq('id', me.id).maybeSingle();
  const myRow = meResp.data as RoleStatus | null;

  if (meResp.error || !myRow || myRow.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2) Servis anahtarıyla RLS bypass ederek update yap
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SRV) {
    return NextResponse.json({ error: 'Service key missing' }, { status: 500 });
  }

  const adminSb = createClient<Database>(URL, SRV, { auth: { persistSession: false } });

  const newStatus = body.status as UsersRow['status'];

  const updResp = await adminSb
    .from('users')
    .update({ status: newStatus })
    .eq('id', body.userId as UsersRow['id'])
    .select('id, status')
    .single();

  const data = updResp.data as IdStatus | null;

  if (updResp.error || !data) {
    return NextResponse.json({ error: updResp.error?.message ?? 'Update failed' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
