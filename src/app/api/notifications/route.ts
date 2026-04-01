// src/app/api/notifications/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { NotificationRow, NotificationListResponse } from '@/features/notifications/types';

export async function GET(req: NextRequest) {
  const sb = await createSupabaseRouteClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 20), 1), 50);

  let query = sb
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 to determine hasMore

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as NotificationRow[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const response: NotificationListResponse = { items, hasMore };
  return NextResponse.json(response);
}
