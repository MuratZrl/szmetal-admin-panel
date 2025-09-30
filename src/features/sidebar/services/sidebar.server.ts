// src/features/sidebar/services/sidebar.server.ts
// 'use server';  // Bu bir Server Action değil; istersen kaldır. Zararı yok.

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Role } from '../types';

export type SidebarInitialData = {
  role: Role | null;
  unreadCount: number;
  userId: string | null;
};

export async function getSidebarInitialData(): Promise<SidebarInitialData> {
  const sb = await createSupabaseServerClient(); // ← isim düzeltildi

  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { role: null, unreadCount: 0, userId: null };
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
