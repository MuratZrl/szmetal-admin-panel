// src/app/api/products/[id]/view/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type RpcOk = { viewCount: number };

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!id || !isUuid(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const supabase = await createSupabaseRouteClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('increment_product_view', { p_id: id });

  if (error) {
    return NextResponse.json({ error: error.message ?? 'rpc_failed' }, { status: 500 });
  }

  const n =
    typeof data === 'number'
      ? data
      : typeof data === 'string'
        ? Number.parseInt(data, 10)
        : 0;

  const body: RpcOk = { viewCount: Number.isFinite(n) && n >= 0 ? n : 0 };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
