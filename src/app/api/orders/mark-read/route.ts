import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* Güvenli tarafta kal: same-origin kontrolü */
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    new URL(req.url).host;

  const originHost = origin ? new URL(origin).host : null;
  const refererHost = referer ? new URL(referer).host : null;

  if (!host) return false;
  return originHost === host || refererHost === host;
}

type Orders = Database['public']['Tables']['orders'];
type OrdersUpdate = Orders['Update'];

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'CSRF_BLOCKED' }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // Sadece unread olanları okundu yap
  const patch: OrdersUpdate = { is_read: true };

  const { data, error } = await supabase
    .from('orders')
    .update(patch as unknown as never)
    .eq('user_id', user.id)
    .eq('is_read', false)
    .select('id'); // count için geri dönen satırları sayarız

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cleared = Array.isArray(data) ? data.length : 0;
  return NextResponse.json({ ok: true, cleared });
}
