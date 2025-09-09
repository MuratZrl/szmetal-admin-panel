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
  subCategoryId?: string;

  date: string;

  unitWeightG: number | null;

  drawer?: string | null;
  control?: string | null;
  scale?: string | null;

  outerSizeMm?: number | null;
  sectionMm2?: number | null;

  tempCode?: string | null;
  profileCode?: string | null;
  manufacturerCode?: string | null;

  file?: File | null;
  image?: string | null;
};

const BUCKET = 'product-media' as const;

// -------------------------------------------------------
// VAR OLAN createProduct (dokunmak zorunda değilsin)
// -------------------------------------------------------
export async function createProduct(v: CreateProductInput) {
  let fileMeta: {
    path?: string; name?: string; mime?: string; size?: number; ext?: string;
  } = {};

  if (v.file && v.file.size > 0) {
    const MAX = 10 * 1024 * 1024;
    if (v.file.size > MAX) throw new Error('Dosya 10MB sınırını aşıyor.');

    const ext = v.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, v.file, {
      cacheControl: '3600',
      contentType: v.file.type || 'application/octet-stream',
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);

    fileMeta = {
      path: key,
      name: v.file.name,
      mime: v.file.type || 'application/octet-stream',
      size: v.file.size,
      ext,
    };
  }

  const payload = {
    name: v.name,
    code: v.code,
    variant: v.variant,

    category: v.category ?? null,
    sub_category: v.subCategory,
    category_id: v.categoryId ?? null,
    subcategory_id: v.subCategoryId ?? null,

    date: v.date,

    ...(v.unitWeightG != null
      ? { unit_weight_g_pm: Math.round(Number(v.unitWeightG)) }
      : {}),

    drawer: toNull(v.drawer),
    control: toNull(v.control),
    scale: toNull(v.scale),

    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    temp_code: toNull(v.tempCode),
    profile_code: toNull(v.profileCode),
    manufacturer_code: toNull(v.manufacturerCode),

    image: v.image ?? null,

    file_path: fileMeta.path ?? null,
    file_name: fileMeta.name ?? null,
    file_ext:  fileMeta.ext  ?? null,
    file_mime: fileMeta.mime ?? null,
    file_size: fileMeta.size ?? null,
    file_bucket: fileMeta.path ? BUCKET : null,

  } satisfies ProductsInsert;

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id as number | undefined;
}

function toNull(v?: string | null) {
  const s = typeof v === 'string' ? v.trim() : v ?? '';
  return s ? s : null;
}

export async function deleteAllProducts(): Promise<void> {
  // Supabase delete ALL için bir filtre ister; NULL olmayan tüm id'ler:
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

// -------------------------------------------------------
// YENİ: updateProduct (yalnızca gelen alanları günceller)
// -------------------------------------------------------

export type UpdateProductInput =
  Partial<Omit<CreateProductInput, 'file'>> & { file?: File | null };

/**
 * Notlar:
 * - `UpdateProductInput` alanları kısmi. undefined olanları DB’de ELLEMEYİZ.
 * - Bir alanı NULL yapmak istiyorsan onu açıkça `null` gönder.
 * - `file` gönderirsen storage’a yükler ve file_* metalarını günceller.
 * - Image URL güncellemek için `image` alanını gönder; undefined göndermezsen dokunmayız.
 */
export async function updateProduct(id: number, v: UpdateProductInput): Promise<ProductsRow> {
  // 1) Dosya geldiyse yükle ve meta hazırla
  let fileMeta:
    | { path: string; name: string; mime: string; size: number; ext: string }
    | null = null;

  if (v.file && v.file.size > 0) {
    const MAX = 10 * 1024 * 1024;
    if (v.file.size > MAX) throw new Error('Dosya 10MB sınırını aşıyor.');

    const ext = v.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, v.file, {
      cacheControl: '3600',
      contentType: v.file.type || 'application/octet-stream',
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);

    fileMeta = {
      path: key,
      name: v.file.name,
      mime: v.file.type || 'application/octet-stream',
      size: v.file.size,
      ext,
    };
  }

  // 2) Patch payload: sadece gelen alanları doldur
  const payload: ProductsUpdate = {};

  // Zorunlu metinler (geldiyse)
  if (v.name !== undefined) payload.name = v.name;
  if (v.code !== undefined) payload.code = v.code;
  if (v.variant !== undefined) payload.variant = v.variant;

  // Kategoriler
  if (v.category !== undefined)      payload.category = v.category ?? null;
  if (v.subCategory !== undefined)   payload.sub_category = v.subCategory ?? null;
  if (v.categoryId !== undefined)    payload.category_id = v.categoryId ?? null;
  if (v.subCategoryId !== undefined) payload.subcategory_id = v.subCategoryId ?? null;

  // Tarih
  if (v.date !== undefined) payload.date = v.date;

  // Ağırlık
  if (v.unitWeightG !== undefined) {
    payload.unit_weight_g_pm =
      v.unitWeightG == null ? 0 : Math.round(Number(v.unitWeightG));
  }

  // Teknik
  if (v.drawer !== undefined)           payload.drawer = toNull(v.drawer);
  if (v.control !== undefined)          payload.control = toNull(v.control);
  if (v.scale !== undefined)            payload.scale = toNull(v.scale);
  if (v.outerSizeMm !== undefined)      payload.outer_size_mm = v.outerSizeMm ?? null;
  if (v.sectionMm2 !== undefined)       payload.section_mm2 = v.sectionMm2 ?? null;
  if (v.tempCode !== undefined)         payload.temp_code = toNull(v.tempCode);
  if (v.profileCode !== undefined)      payload.profile_code = toNull(v.profileCode);
  if (v.manufacturerCode !== undefined) payload.manufacturer_code = toNull(v.manufacturerCode);

  // Görsel/PDF URL
  if (v.image !== undefined) payload.image = v.image ?? null;

  // Dosya meta: SADECE yeni dosya varsa güncelle
  if (fileMeta) {
    payload.file_path = fileMeta.path;
    payload.file_name = fileMeta.name;
    payload.file_ext  = fileMeta.ext;
    payload.file_mime = fileMeta.mime;
    payload.file_size = fileMeta.size;
    payload.file_bucket = BUCKET;
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
