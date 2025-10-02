// app/api/[id]/requests/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* -------------------------------- Types ---------------------------------- */
type Users          = Database['public']['Tables']['users'];
type UsersRow       = Users['Row'];

type Requests       = Database['public']['Tables']['requests'];
type RequestRow     = Requests['Row'];
type RequestUpd     = Requests['Update'];
type RequestId      = RequestRow['id'];
type ReqStatus      = RequestRow['status']; // 'approved' | 'rejected' | 'pending'

type Orders         = Database['public']['Tables']['orders'];
type OrdersInsert   = Orders['Insert'];
type OrderType      = NonNullable<OrdersInsert['type']>; // 'success' | 'error' | 'info' vs

type Body = { status: ReqStatus };

/* --------------------------- Helpers ------------------------------------- */
function parseStatus(v: unknown): Body['status'] | null {
  const s = typeof v === 'string' ? v.toLowerCase().trim() : '';
  return s === 'approved' || s === 'rejected' || s === 'pending' ? s : null;
}

// TS Postgrest never susturucu
function asUpdateParam<T>(u: T) { return u as unknown as never; }
function asWriteParam<T>(u: T)  { return u as unknown as never; }

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}
function ensureSuffixOnce(base: string, suffix: string): string {
  const b = normalizeSpaces(base);
  const s = normalizeSpaces(suffix);
  return b.toLowerCase().endsWith(` ${s.toLowerCase()}`) ? b : `${b} ${s}`;
}
function humanizeSlug(slug?: string | null): string {
  if (typeof slug !== 'string') return '';
  const s = slug.replace(/[-_]+/g, ' ').trim();
  // İlk harfi büyüt, geri kalanı bırakalım
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
function buildOrderPayload(args: {
  status: Exclude<ReqStatus, 'pending'>;
  userId: RequestRow['user_id'];
  systemSlug?: string | null;
}): OrdersInsert {
  const subject = ensureSuffixOnce(
    humanizeSlug(args.systemSlug) || 'Talebiniz',
    'talebiniz'
  );
  const approved = args.status === 'approved';
  const type: OrderType = approved ? 'success' : 'error';
  const title = approved ? 'Talebiniz onaylandı' : 'Talebiniz reddedildi';
  const message = approved
    ? `${subject} başarıyla onaylandı.`
    : `${subject} reddedildi.`;

  return {
    user_id: args.userId,
    title,
    message,
    type,
    is_read: false,
  } as OrdersInsert;
}

/* --------------------------------- Route --------------------------------- */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // 1) body
  const body = (await req.json().catch(() => null)) as Partial<Body> | null;
  const status = parseStatus(body?.status);
  if (!id || !status) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  // 2) auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 3) rol
  type UserRoleOnly = Pick<UsersRow, 'role'>;
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id as UsersRow['id'])
    .single<UserRoleOnly>();

  if (meErr || !me || !['Admin', 'Manager'].includes(String(me.role))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4) pending dışı hedef yok
  if (status === 'pending') {
    return NextResponse.json({ error: 'no_op' }, { status: 400 });
  }

  // 5) status=approved|rejected güncelle
  const patch = { status, updated_at: new Date().toISOString() } satisfies RequestUpd;

  const { data: upd, error: updErr } = await supabase
    .from('requests')
    .update(asUpdateParam<RequestUpd>(patch))
    .eq('id', id as RequestId)
    .eq('status', 'pending' as ReqStatus)
    .select('id, status, user_id, system_slug')  // orders için lazım olacak alanları al
    .maybeSingle<Pick<RequestRow, 'id' | 'status' | 'user_id' | 'system_slug'>>();

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 400 });
  }
  if (!upd) {
    // id var ama satır pending değil → kilit
    return NextResponse.json({ error: 'status_locked' }, { status: 409 });
  }

  // 6) orders’a insert (onay/red bildirimi)
  const orderPayload = buildOrderPayload({
    status,
    userId: upd.user_id,
    systemSlug: upd.system_slug,
  });

  const { error: ordErr } = await supabase
    .from('orders')
    .insert(asWriteParam<OrdersInsert>(orderPayload));

  // Atomiklik yok; insert fail olursa yine de status değişti. Bunu en azından bildir.
  if (ordErr) {
    // İstersen burada log’layıp yine 200 dönebilirsin, ama ben dürüstüm:
    return NextResponse.json(
      { id: upd.id, status: upd.status, warn: 'order_insert_failed', detail: ordErr.message },
      { status: 207 } // Multi-Status vari, client tarafında uyarı gösterebilirsin
    );
  }

  return NextResponse.json({ id: upd.id, status: upd.status });
}
