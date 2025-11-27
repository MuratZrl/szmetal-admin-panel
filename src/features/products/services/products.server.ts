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
  createSupabaseServerClient,   // sadece okuma (read-only) için kullanılır
  createSupabaseRouteClient,    // yazma/güncelleme (mutasyon) için kullanılır
} from '@/lib/supabase/supabaseServer';

import type { ProductFilters } from '@/features/products/types';
import { mapRowToProduct, mapProductPatchToRow } from '@/features/products/types';
import type { Database } from '@/types/supabase';

// Supabase şemasından tipleri türetiyoruz. Böylece kolon yapısı değişirse
// derleme aşamasında uyarı alırız.
type ProductsRow   = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

/**
 * clampPage:
 *   Sayfa numarasını normalize eder.
 *   - Geçerli bir sayı ve 0'dan büyükse aşağı yuvarlayarak kullan
 *   - Değilse 1. sayfaya düş
 *
 * Hatalı query paramları (ör. page=abc) nedeniyle Supabase range indekslerinin
 * patlamamasını sağlar.
 */
const clampPage = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 1);

/**
 * asUpdateParam:
 *   Supabase update çağrısına verilecek patch objesini,
 *   "Update" tipinin Supabase infer'ları ile uyuşmadığı durumlarda
 *   TypeScript'i susturmak için kullanılan küçücük bir yardımcı.
 *
 *   Amaç: 'any' kullanmadan, gerekirse 'never' üzerinden cast yaparak
 *   tip sistemini mutasyon tarafında sakinleştirmek.
 */
