// app/api/clients/users/role/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { isAppRole, isUUID } from '@/features/clients/constants/users';
import type { Database } from '@/types/supabase';

type Body = { userId: string; role: string };

type Users = Database['public']['Tables']['users'];
type UsersRow = Users['Row'];
type UserSlim = Pick<UsersRow, 'id' | 'role'>;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isUUID(body.userId) || !isAppRole(body.role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createSupabaseRouteClient();

  // Tek round-trip: update + select + single<T>
  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', body.userId)
    .single<UserSlim>(); // <- generic burada

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, role: data.role });
}
