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
  const v = normText(variant);

  // Step 1: Get sibling category IDs in parallel with nothing (we need them for the main query)
  let siblingCategoryIds: string[] = [];

  if (categoryId) {
    const { data: cat } = await sb
      .from('categories')
      .select('parent_id')
      .eq('id', categoryId)
      .maybeSingle<Pick<CategoryRow, 'parent_id'>>();

    const parentId = cat?.parent_id ?? null;

    if (parentId) {
      const { data: siblings } = await sb
        .from('categories')
        .select('id')
        .eq('parent_id', parentId)
        .neq('id', categoryId)
        .returns<Pick<CategoryRow, 'id'>[]>();

      siblingCategoryIds = siblings?.map((c) => c.id) ?? [];
    }
  }

  // Step 2: Single query — fetch more than needed, then prioritize in JS
  // Build OR filter to grab all potentially relevant products at once
  const filters: string[] = [];

  if (categoryId) {
    filters.push(`category_id.eq.${categoryId}`);
  }
  if (siblingCategoryIds.length > 0) {
    filters.push(`category_id.in.(${siblingCategoryIds.join(',')})`);
  }
  if (v) {
    filters.push(`variant.eq.${v}`);
  }

  // If we have filters, use them; otherwise just grab latest products
  let query = sb
    .from('products')
    .select('*')
    .neq('id', currentProductId)
    .order('updated_at', { ascending: false })
    .limit(limit * 4);

  if (filters.length > 0) {
    query = query.or(filters.join(','));
  }

  const { data, error } = await query.returns<ProductRow[]>();
  if (error) throw error;

  const rows = data ?? [];

  // If we got enough from filtered query, prioritize and return
  if (rows.length >= limit) {
    return prioritize(rows, categoryId, siblingCategoryIds, v).slice(0, limit);
  }

  // Fallback: if not enough, grab latest products
  const existingIds = new Set(rows.map((r) => String(r.id)));
  existingIds.add(String(currentProductId));

  const { data: fallback } = await sb
    .from('products')
    .select('*')
    .neq('id', currentProductId)
    .order('updated_at', { ascending: false })
    .limit(limit * 3)
    .returns<ProductRow[]>();

  const combined = [
    ...rows,
    ...(fallback ?? []).filter((r) => !existingIds.has(String(r.id))),
  ];

  return prioritize(combined, categoryId, siblingCategoryIds, v).slice(0, limit);
}

/** Prioritize: same category > sibling category > same variant > rest */
function prioritize(
  rows: ProductRow[],
  categoryId: string | null,
  siblingIds: string[],
  variant: string | null,
): ProductRow[] {
  const sibSet = new Set(siblingIds);

  const scored = rows.map((r) => {
    let score = 0;
    if (categoryId && r.category_id === categoryId) score += 100;
    else if (r.category_id && sibSet.has(r.category_id)) score += 50;
    if (variant && r.variant === variant) score += 25;
    return { row: r, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Deduplicate
  const seen = new Set<string>();
  const result: ProductRow[] = [];
  for (const { row } of scored) {
    const id = String(row.id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(row);
  }

  return result;
}