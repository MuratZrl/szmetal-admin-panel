// src/features/dashboard/services/activityFeed.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type ActivityType = 'new_user' | 'new_product';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  message: string;
  status: string | null;
  timestamp: string;
  actorName: string | null;
};

export async function fetchRecentActivity(limit = 15): Promise<ActivityItem[]> {
  const supabase = await createSupabaseServerClient();

  // 1) Recent new users
  const { data: newUsers } = await supabase
    .from('users')
    .select('id, username, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // 2) Recent new products
  const { data: newProducts } = await supabase
    .from('products')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3) Merge into unified list
  const items: ActivityItem[] = [];

  for (const u of newUsers ?? []) {
    items.push({
      id: `user-${u.id}`,
      type: 'new_user',
      message: `${u.username ?? 'Yeni kullanıcı'} sisteme kaydoldu.`,
      status: null,
      timestamp: u.created_at,
      actorName: u.username,
    });
  }

  for (const p of newProducts ?? []) {
    items.push({
      id: `product-${p.id}`,
      type: 'new_product',
      message: `"${p.name ?? 'Ürün'}" ürünü eklendi.`,
      status: null,
      timestamp: p.created_at,
      actorName: null,
    });
  }

  // Sort by newest first, limit
  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return items.slice(0, limit);
}
