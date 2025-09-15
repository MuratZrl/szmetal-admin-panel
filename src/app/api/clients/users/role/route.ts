// app/api/clients/users/role/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { isAppRole, isUUID } from '@/features/clients/constants/users';

type Body = { userId: string; role: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isUUID(body.userId) || !isAppRole(body.role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('users')
    .update({ role: body.role })
    .eq('id', body.userId)
    .select('id, role')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.id, role: data.role });
}
