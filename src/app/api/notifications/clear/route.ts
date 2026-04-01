// src/app/api/notifications/clear/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

export async function POST() {
  const sb = await createSupabaseRouteClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await sb
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
