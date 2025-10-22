import type { Database } from '@/types/supabase';

/* -----------------------------------------------------------------------------
 * 1) Ortak sözlük tipleri
 * ---------------------------------------------------------------------------*/

export type CategoryTree = Record<string, { name: string; subs: { slug: string; name: string }[] }>;

export type VariantOption = { key: string; name: string };

/** Dict servislerinin döndürdüğü sözlük seti */
export type ProductDicts = {
  categoryTree: CategoryTree;
  variants: VariantOption[];
  // Gerekirse ileride başka sözlük alanları ekleyebilirsiniz.
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

  /** Çoklu seçim kalsın (UI tek seçenek kullansa bile ileride esner) */
  customerMold?: CustomerMoldValue[];

  availability?: boolean; // true=Kullanılabilir, false=Kullanılamaz
};

export type Pagination = {
  page: number;
  pageSize: number;
};

/* -----------------------------------------------------------------------------
 * 3) Product tipleri (UI modeli + DB alias'ları)
 * ---------------------------------------------------------------------------*/

export type ProductRow    = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

/** UI tarafında kullanılan normalize edilmiş ürün modeli */
export type Product = {
  id: number;
  code: string;
  name: string;
  variant: ProductRow['variant'];
  category: ProductRow['category'];
  subCategory: string;

  /** DB'de null olabilir; UI'da '' ile normalize ediyoruz */
  date: string;

  /** EKLENDİ: Revizyon tarihi (DB null ise UI tarafında '') */
  revisionDate: string;

  /** Kartta görsel/PDF thumbnail vb. için: public URL veya null */
  image: string | null;

  /** Müşteri kalıbı bilgisi */
  hasCustomerMold: boolean;

  availability: boolean;

  // Teknik alanlar
  drawer: string | null;
  control: string | null;
  unit_weight_g_pm: number | 0;
  scale: string | null;
  outerSizeMm: number | null;
  sectionMm2: number | null;
  tempCode: string | null;
  manufacturerCode: string | null;

  // Dosya metadata (storage)
  fileBucket: string | null;
  filePath: string | null;
  fileName: string | null;
  fileExt: string | null;
  fileMime: string | null;
  fileSize: number | null;

  /** İsterseniz server tarafında getPublicUrl ile doldurabilirsiniz */
  filePublicUrl?: string | null;

  // cache-busting için
  updatedAt?: string | null;
  createdAt?: string | null; // istersen fallback için

  description?: string | null;
};

/* -----------------------------------------------------------------------------
 * 4) Haritalama yardımcıları (DB <-> UI)
 * ---------------------------------------------------------------------------*/

/** Supabase Row -> UI Product */
export function mapRowToProduct(r: ProductRow): Product {
  // DB tipleri henüz 'revision_date' içermeyebilir; güvenli okuma:
  const rdx = (r as unknown as { revision_date?: string | null }).revision_date ?? '';

  return {
    id: r.id,
    code: r.code,
    name: r.name,
    variant: r.variant,
    category: r.category,
    subCategory: r.sub_category,

    date: r.date ?? '',
    revisionDate: rdx,

    image: r.image ?? null,

    hasCustomerMold: r.has_customer_mold,
    availability: r.availability === true,

    drawer: r.drawer ?? null,
    control: r.control ?? null,
    unit_weight_g_pm: r.unit_weight_g_pm ?? 0,
    scale: r.scale ?? null,
    outerSizeMm: r.outer_size_mm ?? null,
    sectionMm2: r.section_mm2 ?? null,
    tempCode: r.temp_code ?? null,
    manufacturerCode: r.manufacturer_code ?? null,

    fileBucket: r.file_bucket ?? null,
    filePath: r.file_path ?? null,
    fileName: r.file_name ?? null,
    fileExt: r.file_ext ?? null,
    fileMime: r.file_mime ?? null,
    fileSize: r.file_size ?? null,

    updatedAt: r.updated_at ?? null,
    createdAt: r.created_at ?? null,

    description: r.description ?? null,
  };
}

/** UI Product patch -> kısmi DB Row patch */
export function mapProductPatchToRow(patch: Partial<Product>): Partial<ProductRow> {
  const out: Partial<ProductRow> = {};

  if (patch.code !== undefined) out.code = patch.code;
  if (patch.name !== undefined) out.name = patch.name;
  if (patch.variant !== undefined) out.variant = patch.variant as ProductRow['variant'];
  if (patch.category !== undefined) out.category = patch.category as ProductRow['category'];
  if (patch.subCategory !== undefined) out.sub_category = patch.subCategory;

  if (patch.date !== undefined) out.date = patch.date;

  // DB tipleri henüz 'revision_date' içermese bile sorunsuz set edelim:
  if (patch.revisionDate !== undefined) {
    (out as unknown as { revision_date?: string | null }).revision_date = patch.revisionDate;
  }

  if (patch.image !== undefined) out.image = patch.image;

  if (patch.hasCustomerMold !== undefined) out.has_customer_mold = patch.hasCustomerMold;

  if (patch.availability !== undefined) out.availability = patch.availability;

  if (patch.drawer !== undefined) out.drawer = patch.drawer;
  if (patch.control !== undefined) out.control = patch.control;
  if (patch.unit_weight_g_pm !== undefined) out.unit_weight_g_pm = patch.unit_weight_g_pm;
  if (patch.scale !== undefined) out.scale = patch.scale;
  if (patch.outerSizeMm !== undefined) out.outer_size_mm = patch.outerSizeMm;
  if (patch.sectionMm2 !== undefined) out.section_mm2 = patch.sectionMm2;
  if (patch.tempCode !== undefined) out.temp_code = patch.tempCode;
  if (patch.manufacturerCode !== undefined) out.manufacturer_code = patch.manufacturerCode;

  if (patch.fileBucket !== undefined) out.file_bucket = patch.fileBucket;
  if (patch.filePath !== undefined) out.file_path = patch.filePath;
  if (patch.fileName !== undefined) out.file_name = patch.fileName;
  if (patch.fileExt !== undefined) out.file_ext = patch.fileExt;
  if (patch.fileMime !== undefined) out.file_mime = patch.fileMime;
  if (patch.fileSize !== undefined) out.file_size = patch.fileSize;

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