function asUpdateParam(u: ProductUpdate) {
  // Not: 'any' yok. 'never' TS için kabul edilebilir bir cast.
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
 */
export async function fetchProductById(id: string): Promise<ProductsRow | null> {
  const sb = await createSupabaseServerClient();

  const val = id.trim();
  if (!val) return null;

  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', val)
    .maybeSingle();

  if (error) return null;
  return (data ?? null) as ProductsRow | null;
}

/**
 * fetchProductByProfileCode:
 *   Eski API ile geriye dönük uyumluluk için bırakılmış bir alias.
 *   profile_code alanı kaldırıldığı için artık doğrudan code üzerinden
 *   çalışan fetchProductByCode'a delegasyon yapıyor.
 */
export async function fetchProductByProfileCode(profileCode: string): Promise<ProductsRow | null> {
  return fetchProductByCode(profileCode);
}

/**
 * fetchProductByCode:
 *   "code" alanı benzersiz kabul edilerek, tekil ürün döndürür.
 *   - Boş/whitespace code gelirse direkt null
 *   - Bulunamazsa null
 */
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

/**
 * fetchProductByKey:
 *   Tek bir "key" üzerinden ürünü çözmeye çalışan çok amaçlı helper.
 *
 * Çözüm sırası (uuid'e göre güncellendi):
 *   1) key string'e çevrilip id (uuid) olarak denenir
 *   2) code kolonu üzerinden arama
 *   3) manufacturer_code kolonu üzerinden arama
 *   4) temp_code kolonu üzerinden arama
 *
 * Kısaca: kullanıcının elindeki tek bilgi ile ürünü bulmaya çalışır.
 */
export async function fetchProductByKey(key: string | number): Promise<ProductsRow | null> {
  const raw = String(key).trim();
  if (!raw) return null;

  // 1) id (uuid) olarak dene
  const byId = await fetchProductById(raw);
  if (byId) return byId;

  // 2) code
  const byCode = await fetchProductByCode(raw);
  if (byCode) return byCode;

  const sb = await createSupabaseServerClient();

  // 3) manufacturer_code
  {
    const { data } = await sb
      .from('products')
      .select('*')
      .eq('manufacturer_code', raw)
      .maybeSingle();
    if (data) return data as ProductsRow;
  }

  // 4) temp_code
  {
    const { data } = await sb
      .from('products')
      .select('*')
      .eq('temp_code', raw)
      .maybeSingle();
    if (data) return data as ProductsRow;
  }

  // Hiçbir yerde bulunamazsa null
  return null;
}

/* -----------------------------------------------------------------------------
 * Update (ürün güncelleme)
 * ---------------------------------------------------------------------------*/

/**
 * updateProduct:
 *   Verilen uuid id'li ürünü, UI'den gelen patch ile günceller.
 *
 * Akış:
 *   1) UI patch -> mapProductPatchToRow ile DB patch'e çevrilir
 *   2) Supabase update çağrısı yapılır
 *   3) Güncel satır mapRowToProduct ile domain tipine çevrilir ve döndürülür
 *
 * Hata durumları:
 *   - Supabase hata mesajı varsa Error fırlatılır
 *   - Kayıt bulunamazsa "Product not found" hatası fırlatılır
 */
export async function updateProduct(
  id: string,
  patch: Parameters<typeof mapProductPatchToRow>[0],
) {
  const sb = await createSupabaseRouteClient();

  // UI -> DB patch (hala g/m cinsinden gibi alan dönüşümleri burada yapılır)
  const dbPatch: ProductUpdate = mapProductPatchToRow(patch) as ProductUpdate;

  const { data, error } = await sb
    .from('products')
    .update(asUpdateParam(dbPatch))
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Product not found');

  // Güncel satırı tekrar domain modeli tipine map'leyip döndür
  return mapRowToProduct(data as ProductsRow);
}

/* -----------------------------------------------------------------------------
 * Pagination + filters (listeleme)
 * ---------------------------------------------------------------------------*/

/**
 * ProductPage:
 *   fetchFilteredProducts fonksiyonunun döndürdüğü sayfalı sonuç yapısı.
 *
 *  - items: mapRowToProduct ile dönüştürülmüş ürünler
 *  - total: toplam kayıt sayısı
 *  - page: mevcut sayfa numarası
 *  - pageSize: sayfa başına kayıt sayısı
 *  - pageCount: toplam sayfa sayısı
 */
export type ProductPage = {
  items: ReturnType<typeof mapRowToProduct>[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/**
 * fetchFilteredProducts:
 *   /products sayfasındaki tüm filtreler ve sıralama kuralları ile
 *   birlikte Supabase üzerinden ürün listesini çeker.
 *
 * Girdi:
 *   - filters: parseProductFilters ile URL'den türetilen ProductFilters
 *   - opts: page ve pageSize bilgileri
 *
 * Çıktı:
 *   - ProductPage: sayfalama ve filtrelenmiş ürün listesi
 */
export async function fetchFilteredProducts(
  filters: ProductFilters,
  opts: { page: number; pageSize: number },
): Promise<ProductPage> {
  const sb = await createSupabaseServerClient();

  // Sayfa boyutu ve sayfa numarasını güvenli aralığa çek
  const pageSize = Math.max(1, opts.pageSize);
  const page = clampPage(opts.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // count: 'exact' ile total kayıt sayısını da istiyoruz
  let q = sb.from('products').select('*', { count: 'exact' });

  /**
   * Serbest metin arama (q):
   *   - code
   *   - name
   *   - manufacturer_code
   *   - temp_code
   *
   * Postgrest "or" ifadesi ile birden fazla kolonda ilike uygulanır.
   */
  if (filters.q?.trim()) {
    const t = filters.q.trim();
    // code + name + manufacturer_code + temp_code
    q = q.or(
      [
        `code.ilike.%${t}%`,
        `name.ilike.%${t}%`,
        `manufacturer_code.ilike.%${t}%`,
        `temp_code.ilike.%${t}%`,
      ].join(','),
    );
  }

  /**
   * Kategori filtresi:
   *   UI tarafında hem root hem leaf (subCategory) slug'ları tutuluyor.
   *
   *   - filters.categories     => root slug'lar
   *   - filters.subCategories  => leaf slug'lar (ve root seçilince tüm torunlar)
   *
   * Burada ikisini tek bir slug kümesinde birleştiriyoruz ve:
   *   category.in.(...) VEYA sub_category.in.(...)
   * şeklinde OR'lu bir filtre uyguluyoruz.
   *
   * Böylece ürün sadece category'de ya da sadece sub_category'de işaretli olsa bile
   * doğru şekilde yakalanıyor.
   */
  const catSlugs = Array.from(
    new Set([...(filters.categories ?? []), ...(filters.subCategories ?? [])]),
  );

  if (catSlugs.length > 0) {
    // Postgrest "or" ifadesi ile category.in(...) VEYA sub_category.in(...)
    // Format: category.in.("slug1","slug2"),sub_category.in.("slug1","slug2")
    const inList = catSlugs.map((s) => `"${s}"`).join(',');
    q = q.or(`category.in.(${inList}),sub_category.in.(${inList})`);
  }

  /**
   * Varyant filtresi:
   *   filters.variants içinde gelen key'leri doğrudan variant kolonu
   *   üzerinde .in ile uygularız.
   */
  if (filters.variants?.length) {
    q = q.in('variant', filters.variants as ProductsRow['variant'][]);
  }

  /**
   * Müşteri kalıbı filtresi:
   *   Burada filters içinde doğrudan tanımlı olmayan, ancak parseProductFilters
   *   tarafından runtime'da eklenmiş olabilen customerMold alanını okuyoruz.
   *
   *   Eski UI'den kalan "Evet" string değeriyle uyumlu kalmak için:
   *     - true
   *     - 'Evet'
   *     - ['Evet'] (tek elemanlı dizi)
   *   gibi varyantları "aktif" kabul ediyoruz.
   */
  const cm = (filters as unknown as { customerMold?: unknown }).customerMold;
  const moldOn =
    cm === true || cm === 'Evet' || (Array.isArray(cm) && cm.length === 1 && cm[0] === 'Evet');
  if (moldOn) q = q.eq('has_customer_mold', true);

  /**
   * Kullanılabilirlik filtresi:
   *   parseProductFilters tarafında availability boolean ise
   *   burada availability = true olan ürünleri filtreleriz.
   *
   *   availability undefined ise filtre uygulanmaz.
   */
  if (typeof filters.availability === 'boolean') {
    q = q.eq('availability', filters.availability);
  }

  /**
   * Tarih filtresi:
   *   filters.from ve filters.to, UI'de YYYY-MM-DD formatında set ediliyor.
   *
   *   Burada "date" kolonu üzerinden aralık filtresi uygulanıyor.
   *   (Şemanızda created_at kullanıyorsanız burayı ona göre uyarlaman gerekir.)
   */
  if (filters.from) q = q.gte('date', filters.from);
  if (filters.to) q = q.lte('date', filters.to);
  
  /**
   * Sıralama:
   *   ProductSort union'ına göre sıralama stratejisi seçilir.
   *   - date-asc/desc       -> created_at kolonu (siteye eklenme tarihi)
   *   - weight-asc/desc     -> unit_weight_g_pm
   *   - code-asc/desc       -> code
   *   - default             -> created_at (en yeni ürünler önce)
   */
  switch (filters.sort) {
    case 'date-desc':
      // Eskiden: q = q.order('date', { ascending: false });
      q = q.order('created_at', { ascending: false });
      break;
    case 'date-asc':
      // Eskiden: q = q.order('date', { ascending: true });
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
      // sort yoksa da yine en son eklenenler önce
      q = q.order('created_at', { ascending: false });
      break;
  }

  // Supabase range ile sayfaya ait satırları ve toplam sayıyı çek
  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as ProductsRow[];

  // Her satırı domain tipi olan Product'a map'liyoruz
  const items = rows.map(mapRowToProduct);

  // Toplam kayıt sayısı; Supabase count null dönerse en azından 0 varsayılır
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, page, pageSize, pageCount };
}