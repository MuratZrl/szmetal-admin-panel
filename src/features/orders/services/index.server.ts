// src/features/orders/services/inbox.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { OrderRow } from '@/features/orders/types';

type OrdersTable = Database['public']['Tables']['orders'];
type OrdersDbRow = OrdersTable['Row'];

function map(r: OrdersDbRow): OrderRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    request_id: r.request_id ? String(r.request_id) : null,
    order_code: r.order_code ?? null,
    system_slug: r.system_slug ?? null,
    system_type: r.system_type ?? null,
    message: r.message ?? '',
    status: (r.status === 'approved' ? 'approved' : 'rejected'),
    is_read: Boolean(r.is_read),
    read_at: r.read_at ?? null,
    created_at: r.created_at ?? new Date().toISOString(),
    updated_at: r.updated_at ?? new Date().toISOString(),
  };
}

export async function fetchInboxForCurrentUser(): Promise<{ userId: string; rows: OrderRow[] }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { userId: user.id, rows: (data ?? []).map(map) };
}
