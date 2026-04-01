// src/app/api/notifications/read-all/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

export async function POST() {
  const sb = await createSupabaseRouteClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await sb
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: data?.length ?? 0 });
}
