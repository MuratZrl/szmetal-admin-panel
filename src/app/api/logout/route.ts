// app/api/logout/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

function json<T>(body: T, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  const res = NextResponse.json(body, resInit);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function POST() {
  const sb = await createSupabaseRouteClient();
  try {
    await sb.auth.signOut();
  } catch {
    // bazı kurulumlarda "refresh_token_not_found" gelebilir; görmezden gel
  }
  return json({ ok: true }, 200);
}

export async function GET()     { return json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } }); }
export async function PUT()     { return GET(); }
export async function PATCH()   { return GET(); }
export async function DELETE()  { return GET(); }
export async function OPTIONS() { return GET(); }
