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

  unitWeightG: number | null;

  hasCustomerMold?: boolean;

  availability?: boolean;

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

function toNull(v?: string | null) {
  const s = typeof v === 'string' ? v.trim() : v ?? '';
  return s ? s : null;
}

async function removeSafe(bucket?: string | null, path?: string | null): Promise<void> {
  if (!bucket || !path) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Sessizce yut. Rollback yardımcı çağrı başarısız olabilir; kritik değil.
  }
}

// -------------------------------------------------------
// CREATE: dosya varsa yükle → insert; insert fail ise dosyayı geri al
// -------------------------------------------------------
export async function createProduct(v: CreateProductInput) {
  let fileMeta: {
    path?: string; name?: string; mime?: string; size?: number; ext?: string;
  } = {};
  let uploadedPath: string | null = null;

  try {
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

      uploadedPath = key;
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

      ...(v.hasCustomerMold !== undefined
        ? { has_customer_mold: v.hasCustomerMold }
        : {}),

      availability: v.availability,

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
  } catch (e) {
    // Insert olmazsa yüklenen dosyayı geri al
    await removeSafe(BUCKET, uploadedPath);
    throw e;
  }
}

// -------------------------------------------------------
// DELETE helpers
// -------------------------------------------------------
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

// -------------------------------------------------------
// UPDATE: sadece gelen alanları güncelle
// - Yeni dosya gelirse önce yükle
// - Update başarısız olursa yeni dosyayı geri al
// - Update başarılı olursa önceki dosyayı sil
// -------------------------------------------------------
export type UpdateProductInput =
  Partial<Omit<CreateProductInput, 'file'>> & { file?: File | null };

export async function updateProduct(id: number, v: UpdateProductInput): Promise<ProductsRow> {
  // 0) Eski dosya meta (gerekirse temizlemek için)
  const { data: before } = await supabase
    .from('products')
    .select('file_bucket, file_path')
    .eq('id', id)
    .maybeSingle();

  // 1) Yeni dosya varsa yükle
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

  if (v.name !== undefined) payload.name = v.name;
  if (v.code !== undefined) payload.code = v.code;
  if (v.variant !== undefined) payload.variant = v.variant;

  if (v.category !== undefined)      payload.category = v.category ?? null;
  if (v.subCategory !== undefined)   payload.sub_category = v.subCategory ?? null;
  if (v.categoryId !== undefined)    payload.category_id = v.categoryId ?? null;
  if (v.subCategoryId !== undefined) payload.subcategory_id = v.subCategoryId ?? null;

  if (v.date !== undefined) payload.date = v.date;

  if (v.unitWeightG !== undefined) {
    payload.unit_weight_g_pm = v.unitWeightG == null
      ? 0
      : Math.round(Number(v.unitWeightG));
  }

  if (v.drawer !== undefined)           payload.drawer = toNull(v.drawer);
  if (v.control !== undefined)          payload.control = toNull(v.control);
  if (v.scale !== undefined)            payload.scale = toNull(v.scale);
  if (v.outerSizeMm !== undefined)      payload.outer_size_mm = v.outerSizeMm ?? null;
  if (v.sectionMm2 !== undefined)       payload.section_mm2 = v.sectionMm2 ?? null;
  if (v.tempCode !== undefined)         payload.temp_code = toNull(v.tempCode);
  if (v.profileCode !== undefined)      payload.profile_code = toNull(v.profileCode);
  if (v.manufacturerCode !== undefined) payload.manufacturer_code = toNull(v.manufacturerCode);

  if (v.image !== undefined) payload.image = v.image ?? null;

  if (v.hasCustomerMold !== undefined) {
    payload.has_customer_mold = v.hasCustomerMold;
  }

  if (v.availability !== undefined) payload.availability = v.availability;

  if (fileMeta) {
    payload.file_path = fileMeta.path;
    payload.file_name = fileMeta.name;
    payload.file_ext  = fileMeta.ext;
    payload.file_mime = fileMeta.mime;
    payload.file_size = fileMeta.size;
    payload.file_bucket = BUCKET;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Yeni dosya yüklendiyse eskiyi temizle
    if (fileMeta) {
      await removeSafe(before?.file_bucket ?? null, before?.file_path ?? null);
    }

    return data as ProductsRow;
  } catch (e) {
    // Update fail olursa yeni dosyayı geri al
    if (fileMeta) {
      await removeSafe(BUCKET, fileMeta.path);
    }
    throw e;
  }
}
