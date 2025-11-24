// src/features/products_analytics/services/table.server.ts
import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { ProductAnalyticsRow } from '@/features/products_analytics/components/datagrid/columns';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import type { CategoryTree } from '@/features/products/forms/helpers';
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';
import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];

function humanizeFallback(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.trim();
  if (!s) return null;
  if (isSlugLike(s)) {
    return humanizeSystemSlug(s);
  }
  return s;
}

export async function getProductAnalyticsRows(): Promise<ProductAnalyticsRow[]> {
  const supabase = await createSupabaseServerClient();

  const [{ data, error }, dicts] = await Promise.all([
    supabase
      .from('products')
      .select(
        `
          id,
          code,
          name,
          variant,
          category,
          sub_category,
          unit_weight_g_pm,
          has_customer_mold,
          availability
        `,
      )
      .order('code', { ascending: true }),
    fetchProductDicts(),
  ]);

  if (error || !data) {
    return [];
  }

  const rows = data as ProductsRow[];

  // ---- Varyant: key -> label map’i ----
  const variantLabelByKey: Record<string, string> = {};
  for (const v of dicts.variants ?? []) {
    const key =
      typeof v.key === 'string'
        ? v.key.trim()
        : typeof v.key === 'number'
        ? String(v.key)
        : '';
    if (!key) continue;

    const rawName = typeof v.name === 'string' ? v.name.trim() : '';
    const name =
      rawName && !isSlugLike(rawName)
        ? rawName
        : humanizeSystemSlug(key);

    variantLabelByKey[key] = name;
  }

  // ---- Kategori & alt kategori: slug -> label map’i ----
  const categoryLabelBySlug: Record<string, string> = {};
  const subcategoryLabelBySlug: Record<string, string> = {};
  const tree = (dicts.categoryTree ?? {}) as CategoryTree;

  for (const [slug, node] of Object.entries(tree)) {
    if (!slug) continue;

    const rawCatName = typeof node.name === 'string' ? node.name.trim() : '';
    const categoryName =
      rawCatName && !isSlugLike(rawCatName)
        ? rawCatName
        : humanizeSystemSlug(slug);

    categoryLabelBySlug[slug] = categoryName;

    for (const sub of node.subs) {
      if (!sub.slug) continue;

      const rawSubName = typeof sub.name === 'string' ? sub.name.trim() : '';
      const subName =
        rawSubName && !isSlugLike(rawSubName)
          ? rawSubName
          : humanizeSystemSlug(sub.slug);

      subcategoryLabelBySlug[sub.slug] = subName;
    }
  }

  const mapped: ProductAnalyticsRow[] = rows.map((row) => {
    const variantKey =
      typeof row.variant === 'string'
        ? row.variant.trim()
        : row.variant != null
        ? String(row.variant)
        : '';

    const categoryKeyRaw =
      typeof row.category === 'string'
        ? row.category.trim()
        : row.category != null
        ? String(row.category)
        : '';

    const subCategoryKeyRaw =
      typeof row.sub_category === 'string'
        ? row.sub_category.trim()
        : row.sub_category != null
        ? String(row.sub_category)
        : '';

    const categoryKeyNorm = categoryKeyRaw.replace(/_/g, '-');
    const subCategoryKeyNorm = subCategoryKeyRaw.replace(/_/g, '-');

    const variantLabel =
      (variantKey && variantLabelByKey[variantKey]) ||
      humanizeFallback(variantKey);

    const categoryLabel =
      (categoryKeyNorm && categoryLabelBySlug[categoryKeyNorm]) ||
      (categoryKeyRaw && categoryLabelBySlug[categoryKeyRaw]) ||
      humanizeFallback(categoryKeyRaw);

    const subCategoryLabel =
      (subCategoryKeyNorm &&
        subcategoryLabelBySlug[subCategoryKeyNorm]) ||
      (subCategoryKeyRaw &&
        subcategoryLabelBySlug[subCategoryKeyRaw]) ||
      humanizeFallback(subCategoryKeyRaw);

    return {
      id: row.id, // uuid string
      code: row.code ?? '',
      name: row.name ?? '',
      variant: variantLabel,
      category: categoryLabel,
      sub_category: subCategoryLabel,
      unit_weight_g_pm:
        typeof row.unit_weight_g_pm === 'number'
          ? row.unit_weight_g_pm
          : null,
      has_customer_mold:
        typeof row.has_customer_mold === 'boolean'
          ? row.has_customer_mold
          : null,
      availability:
        typeof row.availability === 'boolean'
          ? row.availability
          : null,
    };
  });

  return mapped;
}
