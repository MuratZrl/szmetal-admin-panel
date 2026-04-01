// src/features/products/types.ts
import type { Database } from '@/types/supabase';

/* -----------------------------------------------------------------------------
 * 1) Ortak sözlük tipleri
 * ---------------------------------------------------------------------------*/
export type CategoryTree = Record< string, { name: string; subs: { slug: string; name: string }[] } >;

export type VariantOption = { key: string; name: string };

/** Dict servislerinin döndürdüğü sözlük seti */
export type ProductDicts = {
  categoryTree: CategoryTree;
  variants: VariantOption[];
};

/* -----------------------------------------------------------------------------
 * 2) Filter tipleri (NOT: ağırlık filtresi kaldırıldı)
 * ---------------------------------------------------------------------------*/
export type CustomerMoldValue = 'Evet' | 'Hayır';

export type ProductSort =
  | 'date-desc'
  | 'date-asc'
  | 'weight-asc'
  | 'weight-desc'
  | 'code-asc'
  | 'code-desc';

export type ProductFilters = {
  q?: string;
  categories?: string[];        // parent slugs
  subCategories?: string[];     // child slugs
  variants?: string[];          // variant keys
  from?: string;                // yyyy-mm-dd
  to?: string;                  // yyyy-mm-dd
  sort?: ProductSort;
  customerMold?: CustomerMoldValue[];
  availability?: boolean;       // true=Kullanılabilir, false=Kullanılamaz
  updatedFrom?: string;         // yyyy-mm-dd — güncelleme tarihi başlangıç
  updatedTo?: string;           // yyyy-mm-dd — güncelleme tarihi bitiş
};

export type Pagination = {
  page: number;
  pageSize: number;
};

/* -----------------------------------------------------------------------------
 * 3) Product tipleri (UI modeli + DB alias'ları)
 *    Formdaki alan sırasına göre düzenlendi
 * ---------------------------------------------------------------------------*/
export type ProductRow    = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

/** UI tarafında kullanılan normalize edilmiş ürün modeli */
export type Product = {
  /** Artık uuid (string) */
  id: string;

  /** 1) Temel metin alanları (form ilk satırlar) */
  name: string;
  code: string;

  /** 2) Müşteri kalıbı + kullanılabilirlik */
  hasCustomerMold: boolean;
  availability: boolean;

  /** 3) Kategori alanları */
  /** Gerçek ilişki: products.category_id (yaprak kategori) */
  categoryId: ProductRow['category_id'] | null;

  /** UI için gösterim alanları, DB kolonu değiller */
  category: string | null;
  subCategory: string | null;
  subSubCategory: string | null;

  /** 4) Varyant */
  variant: ProductRow['variant'];

  /** 5) Ağırlık ve ölçü alanları */
  // DB’de g/m
  unit_weight_g_pm: number | null;
  /** Et kalınlığı (mm cinsinden, örn: 4, 5) */
  wallThicknessMm: number | null;

  outerSizeMm: number | null;
  sectionMm2: number | null;

  /** 6) Tarih alanları */
  /** DB'de null olabilir; UI'da '' ile normalize ediyoruz */
  date: string;
  /** Revizyon tarihi (DB null ise UI tarafında '') */
  revisionDate: string;

  /** 7) Teknik / çizim alanları */
  drawer: string | null;
  control: string | null;
  scale: string | null;

  /** 8) Kod alanları */
  tempCode: string | null;
  manufacturerCode: string | null;

  /** 9) Açıklama (formda altta, kartta detayda kullanılabilir) */
  description?: string | null;

  /** 10) Kartta görsel/PDF thumbnail vb. için: public URL veya null */
  image: string | null;

  /** 11) Dosya metadata (storage) */
  fileBucket: string | null;
  filePath: string | null;
  fileName: string | null;
  fileExt: string | null;
  fileMime: string | null;
  fileSize: number | null;

  /** İsterseniz server tarafında getPublicUrl ile doldurabilirsiniz */
  filePublicUrl?: string | null;

  /** 12) Zaman damgaları (cache-busting vs) */
  updatedAt?: string | null;
  createdAt?: string | null;
};

/* -----------------------------------------------------------------------------
 * 4) Haritalama yardımcıları (DB <-> UI)
 * ---------------------------------------------------------------------------*/

