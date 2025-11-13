// src/features/sidebar/services/sidebar.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import type { Role } from '../types';
import type { Tables } from '@/types/supabase';

type Status = Tables<'users'>['status'];

export type SidebarInitialData = {
  role: Role | null;
  status: Status | null;          // ← EKLE
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
      .select('role,status')      // ← status’u da al
      .eq('id', user.id)
      .single<{ role: Role; status: Status }>(),
    sb.from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ]);

  return {
    role: roleRes.data?.role ?? null,
    status: roleRes.data?.status ?? null,        // ← EKLE
    unreadCount: typeof unreadRes.count === 'number' ? unreadRes.count : 0,
    userId: user.id,
  };
}
