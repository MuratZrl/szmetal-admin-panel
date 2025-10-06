// src/app/api/orders/[id]/read/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type OrdersUpdate = Database['public']['Tables']['orders']['Update'];

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    new URL(req.url).host;
  const o = origin ? new URL(origin).host : null;
  const r = referer ? new URL(referer).host : null;
  return !!host && (o === host || r === host);
}

const asUpdate = <T,>(v: T) => v as unknown as never;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'CSRF_BLOCKED' }, { status: 403 });
  }

  const { id } = await ctx.params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const patch: OrdersUpdate = { is_read: true };
  const { error } = await supabase
    .from('orders')
    .update(asUpdate<OrdersUpdate>(patch))
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