/** Supabase Row -> UI Product */
export function mapRowToProduct(r: ProductRow): Product {
  const rdx =
    (r as unknown as { revision_date?: string | null }).revision_date ?? '';

  const wallThickness =
    (r as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm ?? null;

  return {
    id: String(r.id),

    // 1) Temel metinler
    name: r.name,
    code: r.code,

    // 2) Müşteri kalıbı / availability
    hasCustomerMold: r.has_customer_mold,
    availability: r.availability === true,

    // 3) Kategori alanları
    categoryId: r.category_id ?? null,
    category: null,
    subCategory: null,
    subSubCategory: null,

    // 4) Varyant
    variant: r.variant,

    // 5) Ağırlık + ölçü
    unit_weight_g_pm: r.unit_weight_g_pm ?? null,
    wallThicknessMm: wallThickness ?? null,
    outerSizeMm: r.outer_size_mm ?? null,
    sectionMm2: r.section_mm2 ?? null,

    // 6) Tarihler
    date: r.date ?? '',
    revisionDate: rdx,

    // 7) Teknik / çizim
    drawer: r.drawer ?? null,
    control: r.control ?? null,
    scale: r.scale ?? null,

    // 8) Kodlar
    tempCode: r.temp_code ?? null,
    manufacturerCode: r.manufacturer_code ?? null,

    // 9) Açıklama
    description: r.description ?? null,

    // 10) Görsel
    image: r.image ?? null,

    // 11) Dosya metadata
    fileBucket: r.file_bucket ?? null,
    filePath: r.file_path ?? null,
    fileName: r.file_name ?? null,
    fileExt: r.file_ext ?? null,
    fileMime: r.file_mime ?? null,
    fileSize: r.file_size ?? null,

    filePublicUrl: undefined,

    // 12) Zaman damgaları
    updatedAt: r.updated_at ?? null,
    createdAt: r.created_at ?? null,
  };
}

/** UI Product patch -> kısmi DB Row patch */
export function mapProductPatchToRow(patch: Partial<Product>): Partial<ProductUpdate> {
  const out: Partial<ProductUpdate> = {};

  // Temel metinler
  if (patch.code !== undefined) out.code = patch.code;
  if (patch.name !== undefined) out.name = patch.name;

  // Varyant
  if (patch.variant !== undefined) {
    out.variant = patch.variant as ProductRow['variant'];
  }

  // Kategori id (DB ilişkisi)
  if (patch.categoryId !== undefined) {
    out.category_id = patch.categoryId as ProductRow['category_id'];
  }
  // category / subCategory / subSubCategory sadece UI alanları, DB'ye yazmıyoruz

  // Tarihler
  if (patch.date !== undefined) out.date = patch.date;

  const pr = patch as { revisionDate?: string | null };
  if (pr.revisionDate !== undefined) {
    (out as unknown as { revision_date?: string | null }).revision_date =
      pr.revisionDate ?? null;
  }

  // Görsel
  if (patch.image !== undefined) out.image = patch.image;

  // Müşteri kalıbı + availability
  if (patch.hasCustomerMold !== undefined) {
    out.has_customer_mold = patch.hasCustomerMold;
  }
  if (patch.availability !== undefined) {
    out.availability = patch.availability;
  }

  // Teknik / çizim
  if (patch.drawer !== undefined) out.drawer = patch.drawer;
  if (patch.control !== undefined) out.control = patch.control;
  if (patch.scale !== undefined) out.scale = patch.scale;

  // Ağırlık ve ölçüler
  // ✅ null gelirse "temizle" değil "gönderme" (undefined) yapıyoruz
  if (patch.unit_weight_g_pm !== undefined) {
    out.unit_weight_g_pm = patch.unit_weight_g_pm ?? undefined;
  }

  if (patch.wallThicknessMm !== undefined) { (out as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm = patch.wallThicknessMm }

  if (patch.outerSizeMm !== undefined) { out.outer_size_mm = patch.outerSizeMm }

  if (patch.sectionMm2 !== undefined) { out.section_mm2 = patch.sectionMm2 }

  // Kod alanları
  if (patch.tempCode !== undefined) out.temp_code = patch.tempCode;
  if (patch.manufacturerCode !== undefined) { out.manufacturer_code = patch.manufacturerCode }

  // Dosya metadata
  if (patch.fileBucket !== undefined) out.file_bucket = patch.fileBucket;
  if (patch.filePath !== undefined) out.file_path = patch.filePath;
  if (patch.fileName !== undefined) out.file_name = patch.fileName;
  if (patch.fileExt !== undefined) out.file_ext = patch.fileExt;
  if (patch.fileMime !== undefined) out.file_mime = patch.fileMime;
  if (patch.fileSize !== undefined) out.file_size = patch.fileSize;

  // Açıklama
  if (patch.description !== undefined) out.description = patch.description;

  return out;
}

/* -----------------------------------------------------------------------------
 * 5) Listeleme cevap tipleri
 * ---------------------------------------------------------------------------*/
export type ProductListResponse = {
  items: Product[];
  pageCount: number;
};
