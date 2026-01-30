// src/features/products/services/products.server.ts
'use server';

/**
 * Bu modül, ürünlere ilişkin tüm server-side operasyonları toplar:
 *   - Tekil ürün fetch (id, code, manufacturer_code, temp_code)
 *   - Ürün güncelleme (updateProduct)
 *   - Listeleme + filtre + sayfalama (fetchFilteredProducts)
 *
 * Buradaki fonksiyonlar sadece server ortamında çalışır ve Supabase
 * server client'ları ile konuşur. UI tarafı doğrudan Supabase'i değil,
 * bu servis katmanını kullanır.
 */

import {
  createSupabaseServerClient, // sadece okuma (read-only) için kullanılır
  createSupabaseRouteClient,  // yazma/güncelleme (mutasyon) için kullanılır
} from '@/lib/supabase/supabaseServer';

import type { ProductFilters, Product } from '@/features/products/types';
import { mapRowToProduct, mapProductPatchToRow } from '@/features/products/types';

import { capitalizeProductName } from '@/utils/capitalizeProductName';

import type { Database } from '@/types/supabase';

// Supabase şemasından tipleri türetiyoruz. Böylece kolon yapısı değişirse
// derleme aşamasında uyarı alırız.
type ProductsRow = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

/**
 * Listeleme tarafında kullanmak için, products satırını category join’li
 * versiyonuyla temsil ediyoruz. Supabase select içinde:
 *
 *   category:categories!products_category_id_fkey ( id, slug )
 *
 * dediğimizde gelen şekil budur.
 */
type ProductsRowWithCategory = ProductsRow & {
  category?: {
    id: CategoryRow['id'];
    slug: CategoryRow['slug'];
  } | null;
};

/**
 * ✅ Detail sayfasında gerçek ihtiyacımız olan:
 * products.category_id -> categories (leaf) -> parent -> grandparent
 * Bu join yapısı ile 3 seviyeye kadar slug alabiliriz.
 */
type CategoryJoin3 = {
  id: CategoryRow['id'];
  slug: CategoryRow['slug'];
  parent: {
    id: CategoryRow['id'];
    slug: CategoryRow['slug'];
    parent: {
      id: CategoryRow['id'];
      slug: CategoryRow['slug'];
    } | null;
  } | null;
};

type ProductsRowWithCategoryChain = ProductsRow & {
  category?: CategoryJoin3 | null;

  // ✅ created_by -> users join'inden gelecek alan
  created_by_user?: {
    username: string | null;
  } | null;
};

/**
 * mapRowWithCategoryToProduct:
 *   - DB satırını önce eski mapRowToProduct ile domain Product’a çeviriyor
 *   - Sonra category join’den gelen slug’ı kullanarak Product.subCategory’yi dolduruyor
 *
 * Şu an için sadece leaf slug’ı kullanıyoruz; parent/root zinciriyle
 * uğraşmıyoruz. Chip zaten tek label ile de çalışıyor.
 */
function mapRowWithCategoryToProduct(row: ProductsRowWithCategory): Product {
  const base = mapRowToProduct(row as ProductsRow);

  const leafSlug = row.category?.slug ?? null;

  return {
    ...base,
    // Leaf slug’ı tek satır için yeterliydi.
    subCategory: leafSlug ?? null,
  };
}

/**
 * ✅ Detail (products/[id]) için doğru mapper:
 * leaf + parent + grandparent slug’larını çözerek
 * Product.category / subCategory / subSubCategory alanlarını doldurur.
 */
// ❗️EXPORT YOK: bu sadece helper. 'use server' dosyasında export edersen Next bunu action sayıyor.
function mapRowWithCategoryChainToProduct(row: ProductsRowWithCategoryChain): Product {
  const base = mapRowToProduct(row as ProductsRow);

  const leaf = row.category?.slug ?? null;
  const parent = row.category?.parent?.slug ?? null;
  const grand = row.category?.parent?.parent?.slug ?? null;

  let category: string | null = null;
  let subCategory: string | null = null;
  let subSubCategory: string | null = null;

  if (leaf && parent && grand) {
    category = String(grand);
    subCategory = String(parent);
    subSubCategory = String(leaf);
  } else if (leaf && parent) {
    category = String(parent);
    subCategory = String(leaf);
    subSubCategory = null;
  } else if (leaf) {
    category = String(leaf);
    subCategory = null;
    subSubCategory = null;
  }

  return { ...base, category, subCategory, subSubCategory };
}

