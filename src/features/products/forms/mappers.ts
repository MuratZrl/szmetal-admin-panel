// src/features/products/forms/mappers.ts
import {
  type CustomerMoldSelect,
  normalizeVariantToDb,
  DEFAULT_VARIANT_KEY,
} from './schema';

import type { Database } from '@/types/supabase';

type ProductsInsert = Database['public']['Tables']['products']['Insert'];
type ProductsUpdate = Database['public']['Tables']['products']['Update'];
type ProductsRow    = Database['public']['Tables']['products']['Row'];

/** Formun ortak şekli: create/edit aynı alanları kullanır
 *  Formdaki alan sırasına göre düzenlendi
 */
export type ProductFormValuesCore = {
  // 1) Temel metinler
  name: string;
  code: string;

  // 2) Müşteri kalıbı + kullanılabilirlik
  customerMold: CustomerMoldSelect;
  availability: boolean;

  // 3) Kategori alanları (UI tarafında slug’lar)
  category: string;
  subCategory: string;
  subSubCategory: string;

  // 4) Varyant
  variant: string;

  // 5) Ağırlık ve ölçü alanları (formdaki “Birim Ağırlık / Et Kalınlığı” satırı)
  unitWeightG: number | null;
  wallThicknessMm: number | null;

  outerSizeMm: number | null;
  sectionMm2: number | null;

  // 6) Tarih alanları
  date: string;
  revisionDate: string;

  // 7) Teknik / çizim alanları
  drawer: string;
  control: string;
  scale: string;

  // 8) Kod alanları
  tempCode: string | null;
  manufacturerCode: string | null;

  // 9) Açıklama
  description: string;

  // 10) Görsel (URL veya storage path)
  image: string;
};

export type ProductFormValuesWithRelations = ProductFormValuesCore & {
  // DB ile gerçek bağlantı: seçili leaf category id'si
  categoryId?: string | null;
};

export type FileMeta = {
  path: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
  bucket: string;
};

export function trimToNull(v: string | null | undefined): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

function moldSelectToBool(v: CustomerMoldSelect): boolean | undefined {
  if (v === 'Evet') return true;
  if (v === 'Hayır') return false;
  return undefined;
}

