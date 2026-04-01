// src/app/api/notifications/read/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

export async function POST(req: NextRequest) {
  const sb = await createSupabaseRouteClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { ids?: string[] };
  const ids = body.ids;

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
    return NextResponse.json({ error: 'ids must be an array of 1-50 UUIDs' }, { status: 400 });
  }

  const { data, error } = await sb
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)
    .eq('user_id', user.id)
    .is('read_at', null)
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: data?.length ?? 0 });
}
