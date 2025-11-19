// src/features/products/dicts.server.ts
'use server';

// Bu modül, ürünler sayfasında (Products) UI tarafının ihtiyaç duyduğu
// "sözlük" (dictionary) verilerini üretmekten sorumludur.
// Özellikle:
//   - Kategori ağacını (parent-child yapısı, slug + isimler)
//   - Varyant listesini (profil/varyant isimleri)
// tek bir ProductDicts objesi halinde döndürür.
//
// Amaç: UI tarafında kategori ve varyant filtrelerini, label map'lerini
// ve ağaç yapısını yeniden hesaplamadan, tek noktadan beslemek.

// Supabase server-side client (RSC / route handler ortamı için)
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/**
 * CategoryTree:
 *   - Key: kategori slug'ı (her kategori, hem root hem child olabilir)
 *   - Value: kategori ismi + doğrudan çocuklarının slug + ismi
 *
 * Bu yapı, UI tarafındaki Filters bileşeninin beklediği format:
 * ağaç, slug merkezli tutulur ve her node kendi children listesini içerir.
 */
export type CategoryTree = Record<
  string, // kategori slug'ı (parent veya leaf)
  { name: string; subs: { slug: string; name: string }[] }
>;

/**
 * VariantOption:
 *   - key: varyantın benzersiz anahtarı (DB'deki "key" alanı)
 *   - name: UI'de gösterilecek isim
 *
 * Filters ve tablo bileşenleri bu yapıyı kullanarak select / checkbox
 * listeleri oluşturur, ayrıca label map üretiminde de kullanılır.
 */
export type VariantOption = { key: string; name: string };

/**
 * ProductDicts:
 * Ürün sayfasının UI katmanında ihtiyaç duyduğu tüm sözlükleri
 * tek bir payload içinde toplar.
 *
 *  - variants: varyant seçenekleri (profil türleri vb.)
 *  - categories: sadece root (üst seviye) kategori slug listesi
 *                (sol filtre panelinde kökleri başlatmak için)
 *  - categoryTree: tüm kategorilerin isimlerini ve doğrudan çocuklarını
 *                  içeren ağaç yapı
 */
export type ProductDicts = {
  variants: VariantOption[];
  categories: string[];       // yalnızca root slug listesi
  categoryTree: CategoryTree; // slug -> { name, subs[] } ağacı
};

// Supabase şemasından satır tiplerini türetiyoruz.
// Böylece kolon adlarını değiştirirsen, TS derleme aşamasında uyarır.
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type VariantRow  = Database['public']['Tables']['variants']['Row'];

/**
 * buildCategoryTree:
 *   - categories tablosundan gelen satırları alır
 *   - pasif / bozuk satırları filtreler
 *   - root slug listesini (categories) ve CategoryTree ağacını üretir
 *
 * Girdi:
 *   rows: id, slug, name, parent_id, is_active, sort alanlarını içeren
 *         readonly satır listesi
 *
 * Çıktı:
 *   {
 *     categories: string[];    // root slug'lar
 *     categoryTree: CategoryTree; // tüm slug -> node map'i
 *   }
 */
