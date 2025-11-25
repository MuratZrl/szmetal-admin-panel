// src/features/products/utils/parseProductFilters.ts

// Bu dosya, /products sayfasında Next.js'in searchParams ile gönderdiği
// ham query string'leri (URL parametreleri) tip güvenli bir şekilde
// domain tipi olan ProductFilters yapısına dönüştürür.
// Amaç: UI tarafındaki Filters.client.tsx bileşeni ile
// backend tarafındaki fetchFilteredProducts arasında tek bir "gerçek"
// filtre modeli oluşturmak.

// Burada sadece string tabanlı URL parametrelerini okur,
// validasyon ve normalizasyon yapar, union tipler (ProductSort vb.)
// ile uyumlu hale getirir ve Supabase sorgusuna hazır hale getirir.

import type { ProductFilters, ProductSort } from '@/features/products/types';

// Next.js'in searchParams'ı aslında kabaca bu şekildedir:
//   Record<string, string | string[] | undefined>
// Bu tip ile çalışmak için küçük bir alias.
type RawParams = Record<string, string | string[] | undefined>;

/**
 * Bir query paramını "her koşulda string dizisine çeviren" yardımcı.
 *
 * Örnek:
 *   'foo'           -> ['foo']
 *   ['a', 'b', '']  -> ['a', 'b']
 *   undefined       -> []
 *
 * Hem tekil hem çoklu param senaryosunu normalize ederek
 * backend tarafındaki ProductFilters.categories, subCategories, variants
 * gibi alanların her zaman string[] olmasını sağlar.
 */
function toArray(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((v) => v.trim()).filter((v) => v.length > 0);
  }
  const trimmed = input.trim();
  return trimmed.length > 0 ? [trimmed] : [];
}

/**
 * Query string'ten gelen bir değeri "true / false" olarak çözen yardımcı.
 *
 * Tekil ya da çoklu (string[]) gelebileceğini hesaba katar.
 * Aşağıdaki değerleri "true" kabul eder:
 *   '1', 'true', 'on', 'yes', 'evet'  (case-insensitive)
 *
 * Onun dışındaki her şey false döner.
 */
function toBoolParam(value: string | string[] | undefined): boolean {
  if (!value) return false;
  const raw = Array.isArray(value) ? value[0] : value;
  const lowered = raw.toLowerCase();
  return ['1', 'true', 'on', 'yes', 'evet'].includes(lowered);
}

/**
 * URL'den gelen serbest bir sort string'ini
 * tipli union olan ProductSort şekline zorlayan yardımcı.
 *
 * Bilinmeyen / geçersiz bir değer geldiğinde uygulama patlamasın,
 * "date-desc" (tarih yeni → eski) varsayılan değeriyle devam etsin.
 */
function normalizeSort(raw: string | undefined): ProductSort {
  const allowed: ProductSort[] = [
    'date-desc',
    'date-asc',
    'weight-asc',
    'weight-desc',
    'code-asc',
    'code-desc',
  ];
  if (!raw) return 'date-desc';
  const val = raw as ProductSort;
  return allowed.includes(val) ? val : 'date-desc';
}

/**
 * Ana giriş fonksiyonu:
 *   - Next.js searchParams (RawParams) alır
 *   - UI'deki Filters bileşeninin ürettiği param adlarını okur
 *   - Bunları ProductFilters domain tipine çevirir
 *
 * Bu fonksiyonun çıktısı doğrudan fetchFilteredProducts'a verilir
 * ve Supabase sorgusunda kullanılır.
 */
export function parseProductFilters(sp: RawParams): ProductFilters {
  // Genel arama metni (q), boşsa "" bırakılır.
  const q = typeof sp.q === 'string' ? sp.q : '';

  // Tarih filtreleri, YYYY-MM-DD formatında beklenir.
  // UI tarafında dayjs ile bu formata çevrilip gönderiliyor.
  const from = typeof sp.from === 'string' ? sp.from : '';
  const to = typeof sp.to === 'string' ? sp.to : '';

  // Filters component'i bunları yazıyor:
  // ?category=...&subCategory=...&variants=...
  //
  // category      -> seçilen root slug'lar
  // subCategory   -> tüm leaf slug'lar (ve root seçilince torunların slug'ları)
  // variants      -> varyant key'leri
  const categories = toArray(sp.category);
  const subCategories = toArray(sp.subCategory);
  const variants = toArray(sp.variants);

  // Sıralama değerini normalize et (union tipe zorla).
  const rawSort = typeof sp.sort === 'string' ? sp.sort : undefined;
  const sort = normalizeSort(rawSort);

  // Checkbox "Kullanılamaz" seçiliyse URL'e availability=0 yazıyoruz.
  // ProductFilters.availability anlamı:
  //   true  -> sadece kullanılabilir ürünler (şu an UI bunu kullanmıyor)
  //   false -> sadece kullanılamaz ürünler
  //   undefined -> availability'e göre filtre yok, hepsi gelsin
  let availability: boolean | undefined = undefined;

  const rawAvail = sp.availability;
  const rawAvailStr =
    typeof rawAvail === 'string'
      ? rawAvail.trim()
      : Array.isArray(rawAvail) && rawAvail[0]
      ? rawAvail[0].trim()
      : '';

  if (rawAvailStr === '0') {
    availability = false;
  }
  // İleride istersen:
  // if (rawAvailStr === '1') {
  //   availability = true;
  // }

  // "Müşteri Kalıbı" checkbox'ı seçiliyse URL'e customerMold=Evet yazılıyor.
  // Backend tarafında (products.server.ts) bu alan cast ile okunuyor,
  // burada sadece flag'i hesaplıyoruz.
  const moldOn = toBoolParam(sp.customerMold);

  // Merkez tip ile uyumlu gövdeyi hazırla.
  // ProductFilters tipi, ürün sorgusunda kullanılan bütün
  // filtre alanlarını tanımlar.
  const base: ProductFilters = {
    q,
    from,
    to,
    categories,
    subCategories,
    variants,
    sort,
    availability,
  };

  // ProductFilters tipinde customerMold alanı tanımlı olmak zorunda değil;
  // ancak fetchFilteredProducts içinde "eski" UI ile geriye dönük uyumluluk için
  // cast üzerinden okunuyor.
  //
  // Bu nedenle runtime'da opsiyonel olarak ekliyoruz.
  if (moldOn) {
    (base as unknown as { customerMold?: boolean }).customerMold = true;
  }

  return base;
}
