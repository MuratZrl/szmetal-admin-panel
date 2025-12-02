// src/features/products_analytics/services/table.server.ts
import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { ProductAnalyticsRow } from '@/features/products_analytics/components/datagrid/columns';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';
import type { Database } from '@/types/supabase';

type ProductsRow  = Database['public']['Tables']['products']['Row'];
type CategoryRow  = Database['public']['Tables']['categories']['Row'];

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

  const [productsRes, dicts, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select(
        `
          id,
          code,
          name,
          variant,
          category_id,
          unit_weight_g_pm,
          has_customer_mold,
          availability
        `,
      )
      .order('code', { ascending: true }),
    fetchProductDicts(),
    supabase
      .from('categories')
      .select(
        `
          id,
          slug,
          name,
          parent_id
        `,
      ),
  ]);

  if (productsRes.error || !productsRes.data) {
    return [];
  }

  const rows = productsRes.data as ProductsRow[];
  const categoryRows = (categoriesRes.data ?? []) as CategoryRow[];

  // ---- Kategori: id -> row map’i ----
  const categoriesById = new Map<string, CategoryRow>();
  for (const c of categoryRows) {
    if (!c.id) continue;
    categoriesById.set(String(c.id), c);
  }

  // Bir leaf category_id’den yukarı doğru zincir: [root, child, ...leaf]
  function getCategoryChain(catId: string | null): CategoryRow[] {
    if (!catId) return [];
    const chain: CategoryRow[] = [];
    let current = categoriesById.get(String(catId));
    let guard = 0;

    while (current && guard < 10) {
      chain.unshift(current);
      if (!current.parent_id) break;
      current = categoriesById.get(String(current.parent_id));
      guard += 1;
    }

    return chain;
  }

  function categoryLabelFromRow(cat: CategoryRow | undefined | null): string | null {
    if (!cat) return null;
    return (
      humanizeFallback(cat.name) ??
      humanizeFallback(cat.slug) ??
      cat.name ??
      cat.slug ??
      null
    );
  }

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

  const mapped: ProductAnalyticsRow[] = rows.map((row) => {
    // Varyant label
    const variantKey =
      typeof row.variant === 'string'
        ? row.variant.trim()
        : row.variant != null
        ? String(row.variant)
        : '';

    const variantLabel =
      (variantKey && variantLabelByKey[variantKey]) ||
      humanizeFallback(variantKey) ||
      '';

    // Kategori zinciri: [root, child, ...]
    const chain = getCategoryChain(row.category_id ?? null);
    const root = chain[0];
    const child = chain[1];

    const categoryLabel    = categoryLabelFromRow(root);
    const subCategoryLabel = categoryLabelFromRow(child);

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