export function toInsertPayload(
  v: ProductFormValuesWithRelations,
  fileMeta?: FileMeta | null,
): ProductsInsert {
  const payload: ProductsInsert = {
    // 1) Temel metinler
    name: v.name,
    code: v.code,

    // 2) Varyant
    variant: normalizeVariantToDb(v.variant),

    // 3) Kategori ilişkisi
    category_id: v.categoryId ?? null,

    // 4) Tarihler
    date: v.date,

    // 5) Ağırlık / ölçü
    unit_weight_g_pm:
      v.unitWeightG == null ? 0 : Math.round(Number(v.unitWeightG)),

    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    // 6) Müşteri kalıbı + availability
    has_customer_mold: moldSelectToBool(v.customerMold),
    availability: v.availability ?? true,

    // 7) Açıklama
    description: trimToNull(v.description),

    // 8) Teknik / çizim alanları
    drawer: trimToNull(v.drawer),
    control: trimToNull(v.control),
    scale: trimToNull(v.scale),

    // 9) Kod alanları
    temp_code: trimToNull(v.tempCode),
    manufacturer_code: trimToNull(v.manufacturerCode),

    // 10) Görsel
    image: v.image ? v.image.trim() : null,

    // 11) Dosya metadata
    file_path:   fileMeta?.path   ?? null,
    file_name:   fileMeta?.name   ?? null,
    file_ext:    fileMeta?.ext    ?? null,
    file_mime:   fileMeta?.mime   ?? null,
    file_size:   fileMeta?.size   ?? null,
    file_bucket: fileMeta?.bucket ?? null,
  } as ProductsInsert;

  // Revizyon tarihi
  (payload as unknown as { revision_date?: string | null }).revision_date =
    trimToNull(v.revisionDate);

  // Et kalınlığı
  (payload as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm =
    v.wallThicknessMm ?? null;

  return payload;
}

export type ProductUpdateInput = Partial<ProductFormValuesWithRelations> & {
  fileMeta?: FileMeta | null;
};

export function toUpdatePayload(v: ProductUpdateInput): ProductsUpdate {
  const p: ProductsUpdate = {};

  // 1) Temel metinler
  if (v.name !== undefined) p.name = v.name;
  if (v.code !== undefined) p.code = v.code;

  // 2) Varyant
  if (v.variant !== undefined) {
    p.variant = normalizeVariantToDb(v.variant);
  }

  // 3) Kategori ilişkisi
  if (v.categoryId !== undefined) {
    p.category_id = v.categoryId ?? null;
  }

  // 4) Tarihler
  if (v.date !== undefined) {
    p.date = v.date;
  }

  if (v.revisionDate !== undefined) {
    (p as unknown as { revision_date?: string | null }).revision_date =
      trimToNull(v.revisionDate);
  }

  // 5) Ağırlık / ölçü
  if (v.unitWeightG !== undefined) {
    p.unit_weight_g_pm =
      v.unitWeightG == null ? 0 : Math.round(Number(v.unitWeightG));
  }

  if (v.outerSizeMm !== undefined) {
    p.outer_size_mm = v.outerSizeMm ?? null;
  }

  if (v.sectionMm2 !== undefined) {
    p.section_mm2 = v.sectionMm2 ?? null;
  }

  if (v.wallThicknessMm !== undefined) {
    (p as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm =
      v.wallThicknessMm ?? null;
  }

  // 6) Müşteri kalıbı + availability
  if (v.customerMold !== undefined) {
    p.has_customer_mold = moldSelectToBool(v.customerMold);
  }

  if (v.availability !== undefined) {
    p.availability = v.availability;
  }

  // 7) Açıklama
  if (v.description !== undefined) {
    p.description = trimToNull(v.description);
  }

  // 8) Teknik / çizim alanları
  if (v.drawer !== undefined)  p.drawer  = trimToNull(v.drawer);
  if (v.control !== undefined) p.control = trimToNull(v.control);
  if (v.scale !== undefined)   p.scale   = trimToNull(v.scale);

  // 9) Kod alanları
  if (v.tempCode !== undefined) {
    p.temp_code = trimToNull(v.tempCode);
  }

  if (v.manufacturerCode !== undefined) {
    p.manufacturer_code = trimToNull(v.manufacturerCode);
  }

  // 10) Görsel
  if (v.image !== undefined) {
    const img = typeof v.image === 'string' ? v.image.trim() : null;
    p.image = img && img.length ? img : null;
  }

  // 11) Dosya metadata
  if (v.fileMeta) {
    p.file_path   = v.fileMeta.path;
    p.file_name   = v.fileMeta.name;
    p.file_ext    = v.fileMeta.ext;
    p.file_mime   = v.fileMeta.mime;
    p.file_size   = v.fileMeta.size;
    p.file_bucket = v.fileMeta.bucket;
  }

  return p;
}

export function mapRowToForm(row: ProductsRow): ProductFormValuesCore {
  const revision =
    (row as unknown as { revision_date?: string | null }).revision_date ?? '';

  const wallThickness =
    (row as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm ??
    null;

  const rawVariant = row.variant;
  const variant: string =
    rawVariant == null || String(rawVariant).trim().length === 0
      ? DEFAULT_VARIANT_KEY
      : String(rawVariant);

  return {
    // 1) Temel metinler
    name: row.name ?? '',
    code: row.code ?? '',

    // 2) Müşteri kalıbı + availability
    customerMold:
      row.has_customer_mold == null
        ? 'Hayır'
        : row.has_customer_mold
        ? 'Evet'
        : 'Hayır',
    availability: row.availability ?? true,

    // 3) Kategori alanları (DB'den gelmiyor, ileride category_id'den türetebilirsin)
    category: '',
    subCategory: '',
    subSubCategory: '',

    // 4) Varyant
    variant,

    // 5) Ağırlık / ölçü
    unitWeightG: row.unit_weight_g_pm ?? null,
    wallThicknessMm: wallThickness,

    outerSizeMm: row.outer_size_mm ?? null,
    sectionMm2: row.section_mm2 ?? null,

    // 6) Tarihler
    date: row.date ?? new Date().toISOString().slice(0, 10),
    revisionDate: revision || '',

    // 7) Teknik / çizim
    drawer: row.drawer ?? '',
    control: row.control ?? '',
    scale: row.scale ?? '',

    // 8) Kod alanları
    tempCode: row.temp_code ?? null,
    manufacturerCode: row.manufacturer_code ?? null,

    // 9) Açıklama
    description: row.description ?? '',

    // 10) Görsel
    image: row.image ?? '',
  };
}
