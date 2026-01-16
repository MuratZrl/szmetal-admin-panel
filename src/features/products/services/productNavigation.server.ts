// src/features/products/services/productNavigation.server.ts
import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type AdjacentProductIds = {
  newerId: string | null; // created_at daha büyük (daha SONRA eklenen)
  olderId: string | null; // created_at daha küçük (daha ERKEN eklenen)
};

type Row = { id: string; created_at: string | null };

export async function fetchAdjacentProductIds(params: {
  id: string;
  createdAt: string;
}): Promise<AdjacentProductIds> {
  const supabase = await createSupabaseServerClient();

  const { id, createdAt } = params;

  // “Daha yeni” = (created_at > current) OR (created_at == current AND id > current)
  const newer = await supabase
    .from('products')
    .select('id, created_at')
    .or(`created_at.gt.${createdAt},and(created_at.eq.${createdAt},id.gt.${id})`)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle<Row>();

  // “Daha eski” = (created_at < current) OR (created_at == current AND id < current)
  const older = await supabase
    .from('products')
    .select('id, created_at')
    .or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle<Row>();

  return {
    newerId: newer.data?.id ?? null,
    olderId: older.data?.id ?? null,
  };
}
