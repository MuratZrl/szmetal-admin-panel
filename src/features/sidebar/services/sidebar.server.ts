// src/features/sidebar/services/sidebar.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Role } from '../types';
import type { Database } from '@/types/supabase';

export type SidebarInitialData = {
  role: Role | null;
  unreadCount: number;
  userId: string | null;
};

// Postgrest never susturucu (projede kullandığın ile aynı mantık)
function asUpdateParam<T>(u: T) {
  return u as unknown as never;
}

// orders tablo tipleri
type OrdersTbl    = Database['public']['Tables']['orders'];
type OrdersUpdate = OrdersTbl['Update'];

export async function getSidebarInitialData(
  opts?: { eagerMarkOrdersRead?: boolean }
): Promise<SidebarInitialData> {
  const sb = await createSupabaseServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { role: null, unreadCount: 0, userId: null };
  }

  if (opts?.eagerMarkOrdersRead) {
    // 1) as const KULLANMA → readonly olmaz
    // 2) tipi OrdersUpdate ile sabitle → never meltdown yok
    const patch: OrdersUpdate = { is_read: true };

    await sb
      .from('orders')
      .update(asUpdateParam<OrdersUpdate>(patch))
      .eq('user_id', user.id)
      .eq('is_read', false);
  }

  const [roleRes, unreadRes] = await Promise.all([
    sb.from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: Role }>(),
    sb.from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ]);

  const role: Role | null = roleRes.data?.role ?? null;
  const unreadCount: number = typeof unreadRes.count === 'number' ? unreadRes.count : 0;

  return { role, unreadCount, userId: user.id };
}
