// src/features/orders/services/orders.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { OrderRow } from '@/features/orders/types';

type OrdersTable = Database['public']['Tables']['orders'];
type OrdersDbRow = OrdersTable['Row'];
type OrderStatus = 'approved' | 'rejected';

type ListParams = {
  page?: number;            // 0-based
  pageSize?: number;        // default 50
  statusIn?: ReadonlyArray<OrderStatus>;
  isRead?: boolean;         // opsiyonel filtre
};

/* ----------------------------- helpers ----------------------------- */

function computeRange(page?: number, pageSize?: number): { start: number; end: number } {
  const p = typeof page === 'number' && page >= 0 ? page : 0;
  const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : 50;
  const start = p * size;
  const end = start + size - 1;
  return { start, end };
}

function map(r: OrdersDbRow): OrderRow {
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

/* ------------------------------ queries ---------------------------- */

/**
 * Login olmuş kullanıcının gelen kutusu.
 * RLS: kullanıcı kendi orders satırlarını görür, staff herkesinkini.
 */
export async function fetchOrdersForCurrentUser(
  params?: ListParams
): Promise<{ userId: string; rows: OrderRow[] }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let q = supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (params?.statusIn && params.statusIn.length > 0) {
    q = q.in('status', params.statusIn);
  }
  if (typeof params?.isRead === 'boolean') {
    q = q.eq('is_read', params.isRead);
  }

  const { start, end } = computeRange(params?.page, params?.pageSize);
  q = q.range(start, end);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return { userId: user.id, rows: (data ?? []).map(map) };
}

/**
 * Staff için belirli kullanıcının gelen kutusu.
 * RLS zaten staff’a tüm satırları açacak; normal kullanıcı çağırırsa boş gelir.
 */
export async function fetchOrdersByUserId(
  targetUserId: string,
  params?: ListParams
): Promise<OrderRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let q = supabase
    .from('orders')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (params?.statusIn && params.statusIn.length > 0) {
    q = q.in('status', params.statusIn);
  }
  if (typeof params?.isRead === 'boolean') {
    q = q.eq('is_read', params.isRead);
  }

  const { start, end } = computeRange(params?.page, params?.pageSize);
  q = q.range(start, end);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return (data ?? []).map(map);
}
