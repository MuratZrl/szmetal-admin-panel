// src/features/products/services/products.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';

type ProductsInsert = Database['public']['Tables']['products']['Insert'];

// Formdan gerçekten gelen TÜM alanlar
export type CreateProductInput = {
  name: string;
  code: string;
  variant: string;

  // Kategori seçimi ID bazlı olmalı (önerilen)
  categoryId?: string | null;
  subCategoryId?: string | null;

  // Eğer tablonda ayrıca text kolonlar da varsa ve doldurmak istiyorsan:
  // formdan gelen metin alanları (DB’de required)
  category: string;       // ← artık zorunlu
  subCategory: string;    // ← artık zorunlu

  date: string; // formdan gelen yyyy-mm-dd

  // ARTIK GRAM/M
  unit_weight_g_pm?: number | null;

  // Teknik ve opsiyonel alanlar
  drawer?: string | null;
  control?: string | null;
  scale?: string | null;

  outerSizeMm?: number | null;
  sectionMm2?: number | null;

  tempCode?: string | null;
  profileCode?: string | null;
  manufacturerCode?: string | null;

  // Dosya & görsel
  file?: File | null;          // PDF dosyası
  image?: string | null;       // public URL (opsiyonel)
};

const BUCKET = 'product-media';

export async function createProduct(v: CreateProductInput) {
  // 1) Dosya varsa önce yükle
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

  // 2) Insert payload: camelCase → snake_case
  const payload: ProductsInsert = {
    name: v.name,
    code: v.code,
    variant: v.variant,

    // Eğer tablonda text category/sub_category kolonları da varsa doldur
    // (yoksa bu iki satırı sil)
    category: v.category ?? null,
    sub_category: v.subCategory ?? null,

    // ID kolonları
    category_id: v.categoryId,
    subcategory_id: v.subCategoryId,

    date: v.date, // formdan gelsin, bugün tarihi ile ezme

    unit_weight_g_pm: v.unit_weight_g_pm ?? 0,

    // teknik alanlar (trim → boşsa null)
    drawer: toNull(v.drawer),
    control: toNull(v.control),
    scale: toNull(v.scale),

    outer_size_mm: v.outerSizeMm ?? null,
    section_mm2: v.sectionMm2 ?? null,

    temp_code: toNull(v.tempCode),
    profile_code: toNull(v.profileCode),
    manufacturer_code: toNull(v.manufacturerCode),

    image: v.image ?? null,

    // dosya meta
    file_path: fileMeta.path ?? null,
    file_name: fileMeta.name ?? null,
    file_ext:  fileMeta.ext  ?? null,
    file_mime: fileMeta.mime ?? null,
    file_size: fileMeta.size ?? null,
    file_bucket: fileMeta.path ? BUCKET : null,
  };

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

export async function deleteProductById(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductsByIds(ids: number[]) {
  if (!ids.length) return;
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw new Error(error.message);
}
