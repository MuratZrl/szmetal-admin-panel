// app/api/clients/users/delete/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type UsersRow = Database['public']['Tables']['users']['Row'];
type OnlyId = Pick<UsersRow, 'id'>;
type OnlyRole = Pick<UsersRow, 'role'>;

type Json = Record<string, unknown>;
function json<T extends Json>(body: T, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined = typeof init === 'number' ? { status: init } : init;
  const res = NextResponse.json(body, resInit);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

type Payload = { userId?: string };
function pickUserId(v: unknown): string | null {
  if (typeof v !== 'object' || v === null) return null;
  const id = (v as Payload).userId;
  if (typeof id !== 'string') return null;
  const t = id.trim();
  return t.length > 0 ? t : null;
}

/** Service client: SADECE server’da, env’de SERVICE ROLE gerektirir. */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!srv) throw new Error('[supabase] SUPABASE_SERVICE_ROLE_KEY eksik');
  return createClient<Database>(url, srv, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseRouteClient();

  // 1) Kimlik + rol kontrolü
  const { data: auth, error: authErr } = await sb.auth.getUser();
  if (authErr || !auth.user) return json({ error: 'unauthorized' }, 401);

  const meResp = await sb.from('users').select('role').eq('id', auth.user.id).maybeSingle();
  const meRow = meResp.data as OnlyRole | null;

  if (meResp.error || !meRow) return json({ error: 'profile_missing' }, 403);
  if (meRow.role !== 'Admin') return json({ error: 'forbidden' }, 403);

  // 2) Body
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const userId = pickUserId(payload);
  if (!userId) return json({ error: 'user_id_missing' }, 400);
  if (userId === auth.user.id) return json({ error: 'cannot_delete_self' }, 400);

  // 3) Son admin’i silmeyi engelle
  const adminsResp = await sb.from('users').select('id').eq('role', 'Admin');
  const admins = adminsResp.data as OnlyId[] | null;

  if ((admins?.length ?? 0) <= 1 && admins?.[0]?.id === userId) {
    return json({ error: 'cannot_delete_last_admin' }, 409);
  }

  // 4) Gerçek silme: auth.users → cascade ile public.users da gider
  const admin = getSupabaseAdmin();
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: 'delete_failed', details: delErr.message }, 409);

  return json({ ok: true });
}

// Diğer methodları kapat
export async function GET() {
  return json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
}
export async function PUT()     { return GET(); }
export async function PATCH()   { return GET(); }
export async function DELETE()  { return GET(); }
export async function OPTIONS() { return GET(); }
