// src/features/products/services/products.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';

type ProductsInsert = Database['public']['Tables']['products']['Insert'];

export type CreateProductInput = {
  displayName: string;
  name: string;
  code: string;
  variant: string;
  category: string;
  subCategory: string;
  unitWeightKg?: number;
  // yeni:
  file?: File | null;
  image?: string | null; // istersen kalsın; opsiyonel
};

const BUCKET = 'product-media';

export async function createProduct(v: CreateProductInput) {
  
  // 1) Dosya varsa önce yükle
  let fileMeta: {
    path?: string; name?: string; mime?: string; size?: number; ext?: string;
  } = {};

  if (v.file && v.file.size > 0) {
    // Basit boyut kontrolü (örnek 200MB)
    const MAX = 200 * 1024 * 1024;
    if (v.file.size > MAX) throw new Error('Dosya 200MB sınırını aşıyor.');

    const ext = v.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    // benzersiz anahtar
    const key = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(key, v.file, {
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

  // 2) Ürünü ekle
  const payload: ProductsInsert = {
    display_name: v.displayName,
    name: v.name,
    code: v.code,
    variant: v.variant,
    category: v.category,
    sub_category: v.subCategory,
    unit_weight_kg: v.unitWeightKg ?? 0,   // şema nullable ise
    image: v.image ?? null,                    // şema nullable ise
    date: new Date().toISOString().slice(0, 10),
    category_id: null,
    subcategory_id: null,

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

export async function deleteProductById(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductsByIds(ids: number[]) {
  if (!ids.length) return;
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw new Error(error.message);
}