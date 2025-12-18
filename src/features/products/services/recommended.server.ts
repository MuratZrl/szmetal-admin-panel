// src/features/products/services/recommended.server.ts
import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';
import type { Tables } from '@/types/supabase';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'categories'>;

type FetchRecommendedInput = {
  currentProductId: ProductRow['id'];
  categoryId: ProductRow['category_id'] | null;
  variant: ProductRow['variant'] | null;
  limit?: number;
};

function uniqById(rows: readonly ProductRow[]): ProductRow[] {
  const m = new Map<string, ProductRow>();
  for (const r of rows) m.set(String(r.id), r);
  return Array.from(m.values());
}

function normText(v: string | null): string | null {
  const s = (v ?? '').trim();
  return s.length > 0 ? s : null;
}

export async function fetchRecommendedProducts({
  currentProductId,
  categoryId,
  variant,
  limit: rawLimit,
}: FetchRecommendedInput): Promise<ProductRow[]> {
  const limit = Math.max(1, Math.min(rawLimit ?? 8, 24));
  const sb = await createSupabaseRSCClient();

  const results: ProductRow[] = [];

  const v = normText(variant);

  // 1) Aynı category_id
  if (categoryId) {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', currentProductId)
      .order('updated_at', { ascending: false })
      .limit(limit)
      .returns<ProductRow[]>();

    if (error) throw error;
    if (data) results.push(...data);
  }

  // 2) Yetmezse: aynı parent grubundaki kategoriler (kardeşler)
  if (categoryId && uniqById(results).length < limit) {
    const { data: cat, error: catErr } = await sb
      .from('categories')
      .select('id, parent_id')
      .eq('id', categoryId)
      .maybeSingle()
      .returns<Pick<CategoryRow, 'id' | 'parent_id'> | null>();

    if (catErr) throw catErr;

    const parentId = cat?.parent_id ?? categoryId;

    const { data: siblings, error: sibErr } = await sb
      .from('categories')
      .select('id')
      .eq('parent_id', parentId)
      .returns<Pick<CategoryRow, 'id'>[]>();

    if (sibErr) throw sibErr;

    const siblingIds = siblings?.map((c) => c.id) ?? [];
    const allIds = Array.from(new Set<string>([...siblingIds, parentId]));

    if (allIds.length > 0) {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .in('category_id', allIds)
        .neq('id', currentProductId)
        .order('updated_at', { ascending: false })
        .limit(limit * 3)
        .returns<ProductRow[]>();

      if (error) throw error;
      if (data) results.push(...data);
    }
  }

  // 3) Yetmezse: aynı variant (varsa)
  if (uniqById(results).length < limit && v) {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('variant', v)
      .neq('id', currentProductId)
      .order('updated_at', { ascending: false })
      .limit(limit * 3)
      .returns<ProductRow[]>();

    if (error) throw error;
    if (data) results.push(...data);
  }

  // 4) Son çare: en güncel ürünler
  if (uniqById(results).length < limit) {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .neq('id', currentProductId)
      .order('updated_at', { ascending: false })
      .limit(limit * 3)
      .returns<ProductRow[]>();

    if (error) throw error;
    if (data) results.push(...data);
  }

  return uniqById(results).slice(0, limit);
}
