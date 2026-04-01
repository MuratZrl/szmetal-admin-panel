// src/features/sidebar/services/sidebar.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import type { Role } from '../types';
import type { Tables } from '@/types/supabase';

type Status = Tables<'users'>['status'];

export type SidebarInitialData = {
  role: Role | null;
  status: Status | null;
  unreadCount: number;
  userId: string | null;
};

export async function getSidebarInitialData(): Promise<SidebarInitialData> {
  const sb = await createSupabaseServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { role: null, status: null, unreadCount: 0, userId: null };
  }

  const [roleRes, unreadRes] = await Promise.all([
    sb.from('users')
      .select('role,status')
      .eq('id', user.id)
      .single<{ role: Role; status: Status }>(),
    sb.from('notifications')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .is('read_at', null),
  ]);

  return {
    role: roleRes.data?.role ?? null,
    status: roleRes.data?.status ?? null,
    unreadCount: unreadRes.count ?? 0,
    userId: user.id,
  };
}
