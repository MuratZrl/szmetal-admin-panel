import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/route';

export async function POST() {
  const sb = await createRouteClient();
  await sb.auth.signOut();
  return NextResponse.json({ ok: true });
}
