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

  // Müşteri kalıbı ise boş bırakılabilsin
  category?: string | null;
  subCategory?: string | null;

  categoryId?: string | null;
  subCategoryId?: string | null;

  date: string;
  revisionDate?: string | null;

  // Artık tek kaynak: gr/m
  unitWeightG?: number | null;

  hasCustomerMold?: boolean;
  availability?: boolean;

  drawer?: string | null;
  control?: string | null;
  scale?: string | null;

  outerSizeMm?: number | null;
  sectionMm2?: number | null;

  // YENİ: et kalınlığı (mm)
  wallThicknessMm?: number | null;

  tempCode?: string | null;
  profileCode?: string | null; // geriye uyumluluk
  manufacturerCode?: string | null;

  // Eski kodu kırmamak için duruyor; servis bunu artık kullanmaz.
  file?: File | null;

  image?: string | null;

  // upload metadatası
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

// gr/m değerini güvenli şekilde integer'a yuvarla
function normalizeGpm(v: number | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/* -------------------------------------------------------
 * CREATE: sadece DB insert — upload işi dışarıda (signed upload)
 * ----------------------------------------------------- */
export async function createProduct(v: CreateProductInput): Promise<string | undefined> {
  // Tek kaynak: unitWeightG (gr/m)
  const gpm = normalizeGpm(v.unitWeightG ?? null);

  const payload = {
    name: v.name,
    code: v.code,
    variant: v.variant,

    category: v.category ?? null,
    sub_category: v.subCategory ?? null,
    
    category_id: v.categoryId ?? null,
    subcategory_id: v.subCategoryId ?? null,

    date: v.date,

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

    file_bucket: v.fileBucket ?? null,
    file_path:   v.filePath   ?? null,
    file_name:   v.fileName   ?? null,
    file_ext:    v.fileName?.split('.').pop()?.toLowerCase() ?? null,
    file_mime:   v.fileMime   ?? null,
    file_size:   v.fileSize   ?? null,

    description: toNull(v.description ?? null),
  } as ProductsInsert;

  // YENİ: wall_thickness_mm kolonu
  (payload as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm =
    v.wallThicknessMm ?? null;

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id as string | undefined;
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

export async function deleteProductById(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductsByIds(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------
 * UPDATE: yalnızca gelen alanları güncelle — upload yok
 * ----------------------------------------------------- */
export type UpdateProductInput =
  Partial<Omit<CreateProductInput, 'file'>> & { file?: File | null };

export async function updateProduct(id: string, v: UpdateProductInput): Promise<ProductsRow> {
  type ProductsUpdateWithWeight = ProductsUpdate & {
    unit_weight_g_pm?: number | null;
  };

  const payload: ProductsUpdateWithWeight = {} as ProductsUpdateWithWeight;

  if (v.name !== undefined) payload.name = v.name;
  if (v.code !== undefined) payload.code = v.code;
  if (v.variant !== undefined) payload.variant = v.variant;

  if (v.category !== undefined)      payload.category = v.category ?? null;
  if (v.subCategory !== undefined)   payload.sub_category = v.subCategory ?? null;
  if (v.categoryId !== undefined)    payload.category_id = v.categoryId ?? null;
  if (v.subCategoryId !== undefined) payload.subcategory_id = v.subCategoryId ?? null;

  if (v.date !== undefined) payload.date = v.date;

  if (v.revisionDate !== undefined) {
    (payload as unknown as { revision_date?: string | null }).revision_date =
      toNull(v.revisionDate);
  }

  // Tek kaynak: unitWeightG (gr/m)
  if (v.unitWeightG !== undefined) {
    const gpm = normalizeGpm(v.unitWeightG ?? null);
    payload.unit_weight_g_pm = gpm == null ? 0 : gpm;
  }

  if (v.drawer !== undefined)      payload.drawer = toNull(v.drawer);
  if (v.control !== undefined)     payload.control = toNull(v.control);
  if (v.scale !== undefined)       payload.scale = toNull(v.scale);
  if (v.outerSizeMm !== undefined) payload.outer_size_mm = v.outerSizeMm ?? null;
  if (v.sectionMm2 !== undefined)  payload.section_mm2 = v.sectionMm2 ?? null;

  if (v.wallThicknessMm !== undefined) {
    (payload as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm =
      v.wallThicknessMm ?? null;
  }

  if (v.tempCode !== undefined)         payload.temp_code = toNull(v.tempCode);
  if (v.manufacturerCode !== undefined) payload.manufacturer_code = toNull(v.manufacturerCode);

  if (v.image !== undefined) payload.image = v.image ?? null;

  if (v.hasCustomerMold !== undefined) {
    (payload as unknown as { has_customer_mold?: boolean | null }).has_customer_mold =
      v.hasCustomerMold;
  }

  if (v.availability !== undefined) payload.availability = v.availability;

  if (v.fileBucket !== undefined) payload.file_bucket = v.fileBucket ?? null;
  if (v.filePath !== undefined)   payload.file_path   = v.filePath   ?? null;
  if (v.fileName !== undefined)   payload.file_name   = v.fileName   ?? null;
  if (v.fileMime !== undefined)   payload.file_mime   = v.fileMime   ?? null;
  if (v.fileSize !== undefined)   payload.file_size   = v.fileSize   ?? null;

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
