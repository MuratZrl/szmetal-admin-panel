// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { OrderRow } from '@/features/orders/types';

type OrdersRow = Database['public']['Tables']['orders']['Row'];
type OrderStatus = 'approved' | 'rejected';

function toOrderRow(r: OrdersRow): OrderRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    request_id: r.request_id ? String(r.request_id) : null,
    order_code: r.order_code ?? null,
    system_slug: r.system_slug ?? null,
    system_type: r.system_type ?? null,
    message: r.message ?? '',
    status: r.status === 'approved' ? 'approved' : 'rejected',
    is_read: Boolean(r.is_read),
    read_at: r.read_at ?? null,
    created_at: r.created_at ?? new Date().toISOString(),
    updated_at: r.updated_at ?? new Date().toISOString(),
  };
}

function parseBool(v: string | null): boolean | null {
  if (v === null) return null;
  const s = v.trim().toLowerCase();
  return s === 'true' ? true : s === 'false' ? false : null;
}

function parseStatuses(v: string | null): OrderStatus[] | null {
  if (!v) return null;
  const list = v
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x === 'approved' || x === 'rejected') as OrderStatus[];
  return list.length ? list : null;
}

function computeRange(pageStr: string | null, sizeStr: string | null): { start: number; end: number } {
  const p = Number.isFinite(Number(pageStr)) && Number(pageStr) >= 0 ? Number(pageStr) : 0;
  const size = Number.isFinite(Number(sizeStr)) && Number(sizeStr) > 0 ? Number(sizeStr) : 50;
  const start = p * size;
  const end = start + size - 1;
  return { start, end };
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const statuses = parseStatuses(url.searchParams.get('status'));
  const isRead = parseBool(url.searchParams.get('isRead'));
  const { start, end } = computeRange(url.searchParams.get('page'), url.searchParams.get('pageSize'));

  let q = supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (statuses) q = q.in('status', statuses);
  if (isRead !== null) q = q.eq('is_read', isRead);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map(toOrderRow);
  return NextResponse.json({ rows });
}
