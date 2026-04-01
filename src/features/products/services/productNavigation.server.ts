// src/features/products/services/productNavigation.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type AdjacentProductIds = {
  newerId: string | null;
  olderId: string | null;
};

type Row = { id: string; created_at: string | null };

export async function fetchAdjacentProductIds(params: {
  id: string;
  createdAt: string;
}): Promise<AdjacentProductIds> {
  const supabase = await createSupabaseServerClient();
  const { id, createdAt } = params;

  // Run both queries in parallel instead of sequentially
  const [newer, older] = await Promise.all([
    supabase
      .from('products')
      .select('id, created_at')
      .or(`created_at.gt.${createdAt},and(created_at.eq.${createdAt},id.gt.${id})`)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle<Row>(),
    supabase
      .from('products')
      .select('id, created_at')
      .or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle<Row>(),
  ]);

  return {
    newerId: newer.data?.id ?? null,
    olderId: older.data?.id ?? null,
  };
}