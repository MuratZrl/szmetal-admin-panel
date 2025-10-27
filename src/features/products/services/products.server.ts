// src/features/products/services/products.server.ts
'use server';

import {
  createSupabaseServerClient,   // read-only
  createSupabaseRouteClient,    // yazabilir
} from '@/lib/supabase/supabaseServer';

import type { ProductFilters } from '@/features/products/types';
import { mapRowToProduct, mapProductPatchToRow } from '@/features/products/types';
import type { Database } from '@/types/supabase';

type ProductsRow   = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

const clampPage = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 1);

function parseNumericId(id: string | number): number {
  return typeof id === 'string' ? Number(id) : id;
}

// --- küçük yardımcı: Update=never ise çağrıyı sakinleştir ---
function asUpdateParam(u: ProductUpdate) {
  // Not: 'any' yok. 'never' TS için kabul edilebilir bir cast.
  return (u as unknown) as never;
}

/* -----------------------------------------------------------------------------
 * Fetch helpers
 * ---------------------------------------------------------------------------*/

// NOT: productCanonicalPath bu dosyada export edilirse Next “async zorunluluğu” yüzünden şikayet eder.
// Onu utils/url.ts içinde tut.

export async function fetchProductById(id: string | number): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();
  const pid = parseNumericId(id);

  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', pid)
    .maybeSingle();

  if (error) return null;
  return (data ?? null) as ProductsRow | null;
}

// Geriye dönük uyumluluk: profile_code artık yok.
// Bu fonksiyon çağrılırsa code üzerinden baksın ve sessizce iş görsün.
export async function fetchProductByProfileCode(profileCode: string): Promise<ProductsRow | null> {
  return fetchProductByCode(profileCode);
}

export async function fetchProductByCode(code: string): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();

  const val = code.trim();
  if (!val) return null;

  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('code', val)
    .maybeSingle();

  if (error) return null;
  return (data ?? null) as ProductsRow | null;
}

/** Tek anahtar üzerinden çöz:
 *  - sayıysa id
 *  - değilse önce code
 *  - bulunamazsa manufacturer_code, sonra temp_code
 */
export async function fetchProductByKey(key: string | number): Promise<ProductsRow | null> {
  if (typeof key === 'number') return fetchProductById(key);

  const raw = key.trim();
  if (!raw) return null;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && String(asNumber) === raw) {
    return fetchProductById(asNumber);
  }

  // 1) code
  const byCode = await fetchProductByCode(raw);
  if (byCode) return byCode;

  // 2) manufacturer_code
  {
    const sb = await createSupabaseServerClient();
    const { data } = await sb.from('products').select('*').eq('manufacturer_code', raw).maybeSingle();
    if (data) return data as ProductsRow;
  }

  // 3) temp_code
  {
    const sb = await createSupabaseServerClient();
    const { data } = await sb.from('products').select('*').eq('temp_code', raw).maybeSingle();
    if (data) return data as ProductsRow;
  }

  return null;
}

/* -----------------------------------------------------------------------------
 * Update
 * ---------------------------------------------------------------------------*/

export async function updateProduct(
  id: number | string,
  patch: Parameters<typeof mapProductPatchToRow>[0]
) {
  const sb  = await createSupabaseRouteClient();
  const pid = parseNumericId(id);

  // UI -> DB patch
  const dbPatch: ProductUpdate = mapProductPatchToRow(patch) as ProductUpdate;

  const { data, error } = await sb
    .from('products')
    .update(asUpdateParam(dbPatch))   // ← burada 'never' cast ile derleyiciyi susturuyoruz
    .eq('id', pid)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Product not found');

  return mapRowToProduct(data as ProductsRow);
}

/* -----------------------------------------------------------------------------
 * Pagination + filters
 * ---------------------------------------------------------------------------*/

export type ProductPage = {
  items: ReturnType<typeof mapRowToProduct>[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

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
    // code + name + manufacturer_code + temp_code
    q = q.or(
      [
        `code.ilike.%${t}%`,
        `name.ilike.%${t}%`,
        `manufacturer_code.ilike.%${t}%`,
        `temp_code.ilike.%${t}%`,
      ].join(',')
    );
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

  // customerMold, UI çoklu bıraktı
  const cm = (filters as unknown as { customerMold?: unknown }).customerMold;
  const moldOn =
    cm === true || cm === 'Evet' || (Array.isArray(cm) && cm.length === 1 && cm[0] === 'Evet');
  if (moldOn) q = q.eq('has_customer_mold', true);

  if (typeof filters.availability === 'boolean') q = q.eq('availability', filters.availability);
  if (filters.from) q = q.gte('date', filters.from);
  if (filters.to)   q = q.lte('date', filters.to);

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
