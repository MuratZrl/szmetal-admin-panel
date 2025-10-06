// app/api/requests/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* ------------------------------ Tipler ------------------------------ */
type UsersRow       = Database['public']['Tables']['users']['Row'];
type RequestsRow    = Database['public']['Tables']['requests']['Row'];
type RequestsUpdate = Database['public']['Tables']['requests']['Update'];
type OrdersInsert   = Database['public']['Tables']['orders']['Insert'];
type ReqStatus      = RequestsRow['status']; // 'pending' | 'approved' | 'rejected'
type FinalStatus = Extract<ReqStatus, 'approved' | 'rejected'>;

/* ----------------------------- Helpers ------------------------------ */
function isFinalStatus(s: string): s is FinalStatus {
  return s === 'approved' || s === 'rejected';
}

function parseStatus(v: unknown): FinalStatus | null {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return isFinalStatus(s) ? s : null;
}

function shortCodeFromUuid(id: string): string {
  // UUID → RQ-7D77EC3A
  const compact = id.replace(/-/g, '').toUpperCase();
  return `RQ-${compact.slice(0, 8)}`;
}

const asUpdate = <T,>(v: T) => v as unknown as never;
const asInsert = <T,>(v: T) => v as unknown as never;

function toOrderPayload(args: {
  status: Extract<ReqStatus, 'approved' | 'rejected'>;
  userId: RequestsRow['user_id'];
  actorId: string;                       // onay/red veren staff
  requestId: RequestsRow['id'];
  systemSlug?: string | null;
}): OrdersInsert {
  const slug = typeof args.systemSlug === 'string'
    ? args.systemSlug.replace(/[-_]+/g, ' ').trim()
    : '';
  const subject = (slug ? slug[0].toUpperCase() + slug.slice(1) : 'Talebiniz') + ' talebiniz';
  const approved = args.status === 'approved';

  return {
    user_id: args.userId,
    request_id: args.requestId,
    order_code: shortCodeFromUuid(String(args.requestId)), // ← asıl düzeltme
    system_slug: args.systemSlug ?? null,
    system_type: null,                    // elinde yoksa boş bırak
    message: approved
      ? `${subject} başarıyla onaylandı.`
      : `${subject} reddedildi.`,
    status: args.status,
    is_read: false,
    actor_id: args.actorId,
    // created_at/updated_at DB default/trigger
  };
}

/* ----------------------------- Route ------------------------------- */
export async function POST(
  req: globalThis.Request,
  ctx: { params: Promise<{ id: string }> } // Next 15: params Promise
) {
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  const next = parseStatus(body?.status);
  if (!id || !next) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // role check
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<Pick<UsersRow, 'role'>>();
  if (meErr) return NextResponse.json({ error: meErr.message }, { status: 500 });
  if (!me || (me.role !== 'Admin' && me.role !== 'Manager')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Atomik update: sadece pending → approved|rejected
  const patch: RequestsUpdate = { status: next };
  const { data: upd, error: updErr } = await supabase
    .from('requests')
    .update(asUpdate<RequestsUpdate>(patch))
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, status, user_id, system_slug')
    .maybeSingle<Pick<RequestsRow, 'id' | 'status' | 'user_id' | 'system_slug'>>();

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  if (!upd)   return NextResponse.json({ error: 'ALREADY_FINAL_OR_NOT_FOUND' }, { status: 409 });

  // orders bildirimi (RLS: staff insert izni gerekir)
  const payload = toOrderPayload({
    status: upd.status as Extract<ReqStatus, 'approved' | 'rejected'>,
    userId: upd.user_id,
    actorId: user.id,
    requestId: upd.id,
    systemSlug: upd.system_slug,
  });

  const { error: ordErr } = await supabase
    .from('orders')
    .insert(asInsert<OrdersInsert>(payload));

  if (ordErr) {
    return NextResponse.json(
      { id: upd.id, status: upd.status, warn: 'order_insert_failed', detail: ordErr.message },
      { status: 207 }
    );
  }

  return NextResponse.json({ id: upd.id, status: upd.status });
}
