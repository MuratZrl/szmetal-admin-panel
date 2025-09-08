// src/features/sidebar/services/sidebar.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Role } from '../types';

export type SidebarInitialData = {
  role: Role;
  unreadCount: number;
  userId: string | null;
};

export async function getSidebarInitialData(): Promise<SidebarInitialData> {
  const sb = await createSupabaseServerClient();

  const { data: userData } = await sb.auth.getUser();
  const user = userData?.user ?? null;

  if (!user) return { role: null, unreadCount: 0, userId: null };

  const [{ data: roleRow }, { count }] = await Promise.all([
    sb.from('users').select('role').eq('id', user.id).single(),
    sb.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
  ]);

  const role = (roleRow?.role === 'Admin' || roleRow?.role === 'User') ? roleRow.role : null;

  return {
    role,
    unreadCount: typeof count === 'number' ? count : 0,
    userId: user.id,
  };
}
