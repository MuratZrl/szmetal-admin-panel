// app/api/clients/users/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { isAppStatus, isUUID } from '@/features/clients/constants/users';

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

  const { data: myRow, error: meErr } = await userSb
    .from('users')
    .select('role, status')
    .eq('id', me.id)
    .single();

  if (meErr || !myRow || myRow.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2) Servis anahtarıyla RLS bypass ederek update yap
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SRV) {
    return NextResponse.json({ error: 'Service key missing' }, { status: 500 });
  }

  const adminSb = createClient<Database>(URL, SRV, { auth: { persistSession: false } });

  const { data, error } = await adminSb
    .from('users')
    .update({ status: body.status as Database['public']['Tables']['users']['Row']['status'] })
    .eq('id', body.userId as Database['public']['Tables']['users']['Row']['id'])
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
