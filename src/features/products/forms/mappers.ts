// features/products/forms/mapper.ts
import type { Database } from '@/types/supabase';
import type { CustomerMoldSelect } from './schema'; // <-- select tipi ('' | 'Evet' | 'Hayır')

type ProductsInsert = Database['public']['Tables']['products']['Insert'];
type ProductsUpdate = Database['public']['Tables']['products']['Update'];
type ProductsRow    = Database['public']['Tables']['products']['Row'];

/** Formun ortak şekli: create/edit aynı alanları kullanır */
export type ProductFormValuesCore = {
  name: string;
  code: string;
  variant: string;

  category: string;     // slug veya text
  subCategory: string;  // slug veya text

  date: string;         // yyyy-mm-dd
  revisionDate: string; // yyyy-mm-dd veya '' (opsiyonel alan için '' serbest)

  unitWeightG: number | null; // gr/m
  customerMold: CustomerMoldSelect; // '' | 'Evet' | 'Hayır'

  availability: boolean;

  description: string;

  // şemada .defined() olan düz string alanlar
  drawer: string;
  control: string;
  scale: string;

  // opsiyonel sayısal alanlar
  outerSizeMm: number | null;
  sectionMm2: number | null;

  // opsiyonel metin alanlar (null serbest)
  tempCode: string | null;
  manufacturerCode: string | null;

  // asset public URL; boş string serbest
  image: string;
};

export type ProductFormValuesWithRelations = ProductFormValuesCore & {
  categoryId?: string | null;
  subCategoryId?: string | null;
};

export type FileMeta = {
  path: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
  bucket: string;
};

/** string’i trimleyip boşsa null yapar */
export function trimToNull(v: string | null | undefined): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

/** Select değeri → boolean|null */
function moldSelectToBool(v: CustomerMoldSelect): boolean | undefined {
  if (v === 'Evet') return true;
  if (v === 'Hayır') return false;
  return undefined; // '' → null
}

/** create için DB payload (camelCase → snake_case) */
export function toInsertPayload(
  v: ProductFormValuesWithRelations,
  fileMeta?: FileMeta | null
): ProductsInsert {
  const payload: ProductsInsert = {
    name: v.name,
    code: v.code,
    variant: v.variant,

    // text alanlar
    category: v.category ?? null,
    sub_category: v.subCategory ?? null,

    // relation alanlar (şeman varsa)
    category_id: v.categoryId ?? null,
    subcategory_id: v.subCategoryId ?? null,

    date: v.date,

    // gr/m → DB’de integer ise yuvarlayalım
    unit_weight_g_pm:
      v.unitWeightG == null ? 0 : Math.round(Number(v.unitWeightG)),

    // Müşteri kalıbı
    has_customer_mold: moldSelectToBool(v.customerMold),

    availability: v.availability ?? true,

    description: trimToNull(v.description),

    drawer: trimToNull(v.drawer),
    control: trimToNull(v.control),
    scale: trimToNull(v.scale),

    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    temp_code: trimToNull(v.tempCode),
    manufacturer_code: trimToNull(v.manufacturerCode),

    image: v.image ? v.image.trim() : null,

    file_path: fileMeta?.path ?? null,
    file_name: fileMeta?.name ?? null,
    file_ext:  fileMeta?.ext  ?? null,
    file_mime: fileMeta?.mime ?? null,
    file_size: fileMeta?.size ?? null,
    file_bucket: fileMeta?.bucket ?? null,
  } as ProductsInsert;

  // Revizyon tarihi (DB tipleri henüz kolon içermeyebilir, güvenli yazalım)
  (payload as unknown as { revision_date?: string | null }).revision_date = trimToNull(v.revisionDate);

  return payload;
}

/** update için KISMİ patch payload (undefined olanlara DOKUNMA) */
export type ProductUpdateInput = Partial<ProductFormValuesWithRelations> & {
  // update sırasında yeni dosya metadata’sı geldiyse
  fileMeta?: FileMeta | null;
};

