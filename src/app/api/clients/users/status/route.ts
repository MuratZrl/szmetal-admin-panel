// app/api/clients/users/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { isAppStatus, isUUID } from '@/features/clients/constants/users';
import type { Database } from '@/types/supabase';

type Body = { userId: string; status: string };

type Users       = Database['public']['Tables']['users'];
type UsersRow    = Users['Row'];
type UsersUpdate = Users['Update'];
type Status      = UsersRow['status'];
type UserSlim    = Pick<UsersRow, 'id' | 'status'>;

// TS'in update(...) parametresini 'never' zannetmesini geçersiz kılmak için
function asUpdateParam<T>(u: T) {
  return u as unknown as never;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isUUID(body.userId) || !isAppStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createSupabaseRouteClient();

  // 1) Patch'i tablo tipine karşı garanti altına al
  const patch = { status: body.status as Status } satisfies UsersUpdate;

  // 2) Update'e 'never' vererek TS'in inference tripini atlat
  const { data, error } = await supabase
    .from('users')
    .update(asUpdateParam<UsersUpdate>(patch))
    .eq('id', body.userId as UsersRow['id'])
    .select('id, status')
    .single<UserSlim>();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
