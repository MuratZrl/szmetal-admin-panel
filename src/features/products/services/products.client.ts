// src/features/products/services/products.client.ts
'use client';

import { capitalizeProductName } from '@/utils/capitalizeProductName';

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';

type ProductsInsert = Database['public']['Tables']['products']['Insert'];
type ProductsUpdate = Database['public']['Tables']['products']['Update'];
type ProductsRow    = Database['public']['Tables']['products']['Row'];

/**
 * Form sırasına göre düzenlenmiş CreateProductInput
 */
export type CreateProductInput = {
  // 1) Temel metinler
  name: string;
  code: string;

  // 2) Müşteri kalıbı + kullanılabilirlik
  hasCustomerMold?: boolean;
  availability?: boolean;

  // 3) Kategori alanları
  // UI tarafında: sadece görüntü için (DB'ye yazılmıyor)
  category?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;

  // Gerçekte DB'ye gidecek olan ilişki (yaprak kategori)
  categoryId?: string | null;

  // 4) Varyant
  variant: string;

  // 5) Ağırlık ve ölçü alanları
  unitWeightG?: number | null;
  wallThicknessMm?: number | null;

  outerSizeMm?: number | null;
  sectionMm2?: number | null;

  // 6) Tarih alanları
  date: string;
  revisionDate?: string | null;

  // 7) Teknik / çizim alanları
  drawer?: string | null;
  control?: string | null;
  scale?: string | null;

  // 8) Kod alanları
  tempCode?: string | null;
  profileCode?: string | null;        // DB'ye yazılmıyor, UI/gelecek için
  manufacturerCode?: string | null;

  // 9) Açıklama
  description?: string | null;

  // 10) Görsel
  image?: string | null;

  // 11) Dosya upload (storage metadata)
  file?: File | null;

  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;
};

function toNull(v?: string | null) {
  const s = typeof v === 'string' ? v.trim() : v ?? '';
  return s ? s : null;
}

