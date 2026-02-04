// src/features/products/services/recommendedBlock.server.ts
import 'server-only';

import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';

import { fetchRecommendedProducts } from '@/features/products/services/recommended.server';
import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { withVersion } from '@/features/products/utils/url';
import { mapRowToProduct, type Product } from '@/features/products/types';
import type { Tables } from '@/types/supabase';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'categories'>;

export type RecommendedBlock = {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
};

export async function buildRecommendedBlock(args: {
  currentRow: ProductRow;
  limit?: number;
}): Promise<RecommendedBlock> {
  const limit = Math.max(1, Math.min(args.limit ?? 4, 12));

  const rows = await fetchRecommendedProducts({
    currentProductId: args.currentRow.id,
    categoryId: args.currentRow.category_id ?? null,
    variant: args.currentRow.variant ?? null,
    limit,
  });

  // ✅ Leaf slug lazım: category_id -> categories.slug map’i çek
  const categoryIds = Array.from(
    new Set(
      rows
        .map((r) => r.category_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  const slugByCategoryId = new Map<string, string>();

  if (categoryIds.length > 0) {
    const sb = await createSupabaseRSCClient();
    const { data, error } = await sb
      .from('categories')
      .select('id, slug')
      .in('id', categoryIds)
      .returns<Pick<CategoryRow, 'id' | 'slug'>[]>();

    if (error) throw error;

    for (const c of data ?? []) {
      const slug = (c.slug ?? '').trim();
      if (slug) slugByCategoryId.set(String(c.id), slug);
    }
  }

  // ✅ ProductCard’ın leafSlug kuralına uy: subCategory’ye leaf slug yaz
  const products: Product[] = rows.map((r) => {
    const base = mapRowToProduct(r);

    const cid = typeof r.category_id === 'string' ? r.category_id : '';
    const leafSlug = slugByCategoryId.get(cid) ?? null;

    if (!leafSlug) return base;

    return {
      ...base,
      subCategory: leafSlug, // ProductCard leafSlug = subCategory ?? category
      category: base.category ?? leafSlug,
      subSubCategory: base.subSubCategory ?? null,
    };
  });

  const entries = await Promise.all(
    products.map(async (p) => {
      const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
      const raw = preferPdf ? p.filePath : p.image;

      const signed = await resolveStorageUrl(raw);
      const ver = withVersion(signed, p.updatedAt ?? p.createdAt ?? null);

      return [String(p.id), ver] as const;
    }),
  );

  const mediaUrlsById: Record<string, string | null> = Object.fromEntries(entries);
  return { products, mediaUrlsById };
}
