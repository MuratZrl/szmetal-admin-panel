// features/products/services/products.server.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { ProductFilters } from '@/features/products/types';
import { mapRowToProduct, mapProductPatchToRow } from '@/features/products/types';

// Tek gerçek DB tipi
type ProductsRow = Database['public']['Tables']['products']['Row'];

/**
 * Form sayfasının beklediği şey: DB satırı (snake_case).
 * page.tsx içinde mapRowToForm(product) çağırıyorsun, o DB Row istiyor.
 */
export async function fetchProductById(id: string | number): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();
  const pid = typeof id === 'string' ? Number(id) : id;

  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', pid)
    .maybeSingle();

  if (error) return null;
  return data as ProductsRow | null;
}

/**
 * Patch → DB update. Geriye domain model (Product) döndürüyoruz,
 * çünkü genelde liste/detail ekranlarında o kullanışlı.
 */
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

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Product not found');

  return mapRowToProduct(data as ProductsRow);
}

export type ProductPage = {
  items: ReturnType<typeof mapRowToProduct>[];
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
    q = q.or(`code.ilike.%${t}%,name.ilike.%${t}%`);
    // Bazı PostgREST sürümlerinde parantez isterse:
    // q = q.or(`(code.ilike.%${t}%,name.ilike.%${t}%)`);
  }

  if (filters.categories?.length) {
    q = q.in('category', filters.categories as ProductsRow['category'][]);
  }
  if (filters.subCategories?.length) {
    q = q.in('sub_category', filters.subCategories as ProductsRow['sub_category'][]);
  }
  if (filters.variants?.length) {
    q = q.in('variant', filters.variants as ProductsRow['variant'][]);
  }

  // Müşteri kalıbı filtresi (tek checkbox)
  // UI tarafında ya boolean (true) ya da string 'var' gelebilir; ikisini de destekle.
   const cm = (filters as unknown as { customerMold?: unknown }).customerMold;
   const moldOn =
     cm === true || cm === 'Evet' ||
     (Array.isArray(cm) && cm.length === 1 && cm[0] === 'Evet');
   if (moldOn) {
     q = q.eq('has_customer_mold', true);
   }

   if (typeof filters.availability === 'boolean') {
      q = q.eq('availability', filters.availability);
    }

  if (filters.from) q = q.gte('date', filters.from);
  if (filters.to) q = q.lte('date', filters.to);

  switch (filters.sort) {
    case 'date-desc':   q = q.order('date', { ascending: false }); break;
    case 'date-asc':    q = q.order('date', { ascending: true });  break;
    case 'weight-asc':  q = q.order('unit_weight_g_pm', { ascending: true });  break;
    case 'weight-desc': q = q.order('unit_weight_g_pm', { ascending: false }); break;
    case 'code-asc':    q = q.order('code', { ascending: true });  break;
    case 'code-desc':   q = q.order('code', { ascending: false }); break;
    default:            q = q.order('created_at', { ascending: false });       break;
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as ProductsRow[];
  const items = rows.map(mapRowToProduct);

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, page, pageSize, pageCount };
}