export function toUpdatePayload(v: ProductUpdateInput): ProductsUpdate {
  const p: ProductsUpdate = {};

  if (v.name !== undefined) p.name = v.name;
  if (v.code !== undefined) p.code = v.code;
  if (v.variant !== undefined) p.variant = v.variant;

  if (v.category !== undefined)        p.category = v.category ?? null;
  if (v.subCategory !== undefined)     p.sub_category = v.subCategory ?? null;
  if (v.categoryId !== undefined)      p.category_id = v.categoryId ?? null;
  if (v.subCategoryId !== undefined)   p.subcategory_id = v.subCategoryId ?? null;

  if (v.date !== undefined) p.date = v.date;

  // Revizyon tarihi: '' geldiyse null; undefined ise dokunma
  if (v.revisionDate !== undefined) {
    (p as unknown as { revision_date?: string | null }).revision_date = trimToNull(v.revisionDate);
  }

  if (v.unitWeightG !== undefined) {
    p.unit_weight_g_pm = v.unitWeightG == null
      ? 0
      : Math.round(Number(v.unitWeightG));
  }

  // Müşteri kalıbı: '' geldiyse null yap; undefined ise dokunma
  if (v.customerMold !== undefined) {
    p.has_customer_mold = moldSelectToBool(v.customerMold);
  }

  if (v.availability !== undefined) p.availability = v.availability;

  if (v.description !== undefined) p.description = trimToNull(v.description);

  if (v.drawer !== undefined)             p.drawer = trimToNull(v.drawer);
  if (v.control !== undefined)            p.control = trimToNull(v.control);
  if (v.scale !== undefined)              p.scale = trimToNull(v.scale);
  if (v.outerSizeMm !== undefined)        p.outer_size_mm = v.outerSizeMm ?? null;
  if (v.sectionMm2 !== undefined)         p.section_mm2 = v.sectionMm2 ?? null;
  if (v.tempCode !== undefined)           p.temp_code = trimToNull(v.tempCode);
  if (v.manufacturerCode !== undefined)   p.manufacturer_code = trimToNull(v.manufacturerCode);

  if (v.image !== undefined) {
    const img = typeof v.image === 'string' ? v.image.trim() : null;
    p.image = img && img.length ? img : null;
  }

  if (v.fileMeta) {
    p.file_path = v.fileMeta.path;
    p.file_name = v.fileMeta.name;
    p.file_ext  = v.fileMeta.ext;
    p.file_mime = v.fileMeta.mime;
    p.file_size = v.fileMeta.size;
    p.file_bucket = v.fileMeta.bucket;
  }

  return p;
}

/** DB Row → form varsayılanları (edit initial) */
export function mapRowToForm(row: ProductsRow): ProductFormValuesCore {
  const revision = (row as unknown as { revision_date?: string | null }).revision_date ?? '';

  return {
    name: row.name ?? '',
    code: row.code ?? '',
    variant: row.variant ?? '',

    category: row.category ?? '',
    subCategory: row.sub_category ?? '',

    date: row.date ?? new Date().toISOString().slice(0, 10),
    revisionDate: revision || '',

    unitWeightG: row.unit_weight_g_pm ?? null,

    // DB → Select
    customerMold:
      row.has_customer_mold == null
        ? 'Hayır'                      // null/undefined ise Hayır göster
        : row.has_customer_mold ? 'Evet' : 'Hayır',

    availability: row.availability ?? true,

    description: row.description ?? '',

    drawer: row.drawer ?? '',
    control: row.control ?? '',
    scale: row.scale ?? '',

    outerSizeMm: row.outer_size_mm ?? null,
    sectionMm2: row.section_mm2 ?? null,

    tempCode: row.temp_code ?? null,
    manufacturerCode: row.manufacturer_code ?? null,

    image: row.image ?? '',
  };
}