function normalizeGpm(v: number | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function createProduct( v: CreateProductInput ): Promise<string | undefined> {

  const gpm = normalizeGpm(v.unitWeightG ?? null);

  const payload: ProductsInsert = {
    // 1) Temel metinler

    // ✅ DB'ye giderken normalize
    name: capitalizeProductName(v.name),
    code: v.code,

    // 2) Varyant
    variant: v.variant,

    // 3) Kategori ilişkisi
    category_id: v.categoryId ?? null,

    // 4) Tarihler
    date: v.date,
    revision_date: toNull(v.revisionDate ?? null),

    // 5) Ağırlık / ölçü
    ...(gpm != null ? { unit_weight_g_pm: gpm } : {}),
    
    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    // 6) Teknik / çizim
    drawer: toNull(v.drawer),
    control: toNull(v.control),
    scale: toNull(v.scale),

    // 7) Kod alanları
    temp_code: toNull(v.tempCode),
    manufacturer_code: toNull(v.manufacturerCode),

    // 8) Görsel
    image: v.image ?? null,

    // 9) Müşteri kalıbı + availability
    ...(v.hasCustomerMold !== undefined
      ? { has_customer_mold: v.hasCustomerMold }
      : {}),
    availability: v.availability,

    // 10) Açıklama
    description: toNull(v.description ?? null),

    // 11) Dosya metadata
    file_bucket: v.fileBucket ?? null,
    file_path:   v.filePath   ?? null,
    file_name:   v.fileName   ?? null,
    file_ext:    v.fileName?.split('.').pop()?.toLowerCase() ?? null,
    file_mime:   v.fileMime   ?? null,
    file_size:   v.fileSize   ?? null,
  } as ProductsInsert;

  // Et kalınlığı (DB tarafında extra kolon)
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

/**
 * Update de aynı alan setini kullanıyor, sadece her şey optional
 */
export type UpdateProductInput =
  Partial<Omit<CreateProductInput, 'file'>> & { file?: File | null };

export async function updateProduct( id: string, v: UpdateProductInput ): Promise<ProductsRow> {

  type ProductsUpdateWithWeight = ProductsUpdate & {
    unit_weight_g_pm?: number | null;
  };

  const payload: ProductsUpdateWithWeight = {} as ProductsUpdateWithWeight;

  // 1) Temel metinler
   // ✅ normalize
  if (v.name !== undefined) payload.name = capitalizeProductName(v.name);
  if (v.code !== undefined) payload.code = v.code;

  // 2) Varyant
  if (v.variant !== undefined) payload.variant = v.variant;

  // 3) Kategori ilişkisi
  if (v.categoryId !== undefined) {
    payload.category_id = v.categoryId ?? null;
  }
  // v.category, v.subCategory, v.subSubCategory sadece UI, DB'ye yazmıyoruz

  // 4) Tarihler
  if (v.date !== undefined) payload.date = v.date;

  if (v.revisionDate !== undefined) {
    (payload as unknown as { revision_date?: string | null }).revision_date =
      toNull(v.revisionDate);
  }

  // 5) Ağırlık / ölçü
  if (v.unitWeightG !== undefined) {
    const gpm = normalizeGpm(v.unitWeightG ?? null);
    payload.unit_weight_g_pm = gpm == null ? 0 : gpm;
  }

  if (v.outerSizeMm !== undefined) {
    payload.outer_size_mm = v.outerSizeMm ?? null;
  }

  if (v.sectionMm2 !== undefined) {
    payload.section_mm2 = v.sectionMm2 ?? null;
  }

  if (v.wallThicknessMm !== undefined) {
    (payload as unknown as { wall_thickness_mm?: number | null }).wall_thickness_mm =
      v.wallThicknessMm ?? null;
  }

  // 6) Teknik / çizim alanları
  if (v.drawer !== undefined)  payload.drawer  = toNull(v.drawer);
  if (v.control !== undefined) payload.control = toNull(v.control);
  if (v.scale !== undefined)   payload.scale   = toNull(v.scale);

  // 7) Kod alanları
  if (v.tempCode !== undefined) {
    payload.temp_code = toNull(v.tempCode);
  }

  if (v.manufacturerCode !== undefined) {
    payload.manufacturer_code = toNull(v.manufacturerCode);
  }

  // profileCode yine UI-only, DB'ye yazmıyoruz

  // 8) Görsel
  if (v.image !== undefined) {
    payload.image = v.image ?? null;
  }

  // 9) Müşteri kalıbı + availability
  if (v.hasCustomerMold !== undefined) {
    (payload as unknown as { has_customer_mold?: boolean | null }).has_customer_mold =
      v.hasCustomerMold;
  }

  if (v.availability !== undefined) {
    payload.availability = v.availability;
  }

  // 10) Açıklama
  if (v.description !== undefined) {
    payload.description = toNull(v.description);
  }

  // 11) Dosya metadata
  if (v.fileBucket !== undefined) payload.file_bucket = v.fileBucket ?? null;
  if (v.filePath !== undefined)   payload.file_path   = v.filePath   ?? null;
  if (v.fileName !== undefined)   payload.file_name   = v.fileName   ?? null;
  if (v.fileMime !== undefined)   payload.file_mime   = v.fileMime   ?? null;
  if (v.fileSize !== undefined)   payload.file_size   = v.fileSize   ?? null;
  // file_ext burada değiştirmiyoruz; create sırasında set edilmiş oluyor

  const { data, error } = await supabase
    .from('products')
    .update(payload as ProductsUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProductsRow;
}

// Ham DB fonksiyonları da normalize etmezsen “bir yerden yine kirlenir”
export async function createProductDb(payload: ProductsInsert): Promise<string | undefined> {
  const normalized: ProductsInsert = {
    ...payload,
    name: payload.name ? capitalizeProductName(payload.name) : payload.name,
  };

  const { data, error } = await supabase.from('products').insert(normalized).select('id').single();
  if (error) throw new Error(error.message);
  return data?.id as string | undefined;
}

export async function updateProductDb(id: string, patch: ProductsUpdate): Promise<ProductsRow> {
  const normalized: ProductsUpdate = {
    ...patch,
    name: patch.name ? capitalizeProductName(patch.name) : patch.name,
  };

  const { data, error } = await supabase.from('products').update(normalized).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as ProductsRow;
}