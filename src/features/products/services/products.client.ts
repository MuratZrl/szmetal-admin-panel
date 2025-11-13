// src/features/products/services/products.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';

type ProductsInsert = Database['public']['Tables']['products']['Insert'];
type ProductsUpdate = Database['public']['Tables']['products']['Update'];
type ProductsRow    = Database['public']['Tables']['products']['Row'];

export type CreateProductInput = {
  name: string;
  code: string;
  variant: string;

  category: string;
  subCategory: string;

  categoryId?: string | null;
  subCategoryId?: string | null;

  date: string;

  /** Revizyon tarihi (opsiyonel, boşsa null) */
  revisionDate?: string | null;

  /** UI tarafı kg/m girsin — geriye uyumluluk için unitWeightG de kabul */
  unitWeightKg?: number | null;
  unitWeightG?: number | null;

  hasCustomerMold?: boolean;
  availability?: boolean;

  drawer?: string | null;
  control?: string | null;
  scale?: string | null;

  outerSizeMm?: number | null;
  sectionMm2?: number | null;

  tempCode?: string | null;
  profileCode?: string | null; // geriye uyumluluk
  manufacturerCode?: string | null;

  /** Eski kodu kırmamak için duruyor; servis bunu artık kullanmaz. */
  file?: File | null;

  /** useProductUpload’tan gelen public URL */
  image?: string | null;

  /** useProductUpload’tan opsiyonel metadata (istersen DB’de sakla) */
  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;

  description?: string | null;
};

function toNull(v?: string | null) {
  const s = typeof v === 'string' ? v.trim() : v ?? '';
  return s ? s : null;
}

function kgToGrSafe(v: number | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 1000) : null;
}

/* -------------------------------------------------------
 * CREATE: sadece DB insert — upload işi dışarıda (signed upload)
 * ----------------------------------------------------- */
export async function createProduct(v: CreateProductInput) {
  // Kg/m öncelikli, yoksa geriye uyumluluk için G/m
  const gpmFromKg = kgToGrSafe(v.unitWeightKg);
  const gpm = gpmFromKg ?? (v.unitWeightG == null ? null : Math.round(Number(v.unitWeightG)));

  const payload: ProductsInsert = {
    name: v.name,
    code: v.code,
    variant: v.variant,

    category: v.category ?? null,
    sub_category: v.subCategory,
    category_id: v.categoryId ?? null,
    subcategory_id: v.subCategoryId ?? null,

    date: v.date,

    // Revizyon tarihi
    revision_date: toNull(v.revisionDate ?? null),

    ...(gpm != null ? { unit_weight_g_pm: gpm } : {}),

    drawer: toNull(v.drawer),
    control: toNull(v.control),
    scale: toNull(v.scale),

    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    temp_code: toNull(v.tempCode),
    manufacturer_code: toNull(v.manufacturerCode),

    image: v.image ?? null,

    ...(v.hasCustomerMold !== undefined
      ? { has_customer_mold: v.hasCustomerMold }
      : {}),

    availability: v.availability,

    // Signed upload metadata (opsiyonel)
    file_bucket: v.fileBucket ?? null,
    file_path:   v.filePath   ?? null,
    file_name:   v.fileName   ?? null,
    file_ext:    v.fileName?.split('.').pop()?.toLowerCase() ?? null,
    file_mime:   v.fileMime   ?? null,
    file_size:   v.fileSize   ?? null,

    description: toNull(v.description ?? null),
  } satisfies ProductsInsert;

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id as number | undefined;
}

/* -------------------------------------------------------
 * DELETE helpers
 * ----------------------------------------------------- */
export async function deleteAllProducts(): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .not('id', 'is', null);
  if (error) throw new Error(error.message);
}

export async function deleteProductById(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductsByIds(ids: number[]) {
  if (!ids.length) return;
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------
 * UPDATE: yalnızca gelen alanları güncelle — upload yok
 * ----------------------------------------------------- */
export type UpdateProductInput =
  Partial<Omit<CreateProductInput, 'file'>> & { file?: File | null };

export async function updateProduct(id: number, v: UpdateProductInput): Promise<ProductsRow> {
  const payload: ProductsUpdate = {};

  if (v.name !== undefined) payload.name = v.name;
  if (v.code !== undefined) payload.code = v.code;
  if (v.variant !== undefined) payload.variant = v.variant;

  if (v.category !== undefined)      payload.category = v.category ?? null;
  if (v.subCategory !== undefined)   payload.sub_category = v.subCategory ?? null;
  if (v.categoryId !== undefined)    payload.category_id = v.categoryId ?? null;
  if (v.subCategoryId !== undefined) payload.subcategory_id = v.subCategoryId ?? null;

  if (v.date !== undefined) payload.date = v.date;

  if (v.revisionDate !== undefined) {
    (payload as unknown as { revision_date?: string | null }).revision_date = toNull(v.revisionDate);
  }

  // Kg/m öncelikli, yoksa G/m (geriye uyumluluk)
  if (v.unitWeightKg !== undefined) {
    const gpm = kgToGrSafe(v.unitWeightKg);
    payload.unit_weight_g_pm = gpm == null ? 0 : gpm;
  } else if (v.unitWeightG !== undefined) {
    payload.unit_weight_g_pm = v.unitWeightG == null ? 0 : Math.round(Number(v.unitWeightG));
  }

  if (v.drawer !== undefined)           payload.drawer = toNull(v.drawer);
  if (v.control !== undefined)          payload.control = toNull(v.control);
  if (v.scale !== undefined)            payload.scale = toNull(v.scale);
  if (v.outerSizeMm !== undefined)      payload.outer_size_mm = v.outerSizeMm ?? null;
  if (v.sectionMm2 !== undefined)       payload.section_mm2 = v.sectionMm2 ?? null;
  if (v.tempCode !== undefined)         payload.temp_code = toNull(v.tempCode);
  if (v.manufacturerCode !== undefined) payload.manufacturer_code = toNull(v.manufacturerCode);

  if (v.image !== undefined) payload.image = v.image ?? null;

  if (v.hasCustomerMold !== undefined) {
    payload.has_customer_mold = v.hasCustomerMold;
  }

  if (v.availability !== undefined) payload.availability = v.availability;

  // Signed upload metadata geldiyse güncelle
  if (v.fileBucket !== undefined) payload.file_bucket = v.fileBucket;
  if (v.filePath !== undefined)   payload.file_path   = v.filePath;
  if (v.fileName !== undefined)   payload.file_name   = v.fileName;
  if (v.fileMime !== undefined)   payload.file_mime   = v.fileMime;
  if (v.fileSize !== undefined)   payload.file_size   = v.fileSize;

  if (v.description !== undefined) payload.description = toNull(v.description);

  const { data, error } = await supabase
    .from('products')
    .update(payload as ProductsUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProductsRow;
}
