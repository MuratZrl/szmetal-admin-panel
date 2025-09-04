// src/features/products/services/products.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { ProductFilters } from '../types';
import type { Row, Product } from '../model';
import { mapRowToProduct, mapProductPatchToRow } from '../model';

export async function fetchProductById(id: number | string) {
  const sb = await createSupabaseServerClient();
  const pid = typeof id === 'string' ? Number(id) : id;

  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', pid)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToProduct(data) : null;
}

export async function updateProduct(
  id: number | string,
  patch: Parameters<typeof mapProductPatchToRow>[0]
) {
  const sb = await createSupabaseServerClient();
  const pid = typeof id === 'string' ? Number(id) : id;
  const dbPatch = mapProductPatchToRow(patch);

  const { data, error } = await sb
    .from('products')
    .update(dbPatch)
    .eq('id', pid)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Product not found');
  return mapRowToProduct(data);
}

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const clampPage = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 1);

export async function fetchFilteredProducts(
  filters: ProductFilters,
  opts: { page: number; pageSize: number }
): Promise<ProductPage> {
  const sb = await createSupabaseServerClient();

  const pageSize = Math.max(1, opts.pageSize);
  const page = clampPage(opts.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = sb.from('products').select('*', { count: 'exact' });

  if (filters.q?.trim()) {
    const t = filters.q.trim();
    // İki kolonda arama
    q = q.or(`code.ilike.%${t}%,name.ilike.%${t}%`);
    // Bazı PostgREST sürümlerinde parantez isteyebilir:
    // q = q.or(`(code.ilike.%${t}%,name.ilike.%${t}%)`);
  }
  if (filters.categories?.length) q = q.in('category', filters.categories as Row['category'][]);
  if (filters.subCategories?.length) q = q.in('sub_category', filters.subCategories);
  if (filters.variants?.length) q = q.in('variant', filters.variants as Row['variant'][]);

  // UI kg veriyorsa sunucuda gr/m'ye çevir
  if (typeof filters.wMin === 'number') q = q.gte('unit_weight_g_pm', Math.round(filters.wMin * 1000));
  if (typeof filters.wMax === 'number') q = q.lte('unit_weight_g_pm', Math.round(filters.wMax * 1000));

  if (filters.from) q = q.gte('date', filters.from);
  if (filters.to) q = q.lte('date', filters.to);

  switch (filters.sort) {
    case 'date-desc':   q = q.order('date', { ascending: false }); break;
    case 'date-asc':    q = q.order('date', { ascending: true }); break;

    case 'weight-asc':  q = q.order('unit_weight_g_pm', { ascending: true }); break;
    case 'weight-desc': q = q.order('unit_weight_g_pm', { ascending: false }); break;

    case 'code-asc':    q = q.order('code', { ascending: true }); break;
    case 'code-desc':   q = q.order('code', { ascending: false }); break;
    default:            q = q.order('created_at', { ascending: false }); break;
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []).map(mapRowToProduct),
    total,
    page,
    pageSize,
    pageCount,
  };
}