/**
 * clampPage:
 *   Sayfa numarasını normalize eder.
 *   - Geçerli bir sayı ve 0'dan büyükse aşağı yuvarlayarak kullan
 *   - Değilse 1. sayfaya düş
 */
const clampPage = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 1);

/**
 * asUpdateParam:
 *   Supabase update çağrısına verilecek patch objesini,
 *   infer tip uyuşmazlıklarında TypeScript’i sakinleştirmek için kullanır.
 */
function asUpdateParam(u: ProductUpdate) {
  return (u as unknown) as never;
}

/* -----------------------------------------------------------------------------
 * Fetch helpers (tekil ürün okuma)
 * ---------------------------------------------------------------------------*/

/**
 * fetchProductById:
 *   Verilen uuid id'ye sahip ürünü döndürür.
 *   - Bulunamazsa null
 *   - Supabase hatasında da null
 *
 * Dikkat: Burada sadece products tablosunu okur (join yok).
 */
export async function fetchProductById(id: string): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();

  const val = id.trim();
  if (!val) return null;

  const { data, error } = await sb.from('products').select('*').eq('id', val).maybeSingle();

  if (error) return null;
  return (data ?? null) as ProductsRow | null;
}

/**
 * ✅ products/[id] sayfası için: ürün + kategori zinciri (leaf->parent->grand)
 * Bu fonksiyon tam olarak “detail page’de neden kategori yok” sorununu çözer.
 */
export async function fetchProductByIdWithCategoryChain(
  id: string,
): Promise<ProductsRowWithCategoryChain | null> {
  const sb = await createSupabaseServerClient();

  const val = id.trim();
  if (!val) return null;

  const { data, error } = await sb
    .from('products')
    .select(
      `
        *,
        category:categories!products_category_id_fkey (
          id,
          slug,
          parent:parent_id (
            id,
            slug,
            parent:parent_id (
              id,
              slug
            )
          )
        ),
        created_by_user:users!products_created_by_fkey (
          username
        )
      `,
    )
    .eq('id', val)
    .maybeSingle();

  if (error) return null;
  return (data ?? null) as ProductsRowWithCategoryChain | null;
}


// ✅ BUNU KULLAN: products/[id] detail için direkt Product döndürür.
export async function fetchProductDetailById(id: string): Promise<Product | null> {
  const row = await fetchProductByIdWithCategoryChain(id);
  if (!row) return null;
  return mapRowWithCategoryChainToProduct(row);
}

/**
 * fetchProductByProfileCode:
 *   Eski API ile geriye dönük uyumluluk için bırakılmış bir alias.
 */
export async function fetchProductByProfileCode(profileCode: string): Promise<ProductsRow | null> {
  return fetchProductByCode(profileCode);
}

/**
 * fetchProductByCode:
 *   "code" alanı benzersiz kabul edilerek, tekil ürün döndürür.
 */
export async function fetchProductByCode(code: string): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();

  const val = code.trim();
  if (!val) return null;

  const { data, error } = await sb.from('products').select('*').eq('code', val).maybeSingle();
  if (error) return null;

  return (data ?? null) as ProductsRow | null;
}

/**
 * fetchProductByKey:
 *   Tek bir "key" üzerinden ürünü çözmeye çalışan çok amaçlı helper.
 */
export async function fetchProductByKey(key: string | number): Promise<ProductsRow | null> {
  const raw = String(key).trim();
  if (!raw) return null;

  const byId = await fetchProductById(raw);
  if (byId) return byId;

  const byCode = await fetchProductByCode(raw);
  if (byCode) return byCode;

  const sb = await createSupabaseServerClient();

  {
    const { data } = await sb.from('products').select('*').eq('manufacturer_code', raw).maybeSingle();
    if (data) return data as ProductsRow;
  }

  {
    const { data } = await sb.from('products').select('*').eq('temp_code', raw).maybeSingle();
    if (data) return data as ProductsRow;
  }

  return null;
}

