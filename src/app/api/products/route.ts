// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { Database, Tables } from '@/types/supabase';

// Üstte:
type UsersRow = Tables<'users'>;
type Role = UsersRow['role'];
type UserId = UsersRow['id'];

type Products      = Database['public']['Tables']['products'];
type ProductRow    = Products['Row'];
type ProductInsert = Products['Insert'];

// Tiny helper: update’de yaptığımızın aynısı
function asInsertParam<T>(v: T) {
  return v as unknown as never;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();

  // 1) Auth
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Role check
  const { data: prof, error: profErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id as UserId)
    .single<{ role: Role }>();

  if (profErr || !prof) {
    return NextResponse.json(
      { error: profErr?.message ?? 'Profile not found' },
      { status: 400 }
    );
  }
  if (prof.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3) Payload
  const input = (await req.json()) as ProductInsert;

  // 4) Insert (tip güvenli + TS’e trip attırmayan)
  const { data, error } = await supabase
    .from('products')
    .insert(asInsertParam<ProductInsert>(input))
    .select('*')
    .single<ProductRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
