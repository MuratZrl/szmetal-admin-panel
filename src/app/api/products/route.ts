// app/api/products/route.ts  (POST: create)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/supabase/auth/routeGuards';
import type { Database } from '@/types/supabase';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

export async function POST(req: NextRequest) {
  const body: ProductInsert = await req.json();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value, set() {}, remove() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const role = profile?.role as Role | undefined;
  if (role !== 'Admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase.from('products').insert(body).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 201 });
}