/* -----------------------------------------------------------------------------
 * Update (ürün güncelleme)
 * ---------------------------------------------------------------------------*/

export async function updateProduct(id: string, patch: Parameters<typeof mapProductPatchToRow>[0]) {
  const sb = await createSupabaseRouteClient();

  const normalizedPatch = {
    ...patch,
    name: patch.name ? capitalizeProductName(patch.name) : patch.name,
  };

  const dbPatch = mapProductPatchToRow(normalizedPatch) as ProductUpdate;

  const { data, error } = await sb
    .from('products')
    .update(asUpdateParam(dbPatch))
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Product not found');

  return mapRowToProduct(data as ProductsRow);
}

/* -----------------------------------------------------------------------------
 * Pagination + filters (listeleme)
 * ---------------------------------------------------------------------------*/

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function fetchFilteredProducts(
  filters: ProductFilters,
  opts: { page: number; pageSize: number },
): Promise<ProductPage> {
  const sb = await createSupabaseServerClient();

  const pageSize = Math.max(1, opts.pageSize);
  const page = clampPage(opts.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = sb
    .from('products')
    .select(
      `
        *,
        category:categories!products_category_id_fkey (
          id,
          slug
        )
      `,
      { count: 'exact' },
    );

  if (filters.q?.trim()) {
    const t = filters.q.trim();
    q = q.or(
      [
        `code.ilike.%${t}%`,
        `name.ilike.%${t}%`,
        `manufacturer_code.ilike.%${t}%`,
        `temp_code.ilike.%${t}%`,
      ].join(','),
    );
  }

  const catSlugs = Array.from(new Set([...(filters.categories ?? []), ...(filters.subCategories ?? [])]));

  if (catSlugs.length > 0) {
    const { data: catRows, error: catErr } = await sb.from('categories').select('id, slug').in('slug', catSlugs);
    if (catErr) throw new Error(catErr.message);

    const categoryIds = (catRows ?? []).map((c) => String(c.id));
    if (categoryIds.length === 0) {
      return { items: [], total: 0, page, pageSize, pageCount: 1 };
    }

    q = q.in('category_id', categoryIds as ProductsRow['category_id'][]);
  }

  if (filters.variants?.length) {
    q = q.in('variant', filters.variants as ProductsRow['variant'][]);
  }

  // ✅ BURAYA KOY: eski moldOn filtresinin yerine
  const cmRaw = (filters as unknown as { customerMold?: unknown }).customerMold;

  const cmArr: Array<'Evet' | 'Hayır'> =
    Array.isArray(cmRaw)
      ? (cmRaw as Array<'Evet' | 'Hayır'>)
      : typeof cmRaw === 'string'
        ? ([cmRaw] as Array<'Evet' | 'Hayır'>)
        : [];

  const wantMold = cmRaw === true || cmArr.includes('Evet');
  const wantNonMold = cmRaw === false || cmArr.includes('Hayır');

  if (wantMold && !wantNonMold) {
    q = q.eq('has_customer_mold', true);
  } else if (!wantMold && wantNonMold) {
    q = q.eq('has_customer_mold', false);
    // null da kalıpsız saysın istiyorsan:
    // q = q.or('has_customer_mold.eq.false,has_customer_mold.is.null');
  }

  if (typeof filters.availability === 'boolean') {
    q = q.eq('availability', filters.availability);
  }

  if (filters.from) q = q.gte('date', filters.from);
  if (filters.to) q = q.lte('date', filters.to);

  switch (filters.sort) {
    case 'date-desc':
      q = q.order('created_at', { ascending: false });
      break;
    case 'date-asc':
      q = q.order('created_at', { ascending: true });
      break;
    case 'weight-asc':
      q = q.order('unit_weight_g_pm', { ascending: true });
      break;
    case 'weight-desc':
      q = q.order('unit_weight_g_pm', { ascending: false });
      break;
    case 'code-asc':
      q = q.order('code', { ascending: true });
      break;
    case 'code-desc':
      q = q.order('code', { ascending: false });
      break;
    default:
      q = q.order('created_at', { ascending: false });
      break;
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as ProductsRowWithCategory[];
  const items = rows.map(mapRowWithCategoryToProduct);

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, page, pageSize, pageCount };
}