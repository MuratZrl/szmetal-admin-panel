// app/api/clients/users/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { isAppStatus, isUUID } from '@/features/clients/constants/users';

type Body = { userId: string; status: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isUUID(body.userId) || !isAppStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('users')
    .update({ status: body.status })
    .eq('id', body.userId)
    .select('id, status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.id, status: data.status });
}