function buildCategoryTree(
  rows: readonly Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]
): { categories: string[]; categoryTree: CategoryTree } {
  // 1) Geçersiz / pasif satırları ayıkla:
  //    - is_active === false olanlar hariç
  //    - slug veya name boş olanlar hariç
  const ok = rows.filter((r) => r.is_active !== false && !!r.slug && !!r.name);

  // 2) Türkçe alfabe duyarlı karşılaştırıcı
  //    (UI tarafında alfabetik sırada gösterebilmek için)
  const collator = new Intl.Collator('tr', { sensitivity: 'base' });

  // sort kolonu varsa önce ona göre, eşitlikte isme göre sıralama
  const byOrder = (a: (typeof ok)[number], b: (typeof ok)[number]) =>
    (a.sort ?? 0) - (b.sort ?? 0) || collator.compare(a.name, b.name);

  // 3) Root kategorileri bul:
  //    parent_id null/undefined olan satırlar root kabul edilir.
  const roots = ok.filter((r) => !r.parent_id).sort(byOrder);

  // Root slug listesi (UI'de sol panelde en üst seviye için kullanılıyor)
  const categories = roots.map((r) => r.slug);

  // 4) parent_id -> children map'i kur:
  //    Her parent_id değerine karşılık gelen children satırları tutarız.
  //    Böylece belli bir parent'ın çocuklarına hızlıca ulaşabiliriz.
  const childrenMap = new Map<string | null, typeof ok>();
  for (const r of ok) {
    const key = r.parent_id ?? null;
    const arr = childrenMap.get(key);
    if (arr) arr.push(r);
    else childrenMap.set(key, [r]);
  }

  // 5) CategoryTree üret:
  //    Tüm kategoriler için birer node oluştur ve sadece doğrudan
  //    çocukları "subs" altında listele. Böylece:
  //
  //    categoryTree[parentSlug] = {
  //      name: 'Parent Adı',
  //      subs: [{ slug: 'child-1', name: 'Child 1' }, ...]
  //    }
  //
  //    Bu yapı, Filters bileşeninde recursive render sırasında
  //    childrenOf(slug) fonksiyonuyla kullanılıyor.
  const categoryTree: CategoryTree = {};
  for (const r of ok) {
    // Bu satırın id'sini parent_id olarak referans alan çocukları bul.
    const kids = (childrenMap.get(r.id) ?? []).slice().sort(byOrder);

    categoryTree[r.slug] = {
      name: r.name,
      subs: kids.map((k) => ({ slug: k.slug, name: k.name })),
    };
  }

  return { categories, categoryTree };
}

/**
 * fetchProductDicts:
 *   - Supabase üzerinden categories ve variants tablolarını okur
 *   - buildCategoryTree ile kategori ağacını hazırlar
 *   - varyantları VariantOption şekline map'ler
 *   - UI için tek bir ProductDicts objesi döner
 *
 * Bu fonksiyon, /products sayfasında data-fetching sırasında
 * Promise.all içinde çağrılır. Kısaca, ürün gridinden bağımsız
 * olarak "sabit" sözlük verilerini sağlar.
 */
export async function fetchProductDicts(): Promise<ProductDicts> {
  const sb = await createSupabaseServerClient();

  // 1) Kategoriler:
  //    - Sadece aktif (is_active = true) satırlar
  //    - sort, ardından name'e göre sıralı
  //    - buildCategoryTree ile root listesi + ağaç formuna çevrilecek
  const { data: cats, error: catErr } = await sb
    .from('categories')
    .select('id, slug, name, parent_id, is_active, sort')
    .eq('is_active', true)
    .order('sort', { ascending: true })
    .order('name', { ascending: true })
    .returns<
      Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]
    >();

  if (catErr) {
    // Sunucu tarafında çalıştığı için hata fırlatmak kabul edilebilir;
    // üst seviye handler 500 dönecektir.
    throw catErr;
  }

  const { categories, categoryTree } = buildCategoryTree(cats ?? []);

  // 2) Varyantlar:
  //    - key + name + sort alanları okunur
  //    - sort artan şekilde sıralanır
  //    - VariantOption tipine map'lenir
  const { data: vars, error: varErr } = await sb
    .from('variants')
    .select('key, name, sort')
    .order('sort', { ascending: true })
    .returns<Pick<VariantRow, 'key' | 'name' | 'sort'>[]>();

  if (varErr) {
    throw varErr;
  }

  // Varyant satırlarını UI dostu yapıya çevir:
  // key ve name, Filters ve ürün listesi label'ları için kullanılıyor.
  const variants: VariantOption[] = (vars ?? []).map((v) => ({
    key: v.key,
    name: v.name,
  }));

  // Son olarak root slug listesi, kategori ağacı ve varyant listesi
  // tek bir ProductDicts objesi halinde döndürülür.
  return { categories, categoryTree, variants };
}
